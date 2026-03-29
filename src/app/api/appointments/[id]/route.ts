import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelAppointmentSchema } from '@/lib/validations/booking'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('appointments')
    .select('*, availabilities (*), locations (*), providers (*, users!inner (full_name, avatar_url))')
    .eq('id', id)
    .or(`patient_id.eq.${user.id},provider_id.eq.${user.id}`)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only cancellation is supported via PATCH
  if (body.action !== 'cancel') return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const parsed = cancelAppointmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, status, patient_id, availability_id')
    .eq('id', id)
    .eq('patient_id', user.id)
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (!['pending', 'confirmed'].includes(appt.status as string)) {
    return NextResponse.json({ error: 'Appointment cannot be cancelled' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })

  // Free up the slot
  await supabase.from('availabilities').update({ is_booked: false }).eq('id', appt.availability_id as string)

  return NextResponse.json(data)
}
