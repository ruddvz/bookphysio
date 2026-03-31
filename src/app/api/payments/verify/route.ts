import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { verifyPaymentSchema } from '@/lib/validations/payment'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = verifyPaymentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_id } = parsed.data

  // 1. Verify signature
  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 2. Verify the appointment belongs to the authenticated user
  const { data: appointmentCheck } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointment_id)
    .eq('patient_id', user.id)
    .single()

  if (!appointmentCheck) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  // 3. Update payment status (admin client — no UPDATE RLS policy on payments)
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'paid',
      razorpay_payment_id,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('appointment_id', appointment_id)
    .select('appointment_id')
    .single()

  if (paymentError) {
    console.error('Payment update error:', paymentError)
    return NextResponse.json({ error: 'Failed to update payment record' }, { status: 500 })
  }

  // 4. Update appointment status (admin client for consistency)
  const { data: appointment, error: appointmentError } = await supabaseAdmin
    .from('appointments')
    .update({
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointment_id)
    .select('availability_id')
    .single()

  if (appointmentError) {
    console.error('Appointment update error:', appointmentError)
    return NextResponse.json({ error: 'Failed to confirm appointment' }, { status: 500 })
  }

  // 5. Mark availability slot as booked (best-effort)
  if (appointment?.availability_id) {
    const { error: slotError } = await supabaseAdmin
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', appointment.availability_id)

    if (slotError) {
      console.error('Availability update error:', slotError)
    }
  }

  return NextResponse.json({ success: true })
}
