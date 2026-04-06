export interface UserProfile {
  id: string
  role: 'patient' | 'provider' | 'admin'
  full_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  email?: string | null
}

export interface PatientProfile extends UserProfile {
  role: 'patient'
}

export interface ProviderUserProfile extends UserProfile {
  role: 'provider'
  iap_registration_no: string | null
}
