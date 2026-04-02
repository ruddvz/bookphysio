import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoAdminAnalytics } from '@/lib/demo/store'
import { parseDemoCookie } from '@/lib/demo/session'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoSession = !user ? parseDemoCookie(request.cookies.get('bp-demo-session')?.value) : null

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

  // Build last 7 months array (oldest first)
  const months: { label: string; start: string; end: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
    months.push({
      label: d.toLocaleString('en-IN', { month: 'short' }),
      start,
      end,
    })
  }

  // Parallel data fetches
  const [
    { count: totalProviders },
    { count: activePatients },
    { data: allAppointments },
  ] = await Promise.all([
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verified', true).eq('active', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('appointments').select('fee_inr, status, created_at'),
  ])

  const appts = allAppointments || []
  const completedAppts = appts.filter(a => a.status === 'completed')
  const terminalAppts = appts.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status))
  const completionRate = terminalAppts.length > 0
    ? Math.round((completedAppts.length / terminalAppts.length) * 1000) / 10
    : 0

  const totalGmv = completedAppts.reduce((acc, a) => acc + (a.fee_inr || 0), 0)

  // Monthly GMV: aggregate completed appointments per month
  const monthlyRevenue = months.map(({ label, start, end }) => {
    const startTs = new Date(start).getTime()
    const endTs = new Date(end).getTime()
    const revenue = completedAppts
      .filter(a => {
        const ts = new Date(a.created_at).getTime()
        return ts >= startTs && ts <= endTs
      })
      .reduce((acc, a) => acc + (a.fee_inr || 0), 0)
    return { label, revenue }
  })

  // Monthly appointments count
  const monthlyAppointments = months.map(({ label, start, end }) => {
    const startTs = new Date(start).getTime()
    const endTs = new Date(end).getTime()
    const count = appts.filter(a => {
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
      totalAppointments: appts.length,
    },
    monthlyRevenue,
    monthlyAppointments,
  })
}
