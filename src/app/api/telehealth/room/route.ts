import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTelehealthRoom } from '@/lib/hundredms'
import { z } from 'zod'

const schema = z.object({ appointment_id: z.string().uuid() })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { appointment_id } = parsed.data

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, visit_type, status, patient_id, provider_id, telehealth_room_id')
    .eq('id', appointment_id)
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (appt.visit_type !== 'online') return NextResponse.json({ error: 'Not a telehealth appointment' }, { status: 400 })
  if (appt.status !== 'confirmed') return NextResponse.json({ error: 'Appointment not confirmed' }, { status: 409 })
  if (appt.patient_id !== user.id && appt.provider_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Reuse existing room if already created
  if (appt.telehealth_room_id) {
    return NextResponse.json({ room_id: appt.telehealth_room_id })
  }

  const roomId = await createTelehealthRoom(appointment_id)
  await supabase.from('appointments').update({ telehealth_room_id: roomId }).eq('id', appointment_id)

  return NextResponse.json({ room_id: roomId })
}
