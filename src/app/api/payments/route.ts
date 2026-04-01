import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Query appointments (has patient_id) and join payments
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, visit_type, fee_inr, created_at,
      availabilities (starts_at),
      providers (users!inner (full_name)),
      payments (id, amount_inr, gst_amount_inr, status, razorpay_payment_id, created_at)
    `)
    .eq('patient_id', user.id)
    .not('payments', 'is', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 })

  // Flatten to one record per payment
  const payments = (data ?? []).flatMap(appt => {
    const pays = Array.isArray(appt.payments) ? appt.payments : appt.payments ? [appt.payments] : []
    return pays.map((p) => ({
      ...p,
      appointment_id: appt.id,
      visit_type: appt.visit_type,
      fee_inr: appt.fee_inr,
      provider_name: (appt.providers as { users: { full_name: string } } | null)?.users?.full_name ?? null,
      starts_at: (appt.availabilities as { starts_at: string } | null)?.starts_at ?? null,
    }))
  })

  return NextResponse.json({ payments })
}
