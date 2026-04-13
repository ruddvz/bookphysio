import { NextResponse, type NextRequest } from 'next/server'
import { sendAppointmentReminder } from '@/lib/resend'
import { sendAppointmentReminderSms } from '@/lib/msg91'
import { formatIndiaDateTime } from '@/lib/india-date'

/** Reminder window boundaries: look for appointments starting this many hours from now. */
const REMINDER_WINDOW_START_HOURS = 23
const REMINDER_WINDOW_END_HOURS = 24

/**
 * Extracts the `starts_at` ISO string from an appointment's availability relation.
 * Supabase returns the joined row as an object (single) or array (many).
 */
function extractStartsAt(availabilities: unknown): string | null {
  const row = Array.isArray(availabilities) ? availabilities[0] : availabilities
  if (row && typeof row === 'object' && 'starts_at' in row) {
    return (row as { starts_at: string }).starts_at
  }
  return null
}

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

  // Find appointments starting 23-24 hours from now (1-hour window)
  const now = new Date()
  const windowStart = new Date(now.getTime() + REMINDER_WINDOW_START_HOURS * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_END_HOURS * 60 * 60 * 1000)

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

  const [
    { data: patients, error: patientsError },
    { data: providers, error: providersError },
  ] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, full_name, email, phone')
      .in('id', patientIds),
    supabaseAdmin
      .from('users')
      .select('id, full_name')
      .in('id', providerIds),
  ])

  if (patientsError || providersError) {
    console.error('[cron/appointment-reminders] User lookup error:', { patientsError, providersError })
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p]))
  const providerMap = new Map((providers ?? []).map((p) => [p.id, p]))

  let sent = 0
  let smsSent = 0
  const errors: string[] = []

  for (const appointment of appointments) {
    const patient = patientMap.get(appointment.patient_id)
    const provider = providerMap.get(appointment.provider_id)

    if (!provider?.full_name) continue
    if (!patient?.email && !patient?.phone) continue

    const startsAt = extractStartsAt(appointment.availabilities)
    if (!startsAt) continue

    const providerName = provider.full_name
    const patientName = patient.full_name ?? 'there'
    const dateFormatted = formatIndiaDateTime(startsAt, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const timeFormatted = formatIndiaDateTime(startsAt, {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Send email reminder (if email available)
    if (patient.email) {
      try {
        await sendAppointmentReminder({
          to: patient.email,
          patientName,
          providerName,
          appointmentDate: dateFormatted,
          appointmentTime: timeFormatted,
          visitType: appointment.visit_type,
          appointmentId: appointment.id,
        })
        sent++
      } catch (err) {
        errors.push(`Email failed for ${appointment.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Send SMS + WhatsApp reminder (if phone available, best-effort)
    if (patient.phone) {
      try {
        const smsResult = await sendAppointmentReminderSms({
          phone: patient.phone,
          patientName,
          providerName,
          appointmentDate: dateFormatted,
          appointmentTime: timeFormatted,
        })
        if (smsResult.sms || smsResult.whatsapp) smsSent++
      } catch (err) {
        errors.push(`SMS failed for ${appointment.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  return NextResponse.json({
    sent,
    smsSent,
    total: appointments.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
