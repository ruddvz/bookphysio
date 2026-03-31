import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createOrderSchema } from '@/lib/validations/payment'
import { createOrder, calculateGst } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Read with authenticated client — RLS ensures patient owns the appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, fee_inr, status')
    .eq('id', parsed.data.appointment_id)
    .eq('patient_id', user.id)
    .single()

  if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (appointment.status !== 'pending') return NextResponse.json({ error: 'Appointment already paid' }, { status: 409 })

  const gstAmount = calculateGst(appointment.fee_inr as number)
  const totalAmount = (appointment.fee_inr as number) + gstAmount

  const order = await createOrder(totalAmount, appointment.id as string)

  // Write with admin client — no INSERT RLS policy on payments table
  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .insert({
      appointment_id: appointment.id,
      razorpay_order_id: order.id,
      amount_inr: totalAmount,
      gst_amount_inr: gstAmount,
      status: 'created',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })

  return NextResponse.json({
    payment,
    razorpay_order_id: order.id,
    amount_paise: totalAmount * 100,
    key_id: process.env.RAZORPAY_KEY_ID,
  })
}
