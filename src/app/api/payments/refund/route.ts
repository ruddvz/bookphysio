import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const refundSchema = z.object({
  appointment_id: z.string().uuid(),
})

export async function POST(_request: NextRequest) {
  // Refund flow is temporarily disabled — payment system is being re-architected.
  return NextResponse.json({ error: 'Refund system is not available yet.' }, { status: 503 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = refundSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { appointment_id } = parsed.data

  // Verify appointment belongs to patient and is cancelled
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, status, patient_id')
    .eq('id', appointment_id)
    .eq('patient_id', user.id)
    .eq('status', 'cancelled')
    .single()

  if (!appt) return NextResponse.json({ error: 'Cancelled appointment not found' }, { status: 404 })

  // Fetch the paid payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('id, razorpay_payment_id, amount_inr, status')
    .eq('appointment_id', appointment_id)
    .eq('status', 'paid')
    .single()

  if (!payment || !payment.razorpay_payment_id) {
    return NextResponse.json({ error: 'No paid payment found for this appointment' }, { status: 404 })
  }

  // Initiate Razorpay refund (full amount, in paise)
  const refund = await razorpay.payments.refund(payment.razorpay_payment_id as string, {
    amount: (payment.amount_inr as number) * 100,
    speed: 'normal',
    notes: { appointment_id },
  })

  const { error } = await supabaseAdmin
    .from('payments')
    .update({ status: 'refunded', refund_id: refund.id })
    .eq('id', payment.id)

  if (error) {
    console.error('[refund] Failed to update payment record:', error)
    // Refund was issued — log but don't fail
  }

  return NextResponse.json({ refund_id: refund.id, status: 'refunded' })
}
