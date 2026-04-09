'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import FeaturedDoctors from '@/components/FeaturedDoctors'
import { EmptyState } from '@/components/ui/EmptyState'
import SearchFilters from './SearchFilters'
import { Search as SearchIcon, ChevronRight } from 'lucide-react'
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
  { label: 'Sports Physio', href: '/search?specialty=Sports%20Physio' },
  { label: 'Back Pain', href: '/search?specialty=Pain%20Management' },
  { label: 'Home Visits', href: '/search?visit_type=home_visit' },
  { label: 'Post-Surgery Rehab', href: '/search?specialty=Post-Surgery%20Rehab' },
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
    isLive: !!p.next_available_slot, // Mark as live if there is a detected slot
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
  'arthritis': 'Ortho Physio',
  'post-surgery': 'Post-Surgery Rehab',
  'post-surgery recovery': 'Post-Surgery Rehab',
  'post-surgical rehabilitation': 'Post-Surgery Rehab',
  'back pain': 'Pain Management',
  'neck pain': 'Pain Management',
  'daily pain relief': 'Pain Management',
  'spinal cord injury': 'Neuro Physio',
  "women's health": "Women's Health",
  "women's health physiotherapy": "Women's Health",
  'pediatric care': 'Paediatric Physio',
  'paediatric physio': 'Paediatric Physio',
  'paediatric physiotherapy': 'Paediatric Physio',
  'geriatric care': 'Geriatric Physio',
  'geriatric physiotherapy': 'Geriatric Physio',
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
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // Memoize API endpoint to only trigger SWR on search change
  const fetchUrl = useMemo(() => {
    const apiParams: Record<string, string> = { page: '1', limit: '40' }
    if (city) apiParams.city = city
    if (specialty) apiParams.specialty_id = specialty
    if (conditionFilters.query) apiParams.query = conditionFilters.query
    if (visit_type === 'in_clinic' || visit_type === 'home_visit') apiParams.visit_type = visit_type
    if (max_fee) apiParams.max_fee_inr = max_fee
    if (lat) apiParams.lat = lat
    if (lng) apiParams.lng = lng
    return `/api/providers?${new URLSearchParams(apiParams).toString()}`
  }, [city, specialty, conditionFilters.query, visit_type, max_fee, lat, lng])

  // Polling with SWR (Phase 11.5)
  const { data, error: swrError, isLoading: swrLoading, mutate } = useSWR<SearchResponse>(
    fetchUrl,
    fetchSearchResults,
    { 
      refreshInterval: 30000, // 30 seconds poll
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
    <div className="flex flex-col min-h-screen bg-bp-surface selection:bg-bp-accent/10 selection:text-bp-accent">
      
      {/* ── Search Header ── */}
      <header className="z-30 bg-white/90 backdrop-blur-xl border-b border-bp-border/60 flex-shrink-0 sticky top-[56px]">
        <div className="max-w-[1142px] mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center gap-2 text-[12px] text-bp-body/50 mb-3">
            <Link href="/" className="hover:text-bp-accent transition-colors">{t.breadcrumbRoot}</Link>
            <ChevronRight size={12} />
            <span>{displayLocation}</span>
            {specialty && (
              <>
                <ChevronRight size={12} />
                <span>{specialty}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-[24px] md:text-[32px] font-bold text-bp-primary tracking-tight leading-none">
              {loading ? t.headingLoading : total > 0 ? t.headingResults(total) : t.headingEmpty}
            </h1>
            {loading && <div className="w-6 h-6 rounded-full border-3 border-bp-surface border-t-bp-accent animate-spin shrink-0" />}
          </div>
          <SearchFilters total={total} basePath={searchBasePath} />
        </div>
      </header>

      {/* ── Main Results ── */}
      <main className="flex-1">
        <div className="max-w-[1142px] mx-auto py-10 px-6 md:px-10">
          {loading ? (
            <div className="flex flex-col gap-10">
              {[...Array(3)].map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="pt-8 pb-32">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription(displayLocation)}
                icon={SearchIcon}
                action={
                  <div className="w-full max-w-5xl space-y-6">
                    {error && (
                      <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">{t.errorTitle}</p>
                          <p className="mt-1 text-[14px] font-medium leading-relaxed text-amber-900/80">
                            {t.errorBody}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            void mutate()
                          }}
                          className="inline-flex items-center justify-center rounded-full bg-[#00766C] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#005A52]"
                        >
                          {t.retrySearch}
                        </button>
                      </div>
                    )}

                    <p className="text-[14px] text-slate-600 leading-relaxed max-w-md mx-auto">
                      We&apos;re onboarding verified physiotherapists in your area. Try a different search or browse by category:
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                      {SUGGESTED_SEARCHES.map((s) => (
                        <Link
                          key={s.label}
                          href={locale === 'hi' ? s.href.replace('/search', '/hi/search') : s.href}
                          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#00766C] hover:border-[#00766C]/30 hover:shadow-sm transition-all"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => router.push(searchBasePath)}
                        className="rounded-full bg-[#00766C] px-8 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_12px_rgba(0,118,108,0.18)]"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-700">
              {error && (
                <div className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-5 text-left md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">{t.errorTitle}</p>
                    <p className="mt-1 text-[14px] font-medium leading-relaxed text-amber-900/80">
                      {t.errorBodyRetrying}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      void mutate()
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-[#00766C] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#005A52]"
                  >
                    {t.retrySearch}
                  </button>
                </div>
              )}
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

              {/* Explore More — shown below results as a discovery section */}
              <FeaturedDoctors />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
