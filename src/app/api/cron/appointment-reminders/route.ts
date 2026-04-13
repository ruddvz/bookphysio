import { NextResponse, type NextRequest } from 'next/server'
import { sendAppointmentReminder } from '@/lib/resend'
import { formatIndiaDateTime } from '@/lib/india-date'

/**
 * POST /api/cron/appointment-reminders
 *
 * Sends 24-hour advance reminders for upcoming appointments.
 * Designed to be called once per hour by a cron scheduler.
 * Protected by CRON_SECRET env var.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Find appointments starting 23-25 hours from now (1-hour window)
  const now = new Date()
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const { data: appointments, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id,
      patient_id,
      provider_id,
      visit_type,
      fee_inr,
      status,
      availabilities (starts_at, ends_at)
    `)
    .in('status', ['confirmed', 'pending'])
    .gte('availabilities.starts_at', windowStart.toISOString())
    .lte('availabilities.starts_at', windowEnd.toISOString())

  if (error) {
    console.error('[cron/appointment-reminders] Query error:', error)
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
  }

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No appointments in reminder window' })
  }

  // Fetch patient and provider details
  const patientIds = [...new Set(appointments.map((a) => a.patient_id).filter(Boolean))]
  const providerIds = [...new Set(appointments.map((a) => a.provider_id).filter(Boolean))]

  const [{ data: patients }, { data: providers }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .in('id', patientIds),
    supabaseAdmin
      .from('users')
      .select('id, full_name')
      .in('id', providerIds),
  ])

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p]))
  const providerMap = new Map((providers ?? []).map((p) => [p.id, p]))

  let sent = 0
  const errors: string[] = []

  for (const appointment of appointments) {
    const patient = patientMap.get(appointment.patient_id)
    const provider = providerMap.get(appointment.provider_id)

    if (!patient?.email || !provider?.full_name) continue

    const availability = Array.isArray(appointment.availabilities)
      ? appointment.availabilities[0]
      : appointment.availabilities
    const startsAt = availability && typeof availability === 'object' && 'starts_at' in availability
      ? (availability.starts_at as string)
      : null

    if (!startsAt) continue

    const providerName = provider.full_name.startsWith('Dr.')
      ? provider.full_name
      : `Dr. ${provider.full_name}`

    try {
      await sendAppointmentReminder({
        to: patient.email,
        patientName: patient.full_name ?? 'there',
        providerName,
        appointmentDate: formatIndiaDateTime(startsAt, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        appointmentTime: formatIndiaDateTime(startsAt, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        visitType: appointment.visit_type,
        appointmentId: appointment.id,
      })
      sent++
    } catch (err) {
      errors.push(`Failed for appointment ${appointment.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({
    sent,
    total: appointments.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
