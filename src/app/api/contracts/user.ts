export interface UserProfile {
  id: string
  role: 'patient' | 'provider' | 'admin'
  full_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface PatientProfile extends UserProfile {
  role: 'patient'
}
