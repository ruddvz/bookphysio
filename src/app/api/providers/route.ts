import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchFiltersSchema } from '@/lib/validations/search'
import { apiRatelimit } from '@/lib/upstash'
import type { SearchResponse } from '@/app/api/contracts/search'
import type { ProviderCard } from '@/app/api/contracts/provider'

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

  const { city, min_rating, max_fee_inr, page, limit, visit_type } = parsed.data
  const supabase = await createClient()

  // Build the query
  // We use !inner for filtering by related tables
  let q = supabase
    .from('providers')
    .select(
      `id, slug, title, bio, experience_years, consultation_fee_inr,
      rating_avg, rating_count,
      users!inner (full_name, avatar_url),
      locations${city || visit_type ? '!inner' : ''} (id, city, state, address, lat, lng, visit_type),
      specialties (id, name, slug),
      provider_insurances (insurances (id, name, logo_url))`,
      { count: 'exact' }
    )
    .eq('verified', true)
    .eq('active', true)

  if (city) q = q.ilike('locations.city', city)
  if (visit_type) q = q.contains('locations.visit_type', [visit_type])
  if (min_rating) q = q.gte('rating_avg', min_rating)
  if (max_fee_inr) q = q.lte('consultation_fee_inr', max_fee_inr)

  const from = (page - 1) * limit
  const { data, error, count } = await q
    .range(from, from + limit - 1)
    .order('rating_avg', { ascending: false })

  if (error) {
    console.error('Supabase fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }

  // Map the nested response to ProviderCard[]
  const providers: ProviderCard[] = (data || []).map((p) => {
    const provider = p as any
    return {
      id: provider.id,
      slug: provider.slug,
      full_name: provider.users.full_name,
      title: provider.title,
      avatar_url: provider.users.avatar_url,
      specialties: provider.specialties || [],
      rating_avg: provider.rating_avg || 0,
      rating_count: provider.rating_count || 0,
      experience_years: provider.experience_years,
      consultation_fee_inr: provider.consultation_fee_inr,
      next_available_slot: null,
      visit_types: provider.locations?.[0]?.visit_type || [],
      city: provider.locations?.[0]?.city || null,
      lat: provider.locations?.[0]?.lat || null,
      lng: provider.locations?.[0]?.lng || null,
      insurances: provider.provider_insurances?.map((pi: any) => pi.insurances).filter(Boolean) || [],
    }
  })

  const response: SearchResponse = {
    providers,
    total: count ?? 0,
    page,
    limit,
  }

  return NextResponse.json(response)
}
