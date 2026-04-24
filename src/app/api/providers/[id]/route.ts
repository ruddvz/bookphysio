import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProviderProfile } from '@/app/api/contracts/provider'
import { collectVisitTypes } from '@/lib/booking/policy'
import {
  getPublicProviderCoordinates,
  sanitizePublicProviderLocation,
  sanitizePublicProviderReview,
} from '@/lib/providers/public'

interface PublicProviderReviewRow {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

const MAX_PUBLIC_PROFILE_REVIEWS = 5
const PUBLIC_PROFILE_REVIEW_BATCH_SIZE = 25

function hasPublicReviewComment(review: PublicProviderReviewRow): review is PublicProviderReviewRow & { comment: string } {
  return typeof review.comment === 'string' && review.comment.trim().length > 0
}

async function fetchPublicProfileReviews(
  providerId: string,
): Promise<{ data: PublicProviderReviewRow[] | null; error: string | null }> {
  const collectedReviews: PublicProviderReviewRow[] = []
  let from = 0

  while (collectedReviews.length < MAX_PUBLIC_PROFILE_REVIEWS) {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('provider_id', providerId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, from + PUBLIC_PROFILE_REVIEW_BATCH_SIZE - 1)

    if (error) {
      return { data: null, error: 'Failed to load provider reviews' }
    }

    const reviewBatch = (data ?? []) as PublicProviderReviewRow[]
    collectedReviews.push(...reviewBatch.filter(hasPublicReviewComment))

    if (reviewBatch.length < PUBLIC_PROFILE_REVIEW_BATCH_SIZE) {
      break
    }

    from += PUBLIC_PROFILE_REVIEW_BATCH_SIZE
  }

  return { data: collectedReviews.slice(0, MAX_PUBLIC_PROFILE_REVIEWS), error: null }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('providers')
    .select(`
      id,
      slug,
      title,
      bio,
      iap_registration_no,
      qualification,
      certifications,
      equipment_tags,
      rating_avg,
      rating_count,
      experience_years,
      consultation_fee_inr,
      verified,
      users!inner (full_name, avatar_url),
      locations (id, name, city, state, lat, lng, visit_type),
      specialties (*)
    `)
    .eq('id', id)
    .eq('active', true)
    .eq('verified', true)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const { data: reviewData, error: reviewsError } = await fetchPublicProfileReviews(id)

  if (reviewsError) {
    return NextResponse.json({ error: 'Failed to load provider reviews' }, { status: 500 })
  }

  const providerUser = Array.isArray(data.users) ? data.users[0] : data.users
  const locations = data.locations || []
  const publicLocations = locations.map(sanitizePublicProviderLocation)
  const primaryLocation = locations[0] ?? null
  const publicCoordinates = getPublicProviderCoordinates({
    city: primaryLocation?.city ?? null,
    lat: primaryLocation?.lat ?? null,
    lng: primaryLocation?.lng ?? null,
  })

  // Runtime normalizers for DB fields that may contain unexpected values
  type ProviderQualification = 'BPT' | 'MPT' | 'PhD' | 'DPT'
  function normalizeQualification(value: unknown): ProviderQualification | null {
    if (value === 'BPT' || value === 'MPT' || value === 'PhD' || value === 'DPT') return value
    return null
  }
  function normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }

  // Redact the registration number for public viewing
  let redactedRegNo = data.iap_registration_no || null
  if (redactedRegNo) {
    if (redactedRegNo.startsWith('STATE_')) {
      const parts = redactedRegNo.split('_')
      redactedRegNo = `STATE_${parts[1]}_CONFIDENTIAL`
    } else {
      redactedRegNo = 'CONFIDENTIAL'
    }
  }

  // Map raw data to ProviderProfile
  const profile: ProviderProfile = {
    id: data.id,
    slug: data.slug,
    full_name: providerUser?.full_name ?? 'Provider',
    title: data.title,
    avatar_url: providerUser?.avatar_url ?? null,
    specialties: data.specialties || [],
    rating_avg: data.rating_avg || 0,
    rating_count: data.rating_count || 0,
    experience_years: data.experience_years,
    consultation_fee_inr: data.consultation_fee_inr,
    next_available_slot: null,
    visit_types: collectVisitTypes(locations),
    city: publicLocations[0]?.city ?? null,
    bio: data.bio,
    iap_registration_no: redactedRegNo,
    qualification: normalizeQualification((data as { qualification?: unknown }).qualification),
    certifications: normalizeStringArray((data as { certifications?: unknown }).certifications),
    equipment_tags: normalizeStringArray((data as { equipment_tags?: unknown }).equipment_tags),
    locations: publicLocations,
    verified: data.verified || false,
    lat: publicCoordinates.lat,
    lng: publicCoordinates.lng,
  }

  return NextResponse.json({
    ...profile,
    reviews: (reviewData || []).map(sanitizePublicProviderReview),
  })
}
