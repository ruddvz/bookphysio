import { NextResponse, type NextRequest } from 'next/server'
import { sendReviewPrompt } from '@/lib/resend'
import { isAuthorizedCron } from '@/lib/server/cron-auth'

/** Window boundaries for finding recently-completed appointments (hours ago). */
const REVIEW_WINDOW_OLDEST_HOURS_AGO = 28
const REVIEW_WINDOW_NEWEST_HOURS_AGO = 20

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
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Find appointments that ended 20-28 hours ago (based on availability ends_at)
  const now = new Date()
  const windowStart = new Date(now.getTime() - REVIEW_WINDOW_OLDEST_HOURS_AGO * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() - REVIEW_WINDOW_NEWEST_HOURS_AGO * 60 * 60 * 1000)

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
    .gte('availabilities.ends_at', windowStart.toISOString())
    .lte('availabilities.ends_at', windowEnd.toISOString())

  if (error) {
    console.error('[cron/review-prompts] Query error:', error)
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
  }

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No appointments in review window' })
  }

  // Filter out appointments that already have a review
  const appointmentIds = appointments.map((a) => a.id)
  const { data: existingReviews, error: reviewsError } = await supabaseAdmin
    .from('reviews')
    .select('appointment_id')
    .in('appointment_id', appointmentIds)

  if (reviewsError) {
    console.error('[cron/review-prompts] Reviews lookup error:', reviewsError)
    return NextResponse.json({ error: 'Failed to check existing reviews' }, { status: 500 })
  }

  const reviewedIds = new Set((existingReviews ?? []).map((r) => r.appointment_id))
  const unreviewedAppointments = appointments.filter((a) => !reviewedIds.has(a.id))

  if (unreviewedAppointments.length === 0) {
    return NextResponse.json({ sent: 0, message: 'All appointments already reviewed' })
  }

  // Fetch patient and provider details
  const patientIds = [...new Set(unreviewedAppointments.map((a) => a.patient_id).filter(Boolean))]
  const providerIds = [...new Set(unreviewedAppointments.map((a) => a.provider_id).filter(Boolean))]

  const [
    { data: patients, error: patientsError },
    { data: providers, error: providersError },
  ] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .in('id', patientIds),
    supabaseAdmin
      .from('users')
      .select('id, full_name')
      .in('id', providerIds),
  ])

  if (patientsError || providersError) {
    console.error('[cron/review-prompts] User lookup error:', { patientsError, providersError })
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }

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
        providerName: provider.full_name,
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
