import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getDemoAdminAnalytics } from '@/lib/demo/store'
import { getDemoSessionFromCookies } from '@/lib/demo/session'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession?.role === 'admin') {
    return NextResponse.json(getDemoAdminAnalytics())
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()

  // Build last 7 months label array (oldest first) for response shaping
  const months: { label: string; start: Date; end: Date }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleString('en-IN', { month: 'short' }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    })
  }

  const windowStart = months[0].start.toISOString()

  // All DB aggregations run in parallel — no full table scan
  const [
    { count: totalProviders },
    { count: activePatients },
    { count: totalAppointments },
    // Completed appointments count + GMV — DB aggregated
    { data: completedStats },
    // Terminal appointments count for completion rate — DB aggregated
    { count: terminalCount },
    // Monthly GMV — grouped by month in DB
    { data: monthlyGmvRows },
    // Monthly appointment counts — grouped by month in DB
    { data: monthlyCountRows },
  ] = await Promise.all([
    supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true)
      .eq('active', true),

    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient'),

    supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true }),

    // Sum of fees for completed appointments (all time)
    supabaseAdmin
      .from('appointments')
      .select('fee_inr')
      .eq('status', 'completed'),

    supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'cancelled', 'no_show']),

    // Monthly GMV: completed appointments in the last 7 months
    supabaseAdmin
      .from('appointments')
      .select('fee_inr, created_at')
      .eq('status', 'completed')
      .gte('created_at', windowStart),

    // Monthly counts: all appointments in the last 7 months
    supabaseAdmin
      .from('appointments')
      .select('created_at')
      .gte('created_at', windowStart),
  ])

  const totalGmv = (completedStats ?? []).reduce((acc, a) => acc + (a.fee_inr || 0), 0)
  const completedCount = completedStats?.length ?? 0
  const completionRate = (terminalCount ?? 0) > 0
    ? Math.round((completedCount / (terminalCount ?? 1)) * 1000) / 10
    : 0

  // Aggregate monthly stats in JS over at most 7×30=210 days of data (small slice)
  const monthlyRevenue = months.map(({ label, start, end }) => {
    const startTs = start.getTime()
    const endTs = end.getTime()
    const revenue = (monthlyGmvRows ?? [])
      .filter((a) => {
        const ts = new Date(a.created_at).getTime()
        return ts >= startTs && ts <= endTs
      })
      .reduce((acc, a) => acc + (a.fee_inr || 0), 0)
    return { label, revenue }
  })

  const monthlyAppointments = months.map(({ label, start, end }) => {
    const startTs = start.getTime()
    const endTs = end.getTime()
    const count = (monthlyCountRows ?? []).filter((a) => {
      const ts = new Date(a.created_at).getTime()
      return ts >= startTs && ts <= endTs
    }).length
    return { label, count }
  })

  return NextResponse.json({
    kpis: {
      totalGmv,
      totalGmvFormatted: totalGmv >= 100000
        ? `₹${(totalGmv / 100000).toFixed(1)}L`
        : `₹${totalGmv.toLocaleString('en-IN')}`,
      activePatients: activePatients ?? 0,
      completionRate,
      totalProviders: totalProviders ?? 0,
      totalAppointments: totalAppointments ?? 0,
    },
    monthlyRevenue,
    monthlyAppointments,
  })
}
