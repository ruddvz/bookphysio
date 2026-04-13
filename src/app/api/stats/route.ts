import { NextResponse } from 'next/server'
import { hasPublicSupabaseEnv } from '@/lib/supabase/env'

/**
 * GET /api/stats
 *
 * Returns platform-wide statistics for the homepage trust section.
 * Publicly cacheable — no auth required.
 */
export async function GET() {
  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json(
      { providers: 0, cities: 0, appointments: 0, avgRating: 0 },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' } },
    )
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  const [providersResult, appointmentsResult, citiesResult] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'provider'),
    supabaseAdmin.from('appointments').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('city').eq('role', 'provider').not('city', 'is', null),
  ])

  if (providersResult.error || appointmentsResult.error || citiesResult.error) {
    console.error('[api/stats] Supabase query error:', {
      providers: providersResult.error,
      appointments: appointmentsResult.error,
      cities: citiesResult.error,
    })
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
  }

  const providerCount = providersResult.count ?? 0
  const appointmentCount = appointmentsResult.count ?? 0
  const uniqueCities = new Set((citiesResult.data ?? []).map((r) => (r as { city: string }).city)).size
  const avgRating = 0 // Placeholder — implement review aggregation when sufficient data is available

  return NextResponse.json(
    { providers: providerCount, cities: uniqueCities, appointments: appointmentCount, avgRating },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' } },
  )
}
