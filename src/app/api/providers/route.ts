import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchFiltersSchema } from '@/lib/validations/search'
import { apiRatelimit } from '@/lib/upstash'
import { getRequestIpAddress } from '@/lib/server/runtime'
import type { SearchResponse } from '@/app/api/contracts/search'
import type { ProviderCard } from '@/app/api/contracts/provider'
import { formatPublicProviderDistance, getPublicProviderCoordinates } from '@/lib/providers/public'

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

const FALLBACK_PROVIDER_SCAN_LIMIT = 250

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

interface ProviderDetailRow {
  id: string
  verified: boolean | null
  specialties: ProviderCard['specialties']
  availabilities: ProviderAvailabilityRow[] | null
}

interface FallbackProviderUserRow {
  full_name: string
  avatar_url: string | null
}

interface FallbackProviderLocationRow {
  id: string
  city: string | null
  lat: number | null
  lng: number | null
  visit_type: ProviderCard['visit_types'] | null
}

interface FallbackProviderRow {
  id: string
  slug: string
  title: ProviderCard['title']
  rating_avg: number | null
  rating_count: number | null
  experience_years: number | null
  consultation_fee_inr: number | null
  specialty_ids: string[] | null
  users: FallbackProviderUserRow | FallbackProviderUserRow[] | null
  locations: FallbackProviderLocationRow[] | null
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

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function calculateDistanceKm(
  sourceLat: number | null | undefined,
  sourceLng: number | null | undefined,
  targetLat: number | null | undefined,
  targetLng: number | null | undefined,
): number | null {
  if (
    typeof sourceLat !== 'number'
    || typeof sourceLng !== 'number'
    || typeof targetLat !== 'number'
    || typeof targetLng !== 'number'
  ) {
    return null
  }

  const toRadians = (value: number) => value * (Math.PI / 180)
  const latitudeDelta = toRadians(targetLat - sourceLat)
  const longitudeDelta = toRadians(targetLng - sourceLng)
  const latitudeA = toRadians(sourceLat)
  const latitudeB = toRadians(targetLat)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function selectBestLocation(
  locations: FallbackProviderLocationRow[],
  searchLat: number | null | undefined,
  searchLng: number | null | undefined,
): FallbackProviderLocationRow {
  if (typeof searchLat !== 'number' || typeof searchLng !== 'number') {
    return locations[0]
  }

  return [...locations].sort((left, right) => {
    const leftDistance = calculateDistanceKm(searchLat, searchLng, left.lat, left.lng) ?? Number.MAX_SAFE_INTEGER
    const rightDistance = calculateDistanceKm(searchLat, searchLng, right.lat, right.lng) ?? Number.MAX_SAFE_INTEGER

    return leftDistance - rightDistance
  })[0]
}

async function searchProvidersWithoutRpc({
  supabase,
  city,
  resolvedSpecialtyId,
  visit_type,
  min_rating,
  max_fee_inr,
  page,
  limit,
  lat,
  lng,
  radius_km,
  query,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  city: string | null
  resolvedSpecialtyId: string | null
  visit_type: ProviderCard['visit_types'][number] | null
  min_rating: number | undefined
  max_fee_inr: number | undefined
  page: number
  limit: number
  lat: number | undefined
  lng: number | undefined
  radius_km: number
  query?: string
}): Promise<{ data: SearchProviderRpcRow[]; error: unknown }> {
  const maximumFee = max_fee_inr ?? 2000000
  let fallbackQuery = supabase
    .from('providers')
    .select(`
      id,
      slug,
      title,
      rating_avg,
      rating_count,
      experience_years,
      consultation_fee_inr,
      specialty_ids,
      users!inner (full_name, avatar_url),
      locations (id, city, lat, lng, visit_type)
    `)
    .eq('verified', true)
    .eq('active', true)
    .gte('rating_avg', min_rating ?? 0)
    .lte('consultation_fee_inr', maximumFee)
    .order('rating_avg', { ascending: false })
    .limit(FALLBACK_PROVIDER_SCAN_LIMIT)

  if (resolvedSpecialtyId) {
    fallbackQuery = fallbackQuery.contains('specialty_ids', [resolvedSpecialtyId])
  }

  if (query) {
    fallbackQuery = fallbackQuery.ilike('users.full_name', `%${query}%`)
  }

  const { data: fallbackProviderData, error: fallbackProviderError } = await fallbackQuery

  if (fallbackProviderError) {
    return { data: [], error: fallbackProviderError }
  }

  const normalizedCity = city?.trim().toLowerCase() ?? null
  const filteredProviders = ((fallbackProviderData ?? []) as FallbackProviderRow[])
    .flatMap((provider) => {
      const user = toArray(provider.users)[0]
      const locations = toArray(provider.locations)

      if (!user || locations.length === 0) {
        return []
      }

      if (resolvedSpecialtyId && !(provider.specialty_ids ?? []).includes(resolvedSpecialtyId)) {
        return []
      }

      if ((provider.rating_avg ?? 0) < (min_rating ?? 0)) {
        return []
      }

      if ((provider.consultation_fee_inr ?? Number.MAX_SAFE_INTEGER) > maximumFee) {
        return []
      }

      const matchingLocations = locations.filter((location) => {
        const cityMatches = !normalizedCity || location.city?.toLowerCase().includes(normalizedCity)
        const visitTypeMatches = !visit_type || (location.visit_type ?? []).includes(visit_type)

        return cityMatches && visitTypeMatches
      })

      if (matchingLocations.length === 0) {
        return []
      }

      const selectedLocation = selectBestLocation(matchingLocations, lat ?? null, lng ?? null)
      const distanceKm = calculateDistanceKm(lat ?? null, lng ?? null, selectedLocation.lat, selectedLocation.lng)

      if (typeof distanceKm === 'number' && distanceKm > radius_km) {
        return []
      }

      return [
        {
          id: provider.id,
          slug: provider.slug,
          full_name: user.full_name,
          title: provider.title,
          avatar_url: user.avatar_url,
          rating_avg: provider.rating_avg,
          rating_count: provider.rating_count,
          experience_years: provider.experience_years,
          consultation_fee_inr: provider.consultation_fee_inr,
          visit_types: selectedLocation.visit_type ?? [],
          city: selectedLocation.city,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          distance_km: distanceKm,
          total_count: null,
        },
      ]
    })
    .sort((left, right) => {
      const leftDistance = left.distance_km ?? Number.MAX_SAFE_INTEGER
      const rightDistance = right.distance_km ?? Number.MAX_SAFE_INTEGER

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance
      }

      return (right.rating_avg ?? 0) - (left.rating_avg ?? 0)
    })

  const total = filteredProviders.length
  const pageStart = (page - 1) * limit
  const pageEnd = pageStart + limit

  return {
    data: filteredProviders.slice(pageStart, pageEnd).map((provider) => ({
      ...provider,
      total_count: total,
    })),
    error: null,
  }
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

  const { query, city, specialty_id, visit_type, min_rating, max_fee_inr, page, limit, lat, lng, radius_km } = parsed.data
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

  let { data, error } = await supabase.rpc('search_providers_v2', {
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

  const shouldFallbackForQuery = !error && Boolean(query)

  if (error || shouldFallbackForQuery) {
    if (error) {
      console.error('Supabase RPC error:', error)
    }

    const fallbackSearch = await searchProvidersWithoutRpc({
      supabase,
      city: city ?? null,
      resolvedSpecialtyId,
      visit_type: visit_type ?? null,
      min_rating,
      max_fee_inr,
      page,
      limit,
      lat,
      lng,
      radius_km: Number(radius_km),
      query,
    })

    data = fallbackSearch.data
    error = fallbackSearch.error as typeof error
  }

  if (error) {
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
            availabilities (starts_at, is_booked, is_blocked)
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
      distance: formatPublicProviderDistance(provider.distance_km),
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
