import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getDemoAdminStats } from '@/lib/demo/store'
import { getDemoSessionFromCookies } from '@/lib/demo/session'
import { apiRatelimit } from '@/lib/upstash'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_STORE_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession?.role === 'admin') {
    return jsonNoStore(getDemoAdminStats())
  }

  if (!user) return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[api/admin/stats] Failed to verify admin role:', profileError)
    return jsonNoStore({ error: 'Failed to verify admin access' }, { status: 500 })
  }

  if (profile?.role !== 'admin') {
    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const rateLimit = await apiRatelimit.limit(`admin-stats:${user.id}`)
    if (!rateLimit.success) {
      return jsonNoStore({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  // Fetch counts
  const [
    { count: providersCount, error: providersError },
    { count: pendingCount, error: pendingError },
    { count: patientsCount, error: patientsError },
    { data: appointments, error: appointmentsError },
  ] = await Promise.all([
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verified', false),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabaseAdmin.from('appointments').select('fee_inr, status').eq('status', 'completed'),
  ])

  if (providersError || pendingError || patientsError || appointmentsError) {
    console.error('[api/admin/stats] Failed to load stats:', {
      providersError,
      pendingError,
      patientsError,
      appointmentsError,
    })
    return jsonNoStore({ error: 'Failed to fetch admin stats' }, { status: 500 })
  }

  const gmv = appointments?.reduce((acc, curr) => acc + (curr.fee_inr || 0), 0) ?? 0

  return jsonNoStore({
    activeProviders: providersCount ?? 0,
    pendingApprovals: pendingCount ?? 0,
    totalPatients: patientsCount ?? 0,
    gmvMtd: gmv,
  })
}
