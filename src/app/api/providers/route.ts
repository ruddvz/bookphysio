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

  const { city, specialty_id, visit_type, min_rating, max_fee_inr, page, limit, lat, lng, radius_km } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('search_providers_v2', {
    p_lat: lat ?? null,
    p_lng: lng ?? null,
    p_radius_km: Number(radius_km),
    p_city: city ?? null,
    p_specialty_id: specialty_id ?? null,
    p_visit_type: visit_type ?? null,
    p_min_rating: min_rating ?? 0,
    p_max_fees: max_fee_inr ?? 2000000,
    p_page: page,
    p_limit: limit
  })


  if (error) {
    console.error('Supabase RPC error:', error)
    return NextResponse.json({ error: 'Failed to fetch providers', details: error.message }, { status: 500 })
  }

  const results = (data as any[]) || []
  const total = results.length > 0 ? (results[0].total_count || 0) : 0


  const providers: ProviderCard[] = results.map((p) => ({
    id: p.id,
    slug: p.slug,
    full_name: p.full_name,
    title: p.title,
    avatar_url: p.avatar_url,
    specialties: [], // We might need to fetch names if needed, or adjust RPC
    rating_avg: p.rating_avg || 0,
    rating_count: p.rating_count || 0,
    experience_years: p.experience_years,
    consultation_fee_inr: p.consultation_fee_inr,
    next_available_slot: null,
    visit_types: [], // RPC could be updated to return this
    city: p.city,
    lat: p.lat,
    lng: p.lng,
    insurances: [],
    distance: p.distance_km ? `${p.distance_km.toFixed(1)} km` : undefined
  }))

  const response: SearchResponse = {
    providers,
    total: Number(total),
    page,
    limit,
  }

  return NextResponse.json(response)

}
