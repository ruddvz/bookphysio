import type { ProviderLocation } from '@/app/api/contracts/provider'
import { formatIndiaDateInput } from '@/lib/india-date'
import { isVisitType, type VisitType } from '@/lib/booking/policy'

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  kochi: { lat: 9.9312, lng: 76.2673 },
}

interface RawProviderLocation {
  id: string
  name?: string | null
  city?: string | null
  state?: string | null
  lat?: number | null
  lng?: number | null
  visit_type?: readonly string[] | null
}

interface RawProviderReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface PublicProviderReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

function normalizeCityKey(city: string | null | undefined): string | null {
  const trimmed = city?.trim().toLowerCase()
  return trimmed ? trimmed : null
}

function normalizeVisitTypes(visitTypes: readonly string[] | null | undefined): VisitType[] {
  return (visitTypes ?? []).filter((visitType): visitType is VisitType => isVisitType(visitType))
}

function roundUpDistanceBucket(distanceKm: number): string {
  if (distanceKm <= 2) return 'Within 2 km'
  if (distanceKm <= 5) return 'Within 5 km'
  if (distanceKm <= 10) return 'Within 10 km'
  if (distanceKm <= 20) return 'Within 20 km'

  return '20+ km away'
}

function getLocationName(name: string | null | undefined, city: string | null | undefined): string {
  const normalizedName = name?.trim()

  if (normalizedName) {
    return normalizedName
  }

  const normalizedCity = city?.trim()
  return normalizedCity ? `${normalizedCity} Center` : 'Clinic'
}

export function coarsenPublicReviewCreatedAt(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return formatIndiaDateInput(parsedDate)
}

export function sanitizePublicProviderLocation(location: RawProviderLocation): ProviderLocation {
  return {
    id: location.id,
    name: getLocationName(location.name ?? null, location.city ?? null),
    city: location.city?.trim() || null,
    state: location.state?.trim() || null,
    visit_type: normalizeVisitTypes(location.visit_type),
  }
}

export function sanitizePublicProviderReview(review: RawProviderReview): PublicProviderReview {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment ?? null,
    created_at: coarsenPublicReviewCreatedAt(review.created_at),
  }
}

export function getPublicProviderCoordinates(input: {
  city?: string | null
  lat?: number | null
  lng?: number | null
}): { lat: number | null; lng: number | null } {
  const cityKey = normalizeCityKey(input.city)
  const cityCenter = cityKey ? CITY_CENTERS[cityKey] : null

  if (cityCenter) {
    return cityCenter
  }

  return {
    lat: null,
    lng: null,
  }
}

export function formatPublicProviderDistance(distanceKm: number | null | undefined): string | undefined {
  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return undefined
  }

  return roundUpDistanceBucket(distanceKm)
}

export function formatPublicProviderLocation(location: ProviderLocation | null | undefined): string {
  if (!location) {
    return 'India'
  }

  return [location.name, location.city].filter(Boolean).join(', ') || location.name || location.city || 'India'
}