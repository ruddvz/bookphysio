import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAppointmentSchema } from '@/lib/validations/booking'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createAppointmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { provider_id, availability_id, location_id, visit_type, insurance_id, notes } = parsed.data

  // Fetch slot and fee in one query
  const { data: slot } = await supabase
    .from('availabilities')
    .select('id, is_booked, providers!inner (consultation_fee_inr)')
    .eq('id', availability_id)
    .eq('is_booked', false)
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot unavailable' }, { status: 409 })

  const feeInr = (slot.providers as unknown as { consultation_fee_inr: number }).consultation_fee_inr

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      provider_id,
      availability_id,
      location_id: location_id ?? null,
      visit_type,
      status: 'pending',
      insurance_id: insurance_id ?? null,
      fee_inr: feeInr,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[api/appointments] Insert error:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }

  return NextResponse.json(appointment, { status: 201 })
}

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('appointments')
    .select('*, availabilities (*), locations (*), providers (*, users!inner (full_name, avatar_url))')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  return NextResponse.json({ appointments: data ?? [] })
}
