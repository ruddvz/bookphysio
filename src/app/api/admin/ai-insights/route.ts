import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { patientModels } from '@/lib/ai-config'
import { apiRatelimit } from '@/lib/upstash'

const NO_STORE = { 'Cache-Control': 'no-store' }
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...NO_STORE, ...(init?.headers ?? {}) },
  })
}

function getIstBoundaryIso(now: Date, boundary: 'day' | 'month'): string {
  const istNow = new Date(now.getTime() + IST_OFFSET_MS)
  const istBoundary = boundary === 'day'
    ? new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate())
    : new Date(istNow.getFullYear(), istNow.getMonth(), 1)

  return new Date(istBoundary.getTime() - IST_OFFSET_MS).toISOString()
}

interface PlatformSnapshot {
  todayAppointments: number
  todayCompleted: number
  todayCancelled: number
  todayRevenue: number
  weekSignups: number
  weekProviderSignups: number
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
  allTimeGmv: number
  monthGmv: number
  topConditions: string[]
}

async function gatherPlatformData(): Promise<PlatformSnapshot> {
  const now = new Date()
  const todayStart = getIstBoundaryIso(now, 'day')
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = getIstBoundaryIso(now, 'month')

  const [
    { data: todayAppts },
    { count: weekSignupCount },
    { count: weekProviderCount },
    { count: activeProviderCount },
    { count: pendingCount },
    { count: patientCount },
    { data: allCompletedAppts },
    { data: monthCompletedAppts },
    { data: conditionData },
  ] = await Promise.all([
    // Today's appointments with status
    supabaseAdmin
      .from('appointments')
      .select('status, fee_inr')
      .gte('created_at', todayStart),

    // New patient signups this week
    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient')
      .gte('created_at', weekAgo),

    // New provider signups this week
    supabaseAdmin
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo),

    // Active verified providers
    supabaseAdmin
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true),

    // Pending approvals
    supabaseAdmin
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false),

    // Total patients
    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient'),

    // All-time completed GMV
    supabaseAdmin
      .from('appointments')
      .select('fee_inr')
      .eq('status', 'completed'),

    // This month completed GMV
    supabaseAdmin
      .from('appointments')
      .select('fee_inr')
      .eq('status', 'completed')
      .gte('created_at', monthStart),

    // Top conditions from recent appointments for trend analysis
    supabaseAdmin
      .from('appointments')
      .select('notes')
      .not('notes', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const todayCompleted = todayAppts?.filter(a => a.status === 'completed').length ?? 0
  const todayCancelled = todayAppts?.filter(a => a.status === 'cancelled').length ?? 0
  const todayRevenue = todayAppts
    ?.filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.fee_inr ?? 0), 0) ?? 0

  const allTimeGmv = allCompletedAppts?.reduce((sum, a) => sum + (a.fee_inr ?? 0), 0) ?? 0
  const monthGmv = monthCompletedAppts?.reduce((sum, a) => sum + (a.fee_inr ?? 0), 0) ?? 0

  // Extract top conditions from notes (basic keyword frequency)
  const conditionKeywords = (conditionData ?? [])
    .map(a => (a.notes as string) ?? '')
    .join(' ')
    .toLowerCase()
  const commonConditions = ['back pain', 'knee pain', 'neck pain', 'shoulder pain', 'acl', 'frozen shoulder', 'sciatica', 'sports injury', 'stroke rehab', 'post surgery']
  const topConditions = commonConditions
    .map(c => ({ condition: c, count: (conditionKeywords.match(new RegExp(c, 'g')) ?? []).length }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(c => c.condition)

  return {
    todayAppointments: todayAppts?.length ?? 0,
    todayCompleted,
    todayCancelled,
    todayRevenue,
    weekSignups: weekSignupCount ?? 0,
    weekProviderSignups: weekProviderCount ?? 0,
    activeProviders: activeProviderCount ?? 0,
    pendingApprovals: pendingCount ?? 0,
    totalPatients: patientCount ?? 0,
    allTimeGmv,
    monthGmv,
    topConditions,
  }
}

function buildInsightsPrompt(data: PlatformSnapshot): string {
  return `You are the AI operations analyst for BookPhysio.in, India's physiotherapy booking platform.

Analyze the following real-time platform data and provide a structured business summary.

PLATFORM DATA (as of ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST):
- Today's appointments: ${data.todayAppointments} (${data.todayCompleted} completed, ${data.todayCancelled} cancelled)
- Today's revenue: ₹${data.todayRevenue.toLocaleString('en-IN')}
- This week's new patient signups: ${data.weekSignups}
- This week's new provider registrations: ${data.weekProviderSignups}
- Active verified providers: ${data.activeProviders}
- Pending provider approvals: ${data.pendingApprovals}
- Total patients on platform: ${data.totalPatients}
- This month's GMV: ₹${data.monthGmv.toLocaleString('en-IN')}
- All-time GMV: ₹${data.allTimeGmv.toLocaleString('en-IN')}
- Top conditions being treated: ${data.topConditions.length > 0 ? data.topConditions.join(', ') : 'Not enough data yet'}

Respond with a JSON object (no markdown, no code fences) with exactly these fields:
{
  "summary": "2-3 sentence executive summary of platform health today",
  "summaryHi": "Same summary in Hindi (Devanagari script)",
  "alerts": ["Array of urgent items needing admin attention — empty array if none"],
  "alertsHi": ["Same alerts in Hindi"],
  "recommendations": ["Array of 2-4 actionable growth or operations recommendations"],
  "recommendationsHi": ["Same recommendations in Hindi"],
  "healthScore": <number 1-100 representing overall platform health>,
  "keyMetrics": {
    "appointmentTrend": "up|down|stable",
    "revenueStatus": "healthy|low|critical",
    "providerSupply": "adequate|growing|insufficient"
  }
}`
}

export interface AiInsightsResponse {
  summary: string
  summaryHi: string
  alerts: string[]
  alertsHi: string[]
  recommendations: string[]
  recommendationsHi: string[]
  healthScore: number
  keyMetrics: {
    appointmentTrend: string
    revenueStatus: string
    providerSupply: string
  }
  generatedAt: string
  platformData: PlatformSnapshot
}

export async function POST() {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limit: 10 requests per hour per admin
  try {
    const rateLimit = await apiRatelimit.limit(`admin-ai-insights:${user.id}`)
    if (!rateLimit.success) {
      return jsonNoStore(
        { error: 'AI insights rate limit reached. Please try again in a few minutes.' },
        { status: 429 },
      )
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  try {
    // Gather all platform data
    const platformData = await gatherPlatformData()

    // Generate AI insights via Gemini
    const { text } = await generateText({
      model: patientModels,
      prompt: buildInsightsPrompt(platformData),
      temperature: 0.3,
      maxOutputTokens: 1500,
    })

    // Parse AI response — strip any markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let insights: Record<string, unknown>
    try {
      insights = JSON.parse(cleaned) as Record<string, unknown>
    } catch {
      console.error('[ai-insights] Failed to parse AI response:', text)
      return jsonNoStore({ error: 'AI returned invalid response. Please try again.' }, { status: 502 })
    }

    const response: AiInsightsResponse = {
      summary: (insights.summary as string) ?? '',
      summaryHi: (insights.summaryHi as string) ?? '',
      alerts: Array.isArray(insights.alerts) ? (insights.alerts as string[]) : [],
      alertsHi: Array.isArray(insights.alertsHi) ? (insights.alertsHi as string[]) : [],
      recommendations: Array.isArray(insights.recommendations) ? (insights.recommendations as string[]) : [],
      recommendationsHi: Array.isArray(insights.recommendationsHi) ? (insights.recommendationsHi as string[]) : [],
      healthScore: typeof insights.healthScore === 'number' ? insights.healthScore : 50,
      keyMetrics: {
        appointmentTrend: (insights.keyMetrics as Record<string, string>)?.appointmentTrend ?? 'stable',
        revenueStatus: (insights.keyMetrics as Record<string, string>)?.revenueStatus ?? 'low',
        providerSupply: (insights.keyMetrics as Record<string, string>)?.providerSupply ?? 'insufficient',
      },
      generatedAt: new Date().toISOString(),
      platformData,
    }

    return jsonNoStore(response)
  } catch (error) {
    console.error('[ai-insights] Error generating insights:', error)
    return jsonNoStore(
      { error: 'Failed to generate AI insights. Please try again.' },
      { status: 500 },
    )
  }
}
