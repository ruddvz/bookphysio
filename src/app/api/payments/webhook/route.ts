import { NextResponse, type NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendBookingConfirmation } from '@/lib/resend'
import { sendBookingConfirmationSms } from '@/lib/msg91'
import { clearActiveBookingHold } from '@/lib/booking/active-booking-hold'

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

async function handlePaymentCaptured(payment: RazorpayPaymentEntity): Promise<NextResponse> {
  const { order_id: razorpayOrderId, id: razorpayPaymentId } = payment

  const { data: existingPayment, error: lookupError } = await supabaseAdmin
    .from('payments')
    .select('id, status, razorpay_payment_id, appointment_id, amount_inr, booking_channel')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()

  if (lookupError) {
    console.error('[webhook] Payment lookup failed:', lookupError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!existingPayment) {
    console.warn('[webhook] No payment record for order:', razorpayOrderId)
    return NextResponse.json({ received: true })
  }

  if (existingPayment.razorpay_payment_id) {
    return NextResponse.json({ received: true })
  }

  if (existingPayment.status === 'paid') {
    return NextResponse.json({ received: true })
  }

  if (typeof existingPayment.amount_inr !== 'number' || existingPayment.amount_inr <= 0) {
    console.error('[webhook] Payment record missing valid amount_inr:', {
      razorpayOrderId,
      amountInr: existingPayment.amount_inr,
    })
    return NextResponse.json({ error: 'Payment record invalid' }, { status: 500 })
  }

  const expectedAmountPaise = existingPayment.amount_inr * 100
  if (!Number.isInteger(payment.amount) || payment.amount <= 0 || payment.amount !== expectedAmountPaise) {
    console.error('[webhook] Payment amount mismatch:', {
      razorpayOrderId,
      expectedAmountPaise,
      receivedAmountPaise: payment.amount,
    })
    return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
  }

  const { data: updatedPaymentRow, error: paymentUpdateError } = await supabaseAdmin
    .from('payments')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      status: 'paid',
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('status', 'created')
    .select('id')
    .maybeSingle()

  if (paymentUpdateError) {
    console.error('[webhook] Payment update failed:', paymentUpdateError)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }

  if (!updatedPaymentRow) {
    const { data: paidReplay } = await supabaseAdmin
      .from('payments')
      .select('id, status, razorpay_payment_id')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle()

    if (paidReplay?.status === 'paid') {
      return NextResponse.json({ received: true })
    }

    console.warn('[webhook] payment.captured: update matched no rows; acknowledging to avoid retry storms:', razorpayOrderId)
    return NextResponse.json({ received: true })
  }

  const { error: appointmentUpdateError } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', existingPayment.appointment_id)
    .in('status', ['pending', 'confirmed'])

  if (appointmentUpdateError) {
    console.error('[webhook] Appointment confirmation failed:', appointmentUpdateError)
  }

  try {
    const { data: appt } = await supabaseAdmin
      .from('appointments')
      .select('patient_id, provider_id, availability_id, visit_type, fee_inr, availabilities (starts_at)')
      .eq('id', existingPayment.appointment_id)
      .single()

    if (appt) {
      const { data: patient } = await supabaseAdmin
        .from('users')
        .select('full_name, phone, email')
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

        if (patient.email) {
          try {
            await sendBookingConfirmation({
              to: patient.email,
              patientName: patient.full_name,
              providerName: provider.full_name,
              appointmentDate: date,
              appointmentTime: time,
              visitType: appt.visit_type,
              amountInr: appt.fee_inr,
            })
          } catch (emailError) {
            console.error('[webhook] Confirmation email failed (non-fatal):', emailError)
          }
        }

        if (patient.phone) {
          try {
            await sendBookingConfirmationSms({
              phone: patient.phone,
              patientName: patient.full_name,
              providerName: provider.full_name,
              appointmentDate: date,
              appointmentTime: time,
              feeInr: appt.fee_inr,
            })
          } catch (smsErr) {
            console.error('[webhook] SMS confirmation failed (non-fatal):', smsErr)
          }
        }
      }
    }
  } catch (lookupError) {
    console.error('[webhook] Notification data lookup failed (non-fatal):', lookupError)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentFailed(payment: RazorpayPaymentEntity): Promise<NextResponse> {
  const razorpayOrderId = payment.order_id
  if (!razorpayOrderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  const { data: existingPayment, error: lookupError } = await supabaseAdmin
    .from('payments')
    .select('id, status, appointment_id, booking_channel')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()

  if (lookupError) {
    console.error('[webhook] Payment lookup failed (failed event):', lookupError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!existingPayment) {
    return NextResponse.json({ received: true })
  }

  if ((existingPayment as { booking_channel?: string }).booking_channel === 'pay_at_clinic') {
    return NextResponse.json({ received: true })
  }

  if (existingPayment.status === 'paid') {
    return NextResponse.json({ received: true })
  }

  if (existingPayment.status === 'failed') {
    return NextResponse.json({ received: true })
  }

  const { data: failedUpdateRow, error: paymentUpdateError } = await supabaseAdmin
    .from('payments')
    .update({ status: 'failed' })
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('status', 'created')
    .select('id')
    .maybeSingle()

  if (paymentUpdateError) {
    console.error('[webhook] Payment failed status update error:', paymentUpdateError)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }

  if (!failedUpdateRow) {
    return NextResponse.json({ received: true })
  }

  const { data: appointment, error: apptError } = await supabaseAdmin
    .from('appointments')
    .select('id, status, availability_id')
    .eq('id', existingPayment.appointment_id)
    .maybeSingle()

  if (apptError || !appointment) {
    return NextResponse.json({ received: true })
  }

  if (appointment.status !== 'pending') {
    return NextResponse.json({ received: true })
  }

  const availabilityId = appointment.availability_id as string | null
  if (!availabilityId) {
    return NextResponse.json({ received: true })
  }

  const { error: cancelError } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointment.id)
    .eq('status', 'pending')

  if (cancelError) {
    console.error('[webhook] Failed to cancel appointment after payment failure:', cancelError)
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
  }

  const { error: releaseError } = await supabaseAdmin
    .from('availabilities')
    .update({ is_booked: false })
    .eq('id', availabilityId)

  if (releaseError) {
    console.error('[webhook] Failed to release slot after payment failure:', releaseError)
  }

  await clearActiveBookingHold(appointment.id as string)

  return NextResponse.json({ received: true })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: RazorpayWebhookPayload
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.event === 'payment.captured') {
    const payment = payload.payload.payment?.entity
    if (!payment?.order_id || !payment?.id) {
      return NextResponse.json({ error: 'Missing payment entity fields' }, { status: 400 })
    }
    return handlePaymentCaptured(payment)
  }

  if (payload.event === 'payment.failed') {
    const payment = payload.payload.payment?.entity
    if (!payment?.order_id) {
      return NextResponse.json({ error: 'Missing payment entity fields' }, { status: 400 })
    }
    return handlePaymentFailed(payment)
  }

  return NextResponse.json({ received: true })
}
