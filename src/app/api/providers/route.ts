import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchFiltersSchema } from '@/lib/validations/search'
import { apiRatelimit } from '@/lib/upstash'
import type { SearchResponse } from '@/app/api/contracts'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await apiRatelimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  const parsed = searchFiltersSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { city, min_rating, max_fee_inr, page, limit } = parsed.data
  const supabase = await createClient()

  let q = supabase
    .from('providers')
    .select(
      `id, slug, title, bio, experience_years, consultation_fee_inr,
      rating_avg, rating_count,
      users!inner (full_name, avatar_url),
      locations (id, city, state, visit_type),
      provider_insurances (insurance_id)`,
      { count: 'exact' }
    )
    .eq('verified', true)
    .eq('active', true)

  if (city) q = q.eq('locations.city', city)
  if (min_rating) q = q.gte('rating_avg', min_rating)
  if (max_fee_inr) q = q.lte('consultation_fee_inr', max_fee_inr)

  const from = (page - 1) * limit
  const { data, error, count } = await q
    .range(from, from + limit - 1)
    .order('rating_avg', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }

  const response: SearchResponse = {
    providers: (data ?? []) as unknown as SearchResponse['providers'],
    total: count ?? 0,
    page,
    limit,
  }

  return NextResponse.json(response)
}
