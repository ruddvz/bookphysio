import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProviderProfile } from '@/app/api/contracts/provider'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      users!inner (full_name, avatar_url, phone),
      locations (*),
      specialties (*),
      provider_insurances (insurances (*)),
      reviews (id, rating, comment, patient_id, created_at)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  // Map raw data to ProviderProfile
  const profile: ProviderProfile = {
    id: data.id,
    slug: data.slug,
    full_name: data.users.full_name,
    title: data.title,
    avatar_url: data.users.avatar_url,
    specialties: data.specialties || [],
    rating_avg: data.rating_avg || 0,
    rating_count: data.rating_count || 0,
    experience_years: data.experience_years,
    consultation_fee_inr: data.consultation_fee_inr,
    next_available_slot: null,
    visit_types: data.locations?.length > 0 ? (data.locations[0].visit_type || []) : [],
    city: data.locations?.length > 0 ? data.locations[0].city : null,
    insurances: data.provider_insurances?.map((pi: any) => pi.insurances).filter(Boolean) || [],
    bio: data.bio,
    icp_registration_no: data.icp_registration_no,
    locations: data.locations || [],
    verified: data.verified || false,
    onboarding_step: data.onboarding_step || 4,
    gstin: data.gstin,
    lat: data.locations?.[0]?.lat || null,
    lng: data.locations?.[0]?.lng || null
  }

  return NextResponse.json({
    ...profile,
    reviews: data.reviews || []
  })
}
