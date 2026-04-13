import { NextResponse, type NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendBookingConfirmation } from '@/lib/resend'
import { sendBookingConfirmationSms } from '@/lib/msg91'

// NOTE: The create-order and verify endpoints are intentionally disabled (503) while
// the payment flow is being re-architected. This webhook remains active to handle
// Razorpay's retry-delivery of any events from previously created orders, ensuring
// idempotent payment completion for in-flight orders. HMAC verification + idempotency
// checks guard against replay attacks. Re-enable create-order/verify alongside this
// when the payment flow is officially re-launched.

// Razorpay webhook payload shapes (minimal — only what we act on)
interface RazorpayPaymentEntity {
  id: string
  order_id: string
  amount: number // paise
  status: string
}

interface RazorpayWebhookPayload {
  event: string
  payload: {
    payment?: {
      entity: RazorpayPaymentEntity
    }
  }
}

export async function POST(request: NextRequest) {
  // 1. Read raw body for HMAC verification — must happen before any parsing
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse payload
  let payload: RazorpayWebhookPayload
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Only handle payment.captured — ignore all other events
  if (payload.event !== 'payment.captured') {
    return NextResponse.json({ received: true })
  }

  const payment = payload.payload.payment?.entity
  if (!payment?.order_id || !payment?.id) {
    return NextResponse.json({ error: 'Missing payment entity fields' }, { status: 400 })
  }

  const { order_id: razorpayOrderId, id: razorpayPaymentId } = payment

  // 4. Idempotency check — if already paid, return 200 without re-processing
  const { data: existingPayment, error: lookupError } = await supabaseAdmin
    .from('payments')
    .select('id, status, razorpay_payment_id, appointment_id')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()

  if (lookupError) {
    console.error('[webhook] Payment lookup failed:', lookupError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!existingPayment) {
    // Order not found — could be a test event or replay for an unknown order
    console.warn('[webhook] No payment record for order:', razorpayOrderId)
    return NextResponse.json({ received: true })
  }

  if (existingPayment.razorpay_payment_id) {
    // Already processed — idempotent 200
    return NextResponse.json({ received: true })
  }

  // 5. Mark payment as paid and confirm appointment — atomic via sequential admin calls
  const { error: paymentUpdateError } = await supabaseAdmin
    .from('payments')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      status: 'paid',
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('status', 'created') // Guard: only transition from 'created'

  if (paymentUpdateError) {
    console.error('[webhook] Payment update failed:', paymentUpdateError)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }

  const { error: appointmentUpdateError } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', existingPayment.appointment_id)
    .eq('status', 'pending') // Guard: only transition from 'pending'

  if (appointmentUpdateError) {
    console.error('[webhook] Appointment confirmation failed:', appointmentUpdateError)
    // Payment is already marked paid — log but don't fail the webhook
    // A follow-up job or admin can reconcile the appointment status
  }

  // 6. Send booking confirmation email (best-effort — do not fail webhook on email error)
  try {
    const { data: appt } = await supabaseAdmin
      .from('appointments')
      .select('patient_id, provider_id, availability_id, visit_type, fee_inr, availabilities (starts_at)')
      .eq('id', existingPayment.appointment_id)
      .single()

    if (appt) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('full_name, phone')
        .eq('id', appt.patient_id)
        .single()

      const { data: provider } = await supabaseAdmin
        .from('users')
        .select('full_name')
        .eq('id', appt.provider_id)
        .single()

      if (patient && provider) {
        const startsAt = (appt.availabilities as unknown as { starts_at: string } | null)?.starts_at ?? ''
        const date = startsAt ? new Date(startsAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'TBD'
        const time = startsAt ? new Date(startsAt).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : 'TBD'

        await sendBookingConfirmation({
          to: `${patient.phone ?? ''}@sms.placeholder`, // phone-first; swap for email when available
          patientName: patient.full_name,
          providerName: provider.full_name,
          appointmentDate: date,
          appointmentTime: time,
          visitType: appt.visit_type,
          amountInr: appt.fee_inr,
        })

        // Send SMS + WhatsApp confirmation (best-effort, non-blocking)
        if (patient.phone) {
          sendBookingConfirmationSms({
            phone: patient.phone,
            patientName: patient.full_name,
            providerName: provider.full_name,
            appointmentDate: date,
            appointmentTime: time,
            feeInr: appt.fee_inr,
          }).catch((smsErr) => {
            console.error('[webhook] SMS confirmation failed (non-fatal):', smsErr)
          })
        }
      }
    }
  } catch (emailError) {
    console.error('[webhook] Confirmation email failed (non-fatal):', emailError)
  }

  return NextResponse.json({ received: true })
}
