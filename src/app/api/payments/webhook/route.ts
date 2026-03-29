import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { razorpayWebhookSchema } from '@/lib/validations/payment'
import { sendBookingConfirmation } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const parsed = razorpayWebhookSchema.safeParse(JSON.parse(body))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { event, payload } = parsed.data

  if (event === 'payment.captured' && payload.payment) {
    const { id: paymentId, order_id: orderId } = payload.payment.entity

    // Update payment status
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .update({ status: 'paid', razorpay_payment_id: paymentId })
      .eq('razorpay_order_id', orderId)
      .select('appointment_id')
      .single()

    if (payment) {
      // Confirm appointment + mark slot booked
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', payment.appointment_id)
        .select('*, availabilities (starts_at, ends_at), users!patient_id (full_name, phone), providers!inner (users!inner (full_name))')
        .single()

      if (appointment) {
        await supabaseAdmin
          .from('availabilities')
          .update({ is_booked: true })
          .eq('id', (appointment as unknown as { availability_id: string }).availability_id)

        // Send confirmation email (best-effort, don't fail webhook)
        try {
          const appt = appointment as unknown as {
            patient_id: string
            users: { full_name: string }
            providers: { users: { full_name: string } }
            availabilities: { starts_at: string }
            fee_inr: number
            visit_type: string
          }

          // Fetch patient email from auth.users (service role required)
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(appt.patient_id)
          const patientEmail = authUser?.user?.email

          if (patientEmail) {
            await sendBookingConfirmation({
              to: patientEmail,
              patientName: appt.users.full_name,
              providerName: appt.providers.users.full_name,
              appointmentDate: new Date(appt.availabilities.starts_at).toLocaleDateString('en-IN'),
              appointmentTime: new Date(appt.availabilities.starts_at).toLocaleTimeString('en-IN'),
              visitType: appt.visit_type,
              amountInr: appt.fee_inr,
            })
          }
        } catch (e) {
          console.error('[webhook] Email send failed:', e)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
