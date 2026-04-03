import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function firstValue<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Query appointments (has patient_id) and join payments
  const { data, error } = await supabaseAdmin
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
    const provider = firstValue(appt.providers)
    const providerUser = firstValue(provider?.users ?? null)
    const availability = firstValue(appt.availabilities)

    return pays.map((p) => ({
      ...p,
      appointment_id: appt.id,
      visit_type: appt.visit_type,
      fee_inr: appt.fee_inr,
      provider_name: providerUser?.full_name ?? null,
      starts_at: availability?.starts_at ?? null,
    }))
  })

  return NextResponse.json({ payments })
}
