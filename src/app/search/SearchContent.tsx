'use client'

import { useState, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import { type Doctor } from '@/components/DoctorCard'
import SearchResultsReels from '@/app/search/SearchResultsReels'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import { SpecialtyCTARail } from '@/components/specialties/SpecialtyCTARail'
import SearchFilters from './SearchFilters'
import { PatientSearchFiltersRail } from '@/app/patient/search/PatientSearchFiltersRail'
import { Search as SearchIcon, RefreshCw, ArrowRight, SlidersHorizontal } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import { getProviderDisplayName } from '@/lib/providers/display-name'
import type { SearchResponse } from '@/app/api/contracts/search'
import { SEARCH_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'
import { formatIndiaDateTime } from '@/lib/india-date'
import { conditionSlugToSpecialtySlug } from '@/lib/conditions'
import { useUiV2 } from '@/hooks/useUiV2'
import { cn } from '@/lib/utils'

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
    qualification: p.qualification ?? null,
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

  // Check slug-based conditions first (from specialty article pages)
  const slugMapped = conditionSlugToSpecialtySlug(condition)
  if (slugMapped) {
    return { specialty: slugMapped, visitType: null, query: null }
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

export type SearchContentVariant = 'public' | 'patient'

export default function SearchContent({
  locale,
  variant = 'public',
}: { locale?: StaticLocale; variant?: SearchContentVariant } = {}) {
  const t = SEARCH_COPY[locale ?? 'en']
  const searchBasePath =
    variant === 'patient' ? '/patient/search' : locale === 'hi' ? '/hi/search' : '/search'
  const searchParams = useSearchParams()
  const router = useRouter()
  const isV2 = useUiV2()
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false)

  const location = searchParams.get('location')
  const city = searchParams.get('city') ?? location
  const condition = searchParams.get('condition')
  const conditionFilters = useMemo(() => resolveConditionFilters(condition), [condition])

  const specialty = searchParams.get('specialty') ?? conditionFilters.specialty
  const visit_type = searchParams.get('visit_type') ?? conditionFilters.visitType
  const qualification = searchParams.get('qualification')
  const max_fee = searchParams.get('max_fee')
  const sort = searchParams.get('sort')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const pincode = searchParams.get('pincode')

  const fetchUrl = useMemo(() => {
    const apiParams: Record<string, string> = { page: '1', limit: '40' }
    if (city) apiParams.city = city
    if (pincode) apiParams.pincode = pincode
    if (specialty) apiParams.specialty_id = specialty
    if (conditionFilters.query) apiParams.query = conditionFilters.query
    if (visit_type === 'in_clinic' || visit_type === 'home_visit') apiParams.visit_type = visit_type
    if (qualification) apiParams.qualification = qualification
    if (sort) apiParams.sort = sort
    if (max_fee) apiParams.max_fee_inr = max_fee
    if (lat) apiParams.lat = lat
    if (lng) apiParams.lng = lng
    return `/api/providers?${new URLSearchParams(apiParams).toString()}`
  }, [city, pincode, specialty, conditionFilters.query, visit_type, qualification, sort, max_fee, lat, lng])

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

  const displayLocation =
    lat && lng ? 'Near Me' : pincode ? `Pin ${pincode}` : city ?? location ?? 'India'

  const headerStickyTop = variant === 'patient' ? 'top-0' : 'top-[56px]'
  const homeCrumbHref = variant === 'patient' ? '/patient/dashboard' : '/'

  const mapSuggestedHref = (href: string) => {
    if (variant === 'patient') return href.replace('/search', '/patient/search')
    if (locale === 'hi') return href.replace('/search', '/hi/search')
    return href
  }

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
  const cityForSearchLink = city ?? location ?? ''
  const locationSearchUrl = cityForSearchLink
    ? `${searchBasePath}?city=${encodeURIComponent(cityForSearchLink)}`
    : searchBasePath

  const breadcrumbJsonLd = useMemo(() => {
    const origin = new URL(siteOrigin).origin
    const cityHref = new URL(locationSearchUrl, origin).href
    const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: displayLocation,
        item: cityHref,
      },
    ]
    if (specialty) {
      const withSpecialty = `${locationSearchUrl}${locationSearchUrl.includes('?') ? '&' : '?'}specialty=${encodeURIComponent(specialty)}`
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: specialty,
        item: new URL(withSpecialty, origin).href,
      })
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    }
  }, [displayLocation, locationSearchUrl, siteOrigin, specialty])

  const activeFilterCount = useMemo(() => {
    const currentCity = city ?? ''
    const currentVisitTypeRaw = searchParams.get('visit_type') ?? ''
    const currentMaxFee = Number(searchParams.get('max_fee') ?? '2000')
    const currentSpecialty = searchParams.get('specialty') ?? ''
    const currentQualification = searchParams.get('qualification') ?? ''
    const currentSort = searchParams.get('sort') ?? ''
    return [
      currentCity !== '',
      currentVisitTypeRaw !== '',
      currentMaxFee !== 2000,
      currentSpecialty !== '',
      currentQualification !== '',
      currentSort !== '',
    ].filter(Boolean).length
  }, [city, searchParams])

  const handleOpenFilters = useCallback(() => {
    setFiltersDrawerOpen(true)
  }, [])

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#F7F8F9]">

      {/* ── Search Header ── */}
      <header
        className={cn(
          'z-30 flex-shrink-0 border-b border-[#E5E7EB]/80 bg-white',
          headerStickyTop
        )}
      >
        <div className="max-w-[1142px] mx-auto px-4 sm:px-6 md:px-10 py-3">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
          {/* Breadcrumb — SEO + screen readers only */}
          <nav aria-label="Breadcrumb" className="sr-only">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12px]">
              <li>
                <Link href={homeCrumbHref} className="hover:text-[#00766C] transition-colors">
                  {variant === 'patient' ? 'Patient' : 'Home'}
                </Link>
              </li>
              <li aria-hidden className="text-[#D1D5DB]">›</li>
              <li>
                <Link href={locationSearchUrl} className="hover:text-[#00766C] transition-colors">{displayLocation}</Link>
              </li>
              {specialty && (
                <>
                  <li aria-hidden className="text-[#D1D5DB]">›</li>
                  <li>
                    <span className="text-[#333] font-medium">{specialty}</span>
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Clean title — context only, no count */}
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-[#333] md:text-lg leading-tight">
              {loading
                ? 'Finding physios…'
                : specialty
                  ? `${specialty} · ${displayLocation}`
                  : displayLocation}
            </h1>
            {loading && (
              <div className="w-4 h-4 rounded-full border-2 border-[#E5E7EB] border-t-[#00766C] animate-spin shrink-0" />
            )}
          </div>

          {/* Filters drawer — patient v2: dedicated rail; otherwise shared drawer */}
          {variant === 'patient' && isV2 ? (
            <PatientSearchFiltersRail basePath={searchBasePath} total={total} />
          ) : (
            <SearchFilters
              total={total}
              basePath={searchBasePath}
              drawerOpen={filtersDrawerOpen}
              onDrawerOpenChange={setFiltersDrawerOpen}
              hideMobileFilterBar
              hideDesktopPills
            />
          )}

          {/* v2: specialty CTA rail when a specialty filter is active */}
          {isV2 && specialty && (
            <div className="mt-2 -mx-1">
              <SpecialtyCTARail
                specialtyLabel={specialty}
                bookingHref={`${searchBasePath}?specialty=${encodeURIComponent(specialty)}`}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Main Results — full-height snap scroll ── */}
      <main className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="h-full overflow-y-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col gap-5 max-w-3xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="h-full overflow-y-auto px-4 sm:px-6 py-12">
            {/* Empty state */}
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-[var(--sq-lg)] bg-[#E6F4F3] flex items-center justify-center mx-auto mb-5">
                <SearchIcon size={28} className="text-[#00766C]" />
              </div>

              <h2 className="text-[20px] font-bold text-[#333] mb-2">{t.emptyTitle}</h2>
              <p className="text-[14px] text-[#666] leading-relaxed mb-6">
                {t.emptyDescription(displayLocation)}
              </p>

              {error && (
                <div className="flex items-center gap-3 rounded-[var(--sq-sm)] border border-amber-200 bg-amber-50 p-4 mb-6 text-left">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-amber-800">{t.errorTitle}</p>
                    <p className="text-[12px] text-amber-700/80 mt-0.5">{t.errorBody}</p>
                  </div>
                  <button
                    onClick={() => { void mutate() }}
                    className="shrink-0 flex items-center gap-1.5 rounded-[var(--sq-xs)] bg-amber-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-amber-700 transition-colors"
                  >
                    <RefreshCw size={12} />
                    {t.retrySearch}
                  </button>
                </div>
              )}

              <div className="mb-6">
                <p className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">Try searching for</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_SEARCHES.map((s) => (
                    <Link
                      key={s.label}
                      href={mapSuggestedHref(s.href)}
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
          <>
            {error && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 rounded-[var(--sq-sm)] border border-amber-200 bg-amber-50 px-4 py-2 text-left shadow-md max-w-sm w-full mx-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-amber-800">{t.errorTitle}</p>
                </div>
                <button
                  onClick={() => { void mutate() }}
                  className="shrink-0 flex items-center gap-1.5 rounded-[var(--sq-xs)] bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  <RefreshCw size={11} />
                  {t.retrySearch}
                </button>
              </div>
            )}
            <SearchResultsReels results={doctors} />
          </>
        )}
      </main>

      {/* ── Floating Filters FAB ── */}
      {doctors.length > 0 && (
        <button
          type="button"
          onClick={handleOpenFilters}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-[#00766C] px-5 py-3 text-[13px] font-bold text-white shadow-xl shadow-[#00766C]/20 hover:bg-[#005A52] active:scale-[0.97] transition-all"
        >
          <SlidersHorizontal size={15} />
          Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </button>
      )}
    </div>
  )
}
