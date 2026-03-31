export interface Specialty {
  id: string
  name: string
  slug: string
  icon_url: string | null
}

export interface Insurance {
  id: string
  name: string
  logo_url: string | null
}

export interface ProviderLocation {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  lat: number | null
  lng: number | null
  visit_type: ('in_clinic' | 'home_visit' | 'online')[]
}

export interface ProviderCard {
  id: string
  slug: string
  full_name: string
  title: 'Dr.' | 'PT' | 'BPT' | 'MPT' | null
  avatar_url: string | null
  specialties: Specialty[]
  rating_avg: number
  rating_count: number
  experience_years: number | null
  consultation_fee_inr: number | null
  next_available_slot: string | null
  visit_types: ('in_clinic' | 'home_visit' | 'online')[]
  city: string | null
  lat: number | null
  lng: number | null
  insurances: Insurance[]
}

export interface ProviderProfile extends ProviderCard {
  bio: string | null
  icp_registration_no: string | null
  locations: ProviderLocation[]
  verified: boolean
  onboarding_step: 1 | 2 | 3 | 4
  gstin: string | null
}
