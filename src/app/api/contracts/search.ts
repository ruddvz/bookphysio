import type { ProviderCard } from './provider'

export interface SearchFilters {
  query?: string
  city?: string
  specialty_id?: string
  insurance_id?: string
  visit_type?: 'in_clinic' | 'home_visit' | 'online'
  available_date?: string
  min_rating?: number
  max_fee_inr?: number
  page: number
  limit: number
}

export interface SearchResponse {
  providers: ProviderCard[]
  total: number
  page: number
  limit: number
}
