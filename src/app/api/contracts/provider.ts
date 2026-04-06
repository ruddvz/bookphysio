export interface Specialty {
  id: string
  name: string
  slug: string
  icon_url: string | null
}

export interface ProviderLocation {
  id: string
  name: string
  city: string | null
  state: string | null
  visit_type: ('in_clinic' | 'home_visit')[]
}

export interface ProviderCard {
  id: string
  slug: string
  full_name: string
  title: 'Dr.' | 'PT' | 'BPT' | 'MPT' | null
  avatar_url: string | null
  verified: boolean
  specialties: Specialty[]
  rating_avg: number
  rating_count: number
  experience_years: number | null
  consultation_fee_inr: number | null
  next_available_slot: string | null
  visit_types: ('in_clinic' | 'home_visit')[]
  city: string | null
  distance?: string
  lat: number | null
  lng: number | null
}

export interface ProviderReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface ProviderProfile extends ProviderCard {
  bio: string | null
  iap_registration_no: string | null
  locations: ProviderLocation[]
  reviews?: ProviderReview[]
  gallery_images?: string[]
}
