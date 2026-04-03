import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchFiltersSchema } from '@/lib/validations/search'
import { apiRatelimit } from '@/lib/upstash'
import { getRequestIpAddress } from '@/lib/server/runtime'
import type { SearchResponse } from '@/app/api/contracts/search'
import type { ProviderCard } from '@/app/api/contracts/provider'
import { getPublicProviderCoordinates } from '@/lib/providers/public'

const SPECIALTY_ALIASES: Record<string, string> = {
  'Sports Physio': 'sports',
  'Sports Physiotherapy': 'sports',
  'Neuro Physio': 'neurological',
  'Neurological Physiotherapy': 'neurological',
  'Ortho Physio': 'orthopaedic',
  'Orthopaedic Physiotherapy': 'orthopaedic',
  'Paediatric Physio': 'paediatric',
  'Paediatric Physiotherapy': 'paediatric',
  "Women's Health": 'womens-health',
  "Women's Health Physiotherapy": 'womens-health',
  'Geriatric Physio': 'geriatric',
  'Geriatric Physiotherapy': 'geriatric',
  'Post-Surgery Rehab': 'post-surgical',
  'Post-Surgical Rehabilitation': 'post-surgical',
  'Pain Management': 'spine',
  'Spine & Back Pain': 'spine',
  'Home Visit Physio': 'home-visit',
}

interface SearchProviderRpcRow {
  id: string
  slug: string
  full_name: string
  title: ProviderCard['title']
  avatar_url: string | null
  rating_avg: number | null
  rating_count: number | null
  experience_years: number | null
  consultation_fee_inr: number | null
  visit_types: ProviderCard['visit_types'] | null
  city: string | null
  lat: number | null
  lng: number | null
  distance_km: number | null
  total_count: number | null
}

interface ProviderAvailabilityRow {
  starts_at: string
  is_booked?: boolean | null
  is_blocked?: boolean | null
}

interface ProviderInsuranceJoinRow {
  insurances: ProviderCard['insurances'][number] | ProviderCard['insurances'] | null
}

interface ProviderDetailRow {
  id: string
  verified: boolean | null
  specialties: ProviderCard['specialties']
  availabilities: ProviderAvailabilityRow[] | null
  provider_insurances: ProviderInsuranceJoinRow[] | null
}

function resolveSpecialtySlug(input: string | null | undefined): string | null {
  if (!input) return null

  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed
  }

  return SPECIALTY_ALIASES[trimmed] ?? trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function GET(request: NextRequest) {
  const ip = getRequestIpAddress(request) ?? 'unknown'
  try {
    const { success } = await apiRatelimit.limit(`providers-search:${ip}`)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  } catch (error) {
    console.error('[api/providers] Rate-limit check degraded:', error)
  }

  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  if (params.visit_type !== 'in_clinic' && params.visit_type !== 'home_visit') {
    delete params.visit_type
  }
  const parsed = searchFiltersSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { city, specialty_id, visit_type, min_rating, max_fee_inr, page, limit, lat, lng, radius_km } = parsed.data
  const supabase = await createClient()

  let resolvedSpecialtyId: string | null = null
  const specialtyInput = resolveSpecialtySlug(specialty_id)
  if (specialtyInput) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(specialtyInput)) {
      resolvedSpecialtyId = specialtyInput
    } else {
      const { data: specialty } = await supabase
        .from('specialties')
        .select('id')
        .eq('slug', specialtyInput)
        .maybeSingle()

      resolvedSpecialtyId = specialty?.id ?? null
    }
  }

  const { data, error } = await supabase.rpc('search_providers_v2', {
    p_lat: lat ?? null,
    p_lng: lng ?? null,
    p_radius_km: Number(radius_km),
    p_city: city ?? null,
    p_specialty_id: resolvedSpecialtyId,
    p_visit_type: visit_type ?? null,
    p_min_rating: min_rating ?? 0,
    p_max_fees: max_fee_inr ?? 2000000,
    p_page: page,
    p_limit: limit
  })


  if (error) {
    console.error('Supabase RPC error:', error)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }

  const results = (data ?? []) as SearchProviderRpcRow[]
  const total = results.length > 0 ? (results[0].total_count || 0) : 0

  const providerIds = results.map((provider) => provider.id)
  const { data: providerDetails, error: providerDetailsError } = providerIds.length > 0
    ? await supabase
        .from('providers')
        .select(`
          id,
          verified,
          specialties (*),
          availabilities (starts_at, is_booked, is_blocked),
          provider_insurances (insurances (*))
        `)
        .in('id', providerIds)
    : { data: [], error: null }

  if (providerDetailsError) {
    console.error('Supabase provider detail error:', providerDetailsError)
  }

  const detailRows = (providerDetails ?? []) as unknown as ProviderDetailRow[]
  const providerDetailsById = new Map<string, ProviderDetailRow>(detailRows.map((provider) => [provider.id, provider]))
  const now = Date.now()

  const providers: ProviderCard[] = results.map((provider) => {
    const details = providerDetailsById.get(provider.id)
    const nextAvailableSlot = (details?.availabilities ?? [])
      .filter((slot) => {
        return !slot.is_booked && !slot.is_blocked && new Date(slot.starts_at).getTime() >= now
      })
      .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime())[0]
    const publicCoordinates = getPublicProviderCoordinates({
      city: provider.city,
      lat: provider.lat,
      lng: provider.lng,
    })
    const normalizedInsurances = (details?.provider_insurances ?? []).flatMap((entry) => {
      if (!entry.insurances) {
        return []
      }

      return Array.isArray(entry.insurances) ? entry.insurances : [entry.insurances]
    })

    return {
      id: provider.id,
      slug: provider.slug,
      full_name: provider.full_name,
      title: provider.title,
      avatar_url: provider.avatar_url,
      verified: details?.verified ?? false,
      specialties: details?.specialties ?? [],
      rating_avg: provider.rating_avg || 0,
      rating_count: provider.rating_count || 0,
      experience_years: provider.experience_years,
      consultation_fee_inr: provider.consultation_fee_inr,
      next_available_slot: nextAvailableSlot?.starts_at ?? null,
      visit_types: provider.visit_types ?? [],
      city: provider.city,
      lat: publicCoordinates.lat,
      lng: publicCoordinates.lng,
      insurances: normalizedInsurances.filter(
        (insurance): insurance is ProviderCard['insurances'][number] => Boolean(insurance),
      ),
      distance: provider.distance_km ? `${provider.distance_km.toFixed(1)} km` : undefined,
    }
  })

  const response: SearchResponse = {
    providers,
    total: Number(total),
    page,
    limit,
  }

  return NextResponse.json(response)

}
