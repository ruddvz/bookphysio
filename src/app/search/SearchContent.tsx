'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import FeaturedDoctors from '@/components/FeaturedDoctors'
import SearchFilters from './SearchFilters'
import { Search as SearchIcon, ChevronRight, RefreshCw, Sparkles, ArrowRight } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import { getProviderDisplayName } from '@/lib/providers/display-name'
import type { SearchResponse } from '@/app/api/contracts/search'
import { SEARCH_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'
import { formatIndiaDateTime } from '@/lib/india-date'

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
}

const SUGGESTED_SEARCHES = [
  { label: 'Sports Physio', href: '/search?specialty=Sports%20Physio', emoji: '🏃' },
  { label: 'Back Pain', href: '/search?specialty=Pain%20Management', emoji: '🦴' },
  { label: 'Home Visits', href: '/search?visit_type=home_visit', emoji: '🏠' },
  { label: 'Post-Surgery Rehab', href: '/search?specialty=Post-Surgery%20Rehab', emoji: '💪' },
  { label: 'Neuro Physio', href: '/search?specialty=Neuro%20Physio', emoji: '🧠' },
  { label: 'Ortho Physio', href: '/search?specialty=Ortho%20Physio', emoji: '🦿' },
]

async function fetchSearchResults(url: string): Promise<SearchResponse> {
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Provider search failed with status ${response.status}`)
  }

  return response.json() as Promise<SearchResponse>
}

function providerToDoctor(p: ProviderCard): Doctor {
  const nameWithTitle = getProviderDisplayName(p)
  return {
    id: p.id,
    name: nameWithTitle,
    credentials: p.specialties.map((s) => s.name).join(', ') || 'BPT',
    specialty: p.specialties[0]?.name ?? 'Physiotherapist',
    rating: p.rating_avg ?? 0,
    reviewCount: p.rating_count ?? 0,
    location: p.city ?? 'India',
    lat: p.lat,
    lng: p.lng,
    distance: p.distance ?? '',
    isLive: !!p.next_available_slot,
    nextSlot: p.next_available_slot
      ? formatIndiaDateTime(p.next_available_slot, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Check availability',
    visitTypes: (p.visit_types ?? []).map((v) => VISIT_TYPE_LABELS[v] ?? v),
    fee: p.consultation_fee_inr ?? 0,
    avatarUrl: p.avatar_url,
    icpVerified: p.verified,
    availabilityPreview: p.availability_preview,
  }
}

const CONDITION_SPECIALTY_MAP: Record<string, string> = {
  'sports rehab': 'Sports Physio',
  'sports injury': 'Sports Physio',
  'sports physiotherapy': 'Sports Physio',
  'sports physio': 'Sports Physio',
  'neuro care': 'Neuro Physio',
  'neurological physiotherapy': 'Neuro Physio',
  'neuro physio': 'Neuro Physio',
  'orthopedic physiotherapy': 'Ortho Physio',
  'orthopaedic physiotherapy': 'Ortho Physio',
  'ortho physio': 'Ortho Physio',
  'knee rehab': 'Ortho Physio',
  'shoulder pain': 'Ortho Physio',
  'knee pain': 'Ortho Physio',
  'hip pain': 'Ortho Physio',
  'heel pain': 'Ortho Physio',
  'arthritis': 'Ortho Physio',
  'post-surgery': 'Post-Surgery Rehab',
  'post-surgery recovery': 'Post-Surgery Rehab',
  'post-surgical rehabilitation': 'Post-Surgery Rehab',
  'back pain': 'Pain Management',
  'neck pain': 'Pain Management',
  'joint stiffness': 'Pain Management',
  'slip disc': 'Pain Management',
  'sciatica': 'Pain Management',
  'posture issues': 'Pain Management',
  'daily pain relief': 'Pain Management',
  'spinal cord injury': 'Neuro Physio',
  'balance issues': 'Neuro Physio',
  'stroke recovery': 'Neuro Physio',
  "women's health": "Women's Health",
  "women's health physiotherapy": "Women's Health",
  'pregnancy pain': "Women's Health",
  'pediatric care': 'Paediatric Physio',
  'kids physio': 'Paediatric Physio',
  'paediatric physio': 'Paediatric Physio',
  'paediatric physiotherapy': 'Paediatric Physio',
  'elderly care': 'Geriatric Physio',
  'geriatric care': 'Geriatric Physio',
  'geriatric physiotherapy': 'Geriatric Physio',
  'ankle sprain': 'Sports Physio',
}

function normalizeConditionTerm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function resolveConditionFilters(condition: string | null): {
  specialty: string | null
  visitType: 'home_visit' | null
  query: string | null
} {
  if (!condition) {
    return { specialty: null, visitType: null, query: null }
  }

  const normalizedCondition = normalizeConditionTerm(condition)
  const mappedSpecialty = CONDITION_SPECIALTY_MAP[normalizedCondition] ?? null
  const visitType = normalizedCondition === 'home visits' || normalizedCondition === 'home visit'
    ? 'home_visit'
    : null

  return {
    specialty: mappedSpecialty,
    visitType,
    query: mappedSpecialty || visitType ? null : condition,
  }
}

export default function SearchContent({ locale }: { locale?: StaticLocale } = {}) {
  const t = SEARCH_COPY[locale ?? 'en']
  const searchBasePath = locale === 'hi' ? '/hi/search' : '/search'
  const searchParams = useSearchParams()
  const router = useRouter()
  const [hoveredDoctorId, setHoveredDoctorId] = useState<string | null>(null)

  const location = searchParams.get('location')
  const city = searchParams.get('city') ?? location
  const condition = searchParams.get('condition')
  const conditionFilters = useMemo(() => resolveConditionFilters(condition), [condition])

  const specialty = searchParams.get('specialty') ?? conditionFilters.specialty
  const visit_type = searchParams.get('visit_type') ?? conditionFilters.visitType
  const max_fee = searchParams.get('max_fee')
  const sort = searchParams.get('sort')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const fetchUrl = useMemo(() => {
    const apiParams: Record<string, string> = { page: '1', limit: '40' }
    if (city) apiParams.city = city
    if (specialty) apiParams.specialty_id = specialty
    if (conditionFilters.query) apiParams.query = conditionFilters.query
    if (visit_type === 'in_clinic' || visit_type === 'home_visit') apiParams.visit_type = visit_type
    if (sort) apiParams.sort = sort
    if (max_fee) apiParams.max_fee_inr = max_fee
    if (lat) apiParams.lat = lat
    if (lng) apiParams.lng = lng
    return `/api/providers?${new URLSearchParams(apiParams).toString()}`
  }, [city, specialty, conditionFilters.query, visit_type, sort, max_fee, lat, lng])

  const { data, error: swrError, isLoading: swrLoading, mutate } = useSWR<SearchResponse>(
    fetchUrl,
    fetchSearchResults,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000
    }
  )

  const doctors = useMemo(() => data?.providers.map(providerToDoctor) ?? [], [data])
  const total = data?.total ?? 0
  const loading = swrLoading && !data
  const error = Boolean(swrError)

  const displayLocation = (lat && lng) ? 'Near Me' : city ?? location ?? 'India'

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8F9]">

      {/* ── Search Header ── */}
      <header className="z-30 bg-white border-b border-[#E5E7EB]/80 flex-shrink-0 sticky top-[56px]">
        <div className="max-w-[1142px] mx-auto px-4 sm:px-6 md:px-10 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-[#999] mb-3">
            <Link href="/" className="hover:text-[#00766C] transition-colors">Home</Link>
            <ChevronRight size={11} className="text-[#D1D5DB]" />
            <span className="text-[#333] font-medium">{displayLocation}</span>
            {specialty && (
              <>
                <ChevronRight size={11} className="text-[#D1D5DB]" />
                <span className="text-[#333] font-medium">{specialty}</span>
              </>
            )}
          </nav>

          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#333] tracking-tight leading-tight">
              {loading ? t.headingLoading : total > 0 ? t.headingResults(total) : t.headingEmpty}
            </h1>
            {loading && (
              <div className="w-5 h-5 rounded-full border-2 border-[#E5E7EB] border-t-[#00766C] animate-spin shrink-0" />
            )}
          </div>

          {/* Filters */}
          <SearchFilters total={total} basePath={searchBasePath} />
        </div>
      </header>

      {/* ── Main Results ── */}
      <main className="flex-1">
        <div className="max-w-[1142px] mx-auto py-6 sm:py-8 px-4 sm:px-6 md:px-10">
          {loading ? (
            <div className="flex flex-col gap-5">
              {[...Array(3)].map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-12">
              {/* Empty state — clean, modern design */}
              <div className="max-w-lg mx-auto text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F4F3] flex items-center justify-center mx-auto mb-5">
                  <SearchIcon size={28} className="text-[#00766C]" />
                </div>

                <h2 className="text-[20px] font-bold text-[#333] mb-2">{t.emptyTitle}</h2>
                <p className="text-[14px] text-[#666] leading-relaxed mb-6">
                  {t.emptyDescription(displayLocation)}
                </p>

                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 text-left">
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-amber-800">{t.errorTitle}</p>
                      <p className="text-[12px] text-amber-700/80 mt-0.5">{t.errorBody}</p>
                    </div>
                    <button
                      onClick={() => { void mutate() }}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-amber-700 transition-colors"
                    >
                      <RefreshCw size={12} />
                      {t.retrySearch}
                    </button>
                  </div>
                )}

                {/* Suggested searches */}
                <div className="mb-6">
                  <p className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">Try searching for</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_SEARCHES.map((s) => (
                      <Link
                        key={s.label}
                        href={locale === 'hi' ? s.href.replace('/search', '/hi/search') : s.href}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#333] hover:border-[#00766C]/30 hover:bg-[#E6F4F3]/30 transition-all"
                      >
                        <span>{s.emoji}</span>
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(searchBasePath)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#00766C] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#005A52] transition-colors"
                >
                  {t.clearFilters}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-16">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-amber-800">{t.errorTitle}</p>
                    <p className="text-[12px] text-amber-700/80 mt-0.5">{t.errorBodyRetrying}</p>
                  </div>
                  <button
                    onClick={() => { void mutate() }}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-amber-700 transition-colors"
                  >
                    <RefreshCw size={12} />
                    {t.retrySearch}
                  </button>
                </div>
              )}

              {/* Result count badge */}
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#00766C]" />
                <span className="text-[13px] font-medium text-[#666]">
                  Showing {doctors.length} of {total} physiotherapists in <span className="text-[#333] font-semibold">{displayLocation}</span>
                </span>
              </div>

              {doctors.map((doctor) => (
                <div key={doctor.id} id={`doctor-${doctor.id}`}>
                  <DoctorCard
                    doctor={doctor}
                    isHovered={hoveredDoctorId === doctor.id}
                    onMouseEnter={() => setHoveredDoctorId(doctor.id)}
                    onMouseLeave={() => setHoveredDoctorId(null)}
                  />
                </div>
              ))}

              <FeaturedDoctors />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
