import type { ProviderCard } from './provider'

export type SearchSort = 'relevance' | 'availability' | 'price' | 'distance' | 'rating'

export interface SearchFilters {
  query?: string
  city?: string
  specialty_id?: string
  visit_type?: 'in_clinic' | 'home_visit'
  sort?: SearchSort
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
