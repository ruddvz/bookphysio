import { NextResponse, type NextRequest } from 'next/server'
import { generateText } from 'ai'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { patientModels } from '@/lib/ai-config'

/**
 * Vercel Cron Job — Daily AI Summary
 *
 * Runs daily at 8:00 AM IST (2:30 AM UTC).
 * Gathers yesterday's platform metrics, generates an AI summary via Gemini,
 * emails the summary to the admin, and stores it in the daily_summaries table.
 *
 * Cron schedule is defined in vercel.json.
 * Protected by Vercel cron header validation and optional CRON_SECRET bearer validation.
 */

function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const authorizationHeader = request.headers.get('authorization')
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    return Boolean(cronSecret) && authorizationHeader === `Bearer ${cronSecret}`
  }

  if (!cronSecret) {
    // In development, allow through without a secret
    return true
  }

  return authorizationHeader === `Bearer ${cronSecret}`
}

interface DailyMetrics {
  date: string
  dateIso: string
  appointments: number
  completed: number
  cancelled: number
  noShows: number
  revenue: number
  newPatients: number
  newProviders: number
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
}

async function gatherYesterdayMetrics(): Promise<DailyMetrics> {
  const now = new Date()
  // Use IST (UTC+5:30) for "yesterday"
  const istOffset = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffset)
  const yesterdayIST = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate() - 1)
  const todayIST = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate())

  // Convert back to UTC for DB queries
  const yesterdayStart = new Date(yesterdayIST.getTime() - istOffset).toISOString()
  const todayStart = new Date(todayIST.getTime() - istOffset).toISOString()

  const dateLabel = yesterdayIST.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const [
    { data: dayAppts },
    { count: newPatientCount },
    { count: newProviderCount },
    { count: activeProviderCount },
    { count: pendingCount },
    { count: totalPatientCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('appointments')
      .select('status, fee_inr')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),

    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),

    supabaseAdmin
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),

    supabaseAdmin
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true),

    supabaseAdmin
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false),

    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient'),
  ])

  const completed = dayAppts?.filter(a => a.status === 'completed').length ?? 0
  const cancelled = dayAppts?.filter(a => a.status === 'cancelled').length ?? 0
  const noShows = dayAppts?.filter(a => a.status === 'no_show').length ?? 0
  const revenue = dayAppts
    ?.filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.fee_inr ?? 0), 0) ?? 0

  // Format yesterday's IST date as YYYY-MM-DD for DB storage
  const yyyy = yesterdayIST.getFullYear()
  const mm = String(yesterdayIST.getMonth() + 1).padStart(2, '0')
  const dd = String(yesterdayIST.getDate()).padStart(2, '0')
  const dateIso = `${yyyy}-${mm}-${dd}`

  return {
    date: dateLabel,
    dateIso,
    appointments: dayAppts?.length ?? 0,
    completed,
    cancelled,
    noShows,
    revenue,
    newPatients: newPatientCount ?? 0,
    newProviders: newProviderCount ?? 0,
    activeProviders: activeProviderCount ?? 0,
    pendingApprovals: pendingCount ?? 0,
    totalPatients: totalPatientCount ?? 0,
  }
}

function buildDailySummaryPrompt(metrics: DailyMetrics): string {
  return `You are the AI operations analyst for BookPhysio.in, India's physiotherapy booking platform.

Generate a concise daily email summary for the admin based on yesterday's metrics.

YESTERDAY'S DATA (${metrics.date}):
- Total appointments: ${metrics.appointments} (${metrics.completed} completed, ${metrics.cancelled} cancelled, ${metrics.noShows} no-shows)
- Revenue: ₹${metrics.revenue.toLocaleString('en-IN')}
- New patient signups: ${metrics.newPatients}
- New provider registrations: ${metrics.newProviders}
- Active verified providers: ${metrics.activeProviders}
- Pending provider approvals: ${metrics.pendingApprovals}
- Total patients: ${metrics.totalPatients}

Respond with a JSON object (no markdown, no code fences) with exactly these fields:
{
  "subject": "Short email subject line including the date",
  "summaryHtml": "HTML email body with: executive summary paragraph, key metrics table, alerts section (if any), and 2-3 recommendations. Use inline CSS. Keep it under 500 words. Include ₹ for rupee amounts.",
  "alerts": ["Array of urgent items — empty if none"],
  "healthScore": <number 1-100>
}`
}

async function sendSummaryEmail(subject: string, htmlBody: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@bookphysio.in'

  if (!resendKey || !adminEmail) {
    console.warn('[daily-summary] RESEND_API_KEY or ADMIN_EMAIL not set — skipping email')
    return false
  }

  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject,
    html: htmlBody,
  })

  if (error) {
    console.error('[daily-summary] Failed to send email:', error)
    return false
  }

  return true
}

async function storeSummary(
  metrics: DailyMetrics,
  aiResponse: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('daily_summaries')
    .upsert({
      summary_date: metrics.dateIso,
      metrics,
      ai_summary: aiResponse,
      health_score: typeof aiResponse.healthScore === 'number' ? aiResponse.healthScore : null,
      alerts: Array.isArray(aiResponse.alerts) ? aiResponse.alerts : [],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'summary_date',
    })

  if (error) {
    // Table may not exist yet — log but don't fail the cron
    console.warn('[daily-summary] Failed to store summary (table may not exist yet):', error.message)
  }
}

export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const metrics = await gatherYesterdayMetrics()

    const { text } = await generateText({
      model: patientModels,
      prompt: buildDailySummaryPrompt(metrics),
      temperature: 0.3,
      maxOutputTokens: 2000,
    })

    // Parse AI response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let aiResponse: Record<string, unknown>
    try {
      aiResponse = JSON.parse(cleaned) as Record<string, unknown>
    } catch {
      console.error('[daily-summary] Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'AI returned invalid response', raw: text },
        { status: 502 },
      )
    }

    // Send email
    const emailSent = await sendSummaryEmail(
      (aiResponse.subject as string) ?? `BookPhysio Daily Summary — ${metrics.date}`,
      (aiResponse.summaryHtml as string) ?? '<p>Summary generation failed.</p>',
    )

    // Store in database (best-effort)
    await storeSummary(metrics, aiResponse)

    return NextResponse.json({
      success: true,
      emailSent,
      date: metrics.date,
      healthScore: aiResponse.healthScore,
      alerts: aiResponse.alerts,
    })
  } catch (error) {
    console.error('[daily-summary] Cron error:', error)
    return NextResponse.json(
      { error: 'Daily summary generation failed' },
      { status: 500 },
    )
  }
}
