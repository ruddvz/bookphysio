export interface Review {
  id: string
  appointment_id: string
  patient: { id: string; full_name: string; avatar_url: string | null }
  provider_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  provider_reply: string | null
  is_published: boolean
  created_at: string
}
