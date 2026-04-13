import { NextResponse, type NextRequest } from 'next/server'
import { sendReviewPrompt } from '@/lib/resend'

/** Window boundaries for finding recently-completed appointments (hours ago). */
const REVIEW_WINDOW_START_HOURS = 28
const REVIEW_WINDOW_END_HOURS = 20

/**
 * POST /api/cron/review-prompts
 *
 * Designed to be called by a cron scheduler (e.g. Vercel Cron, external cron).
 * Finds completed appointments from ~24h ago that have no review yet, and
 * sends a review request email to each patient.
 *
 * Protected by CRON_SECRET env var to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Find appointments completed 20-28 hours ago (window to avoid duplicates)
  const now = new Date()
  const windowStart = new Date(now.getTime() - REVIEW_WINDOW_START_HOURS * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() - REVIEW_WINDOW_END_HOURS * 60 * 60 * 1000)

  const { data: appointments, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id,
      patient_id,
      provider_id,
      status,
      availabilities (starts_at, ends_at)
    `)
    .eq('status', 'completed')
    .gte('updated_at', windowStart.toISOString())
    .lte('updated_at', windowEnd.toISOString())

  if (error) {
    console.error('[cron/review-prompts] Query error:', error)
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
  }

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No appointments in review window' })
  }

  // Filter out appointments that already have a review
  const appointmentIds = appointments.map((a) => a.id)
  const { data: existingReviews } = await supabaseAdmin
    .from('reviews')
    .select('appointment_id')
    .in('appointment_id', appointmentIds)

  const reviewedIds = new Set((existingReviews ?? []).map((r) => r.appointment_id))
  const unreviewedAppointments = appointments.filter((a) => !reviewedIds.has(a.id))

  if (unreviewedAppointments.length === 0) {
    return NextResponse.json({ sent: 0, message: 'All appointments already reviewed' })
  }

  // Fetch patient and provider details
  const patientIds = [...new Set(unreviewedAppointments.map((a) => a.patient_id).filter(Boolean))]
  const providerIds = [...new Set(unreviewedAppointments.map((a) => a.provider_id).filter(Boolean))]

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

  for (const appointment of unreviewedAppointments) {
    const patient = patientMap.get(appointment.patient_id)
    const provider = providerMap.get(appointment.provider_id)

    if (!patient?.email || !provider?.full_name) continue

    try {
      await sendReviewPrompt({
        to: patient.email,
        patientName: patient.full_name ?? 'there',
        providerName: provider.full_name.startsWith('Dr.')
          ? provider.full_name
          : `Dr. ${provider.full_name}`,
        appointmentId: appointment.id,
      })
      sent++
    } catch (err) {
      errors.push(`Failed for appointment ${appointment.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({
    sent,
    total: unreviewedAppointments.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
