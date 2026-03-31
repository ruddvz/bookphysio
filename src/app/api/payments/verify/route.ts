import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentSignature } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_id } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointment_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 1. Verify signature
  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 2. Update payment status in Supabase
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .update({ 
      status: 'paid',
      razorpay_payment_id,
      updated_at: new Date().toISOString()
    })
    .eq('razorpay_order_id', razorpay_order_id)
    .eq('appointment_id', appointment_id)
    .select('appointment_id')
    .single()

  if (paymentError) {
    console.error('Payment update error:', paymentError)
    return NextResponse.json({ error: 'Failed to update payment record' }, { status: 500 })
  }

  // 3. Update appointment status
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .update({ 
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', appointment_id)
    .eq('patient_id', user.id)
    .select('availability_id')
    .single()

  if (appointmentError) {
    console.error('Appointment update error:', appointmentError)
    return NextResponse.json({ error: 'Failed to confirm appointment' }, { status: 500 })
  }

  // 4. Mark availability slot as booked
  if (appointment?.availability_id) {
    const { error: slotError } = await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', appointment.availability_id)

    if (slotError) {
      console.error('Availability update error:', slotError)
      // We don't return error here because the payment was successful, 
      // but we should log it. In a production app, this would be handled via a transaction or cron.
    }
  }

  return NextResponse.json({ success: true })
}
