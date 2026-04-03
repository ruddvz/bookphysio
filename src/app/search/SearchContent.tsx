'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import SearchFilters from './SearchFilters'
import { Search as SearchIcon, MapPin, SlidersHorizontal, ChevronRight, Activity, Zap, ArrowRight, Sparkles, Calendar } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import { cn } from '@/lib/utils'
import type { SearchResponse } from '@/app/api/contracts/search'

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
}

const DEMO_RESULTS = [
  {
    title: 'Sports Rehab Starter',
    specialty: 'ACL and runner return-to-play',
    city: 'Bangalore',
    fee: '₹800',
    nextSlot: 'Today · 6:30 PM',
    icon: Activity,
    href: '/search?city=Bangalore&specialty=Sports%20Physio',
    coverage: 'Koramangala, Indiranagar',
    availability: '94%'
  },
  {
    title: 'Back Pain Fast Track',
    specialty: 'Spine and posture support',
    city: 'Delhi',
    fee: '₹900',
    nextSlot: 'Tomorrow · 10:30 AM',
    icon: MapPin,
    href: '/search?city=Delhi&specialty=Pain%20Management',
    coverage: 'South Delhi, Saket',
    availability: '88%'
  },
  {
    title: 'Home Visit Preview',
    specialty: 'Mobility support at home',
    city: 'Mumbai',
    fee: '₹1,200',
    nextSlot: 'Today · Evening',
    icon: Zap,
    href: '/search?visit_type=home_visit',
    coverage: 'Bandra, Juhu, Andheri',
    availability: '100%'
  },
  {
    title: 'Post-op Recovery',
    specialty: 'Shoulder and knee follow-up',
    city: 'Pune',
    fee: '₹1,000',
    nextSlot: 'Soon',
    icon: Sparkles,
    href: '/search?specialty=Post-Surgery%20Rehab',
    coverage: 'Kothrud, Baner',
    availability: '76%'
  },
]

async function fetchSearchResults(url: string): Promise<SearchResponse> {
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Provider search failed with status ${response.status}`)
  }

  return response.json() as Promise<SearchResponse>
}

function providerToDoctor(p: ProviderCard): Doctor {
  const nameWithTitle = p.full_name.startsWith('Dr.') ? p.full_name : `Dr. ${p.full_name}`
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
    distance: '',
    isLive: !!p.next_available_slot, // Mark as live if there is a detected slot
    nextSlot: p.next_available_slot
      ? new Date(p.next_available_slot).toLocaleString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Check availability',
    visitTypes: (p.visit_types ?? []).map((v) => VISIT_TYPE_LABELS[v] ?? v),
    fee: p.consultation_fee_inr ?? 0,
    icpVerified: p.verified,
  }
}

const POPULAR_CITIES = [
  { name: 'Mumbai', icon: '🏙️' },
  { name: 'Delhi', icon: '🏛️' },
  { name: 'Bangalore', icon: '💻' },
  { name: 'Chennai', icon: '🌊' },
  { name: 'Hyderabad', icon: '🕌' },
  { name: 'Pune', icon: '📚' },
  { name: 'Kolkata', icon: '🎭' },
  { name: 'Ahmedabad', icon: '🏗️' },
  { name: 'Jaipur', icon: '🏰' },
  { name: 'Surat', icon: '💎' },
]

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [hoveredDoctorId, setHoveredDoctorId] = useState<string | null>(null)

  const location = searchParams.get('location')
  const city = searchParams.get('city')

  // Handle city selection from chips
  const handleCitySelect = (selectedCity: string) => {
    const params = new URLSearchParams(searchParams)
    if (selectedCity === city) {
      params.delete('city')
    } else {
      params.set('city', selectedCity)
    }
    params.delete('location')
    router.push(`/search?${params.toString()}`)
  }

  const specialty = searchParams.get('specialty')
  const visit_type = searchParams.get('visit_type')
  const max_fee = searchParams.get('max_fee')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // Memoize API endpoint to only trigger SWR on search change
  const fetchUrl = useMemo(() => {
    const apiParams: Record<string, string> = { page: '1', limit: '40' }
    if (city) apiParams.city = city
    else if (location) apiParams.city = location
    if (specialty) apiParams.specialty_id = specialty
    if (visit_type === 'in_clinic' || visit_type === 'home_visit') apiParams.visit_type = visit_type
    if (max_fee) apiParams.max_fee_inr = max_fee
    if (lat) apiParams.lat = lat
    if (lng) apiParams.lng = lng
    return `/api/providers?${new URLSearchParams(apiParams).toString()}`
  }, [city, location, specialty, visit_type, max_fee, lat, lng])

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
      <header className="z-30 bg-white border-b border-bp-border flex-shrink-0">
        <div className="max-w-[1142px] mx-auto px-6 md:px-10 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-bp-body/60">
                <Link href="/" className="hover:text-bp-accent transition-colors">Find Physios</Link>
                <ChevronRight size={12} strokeWidth={4} />
                <span className="text-bp-accent bg-bp-accent/5 px-2.5 py-1 rounded-lg border border-bp-accent/10">{displayLocation}</span>
                {specialty && (
                  <>
                    <ChevronRight size={12} strokeWidth={4} />
                    <span className="text-bp-body">{specialty}</span>
                  </>
                )}
              </div>
              <h1 className="text-[32px] md:text-[42px] font-bold text-bp-primary tracking-tighter leading-none flex items-center gap-4">
                {loading ? 'Sourcing Top Experts' : total > 0 ? `${total} Top Experts Found` : 'Search Results'}
                {loading && <div className="w-8 h-8 rounded-full border-4 border-bp-surface border-t-bp-accent animate-spin shrink-0" />}
              </h1>
              <p className="text-[15px] font-medium text-bp-body/70 tracking-tight leading-relaxed">Verified physiotherapy clinic & home-visit experts available in {displayLocation}.</p>
            </div>
          </div>
          
          <SearchFilters total={total} />
        </div>
      </header>

      {/* ── City Chips Bar ── */}
      <div className="bg-white border-b border-bp-border">
        <div className="max-w-[1142px] mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[11px] font-black text-bp-body/40 uppercase tracking-widest whitespace-nowrap mr-2">
              <MapPin size={12} className="inline -mt-0.5 mr-1" />
              Cities
            </span>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c.name}
                onClick={() => handleCitySelect(c.name)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95 border",
                  city === c.name
                    ? "bg-bp-primary text-white border-bp-primary shadow-lg shadow-bp-primary/10"
                    : "bg-bp-surface text-bp-body border-bp-border hover:border-bp-accent/30 hover:bg-bp-accent/5 hover:text-bp-primary"
                )}
              >
                <span className="text-[14px]">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

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
                title="No exact matches found"
                description={`We couldn't locate any verified physios matching your criteria in ${displayLocation}. Here is a preview of how BookPhysio surfaces nearby care.`}
                icon={SearchIcon}
                action={
                  <div className="w-full max-w-5xl space-y-6">
                    {error && (
                      <div className="flex flex-col gap-4 rounded-[28px] border border-amber-100 bg-amber-50/70 p-5 text-left md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">Search sync unavailable</p>
                          <p className="mt-1 text-[14px] font-medium leading-relaxed text-amber-900/80">
                            Live results could not be loaded just now, but the demo preview below still shows the intended result flow.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            void mutate()
                          }}
                          className="inline-flex items-center justify-center rounded-btn bg-bp-primary px-5 py-3 text-[13px] font-black text-white transition-all hover:bg-bp-accent"
                        >
                          Retry search
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-bp-body/40">
                      <span className="inline-flex items-center gap-2 rounded-full border border-bp-accent/20 bg-bp-accent/5 px-3 py-1 text-bp-accent">
                        <Sparkles size={12} />
                        Demo preview
                      </span>
                      <span>These cards show how live results will look once providers match.</span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {DEMO_RESULTS.map((result) => {
                        const ResultIcon = result.icon

                        return (
                          <Link
                            key={result.title}
                            href={result.href}
                            className="group relative overflow-hidden rounded-[30px] border border-bp-border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-bp-accent/30 hover:shadow-2xl"
                          >
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-bp-accent/5 blur-2xl transition-all group-hover:scale-150" />
                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-bp-secondary/5 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="inline-flex items-center gap-2 rounded-full border border-bp-accent/10 bg-bp-accent/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-bp-accent">
                                  <Sparkles size={10} />
                                  Preview
                                </div>
                                <h3 className="mt-4 text-[20px] font-black leading-tight tracking-tight text-bp-primary group-hover:text-bp-accent transition-colors">{result.title}</h3>
                                <p className="mt-2 text-[14px] font-medium leading-relaxed text-bp-body/80">{result.specialty}</p>
                              </div>
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-bp-accent/10 text-bp-accent shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-bp-accent group-hover:text-white group-hover:shadow-bp-accent/20">
                                <ResultIcon size={24} strokeWidth={2.5} />
                              </div>
                            </div>

                            <div className="relative mt-6 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bp-surface text-bp-body/40 group-hover:bg-bp-accent/10 group-hover:text-bp-accent transition-colors">
                                  <MapPin size={14} />
                                </div>
                                <span className="text-[13px] font-bold text-bp-body truncate">{result.coverage}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bp-surface text-bp-body/40 group-hover:bg-bp-accent/10 group-hover:text-bp-accent transition-colors">
                                  <Calendar size={14} />
                                </div>
                                <span className="text-[13px] font-bold text-bp-body">
                                  Next: <span className="text-bp-accent">{result.nextSlot}</span>
                                </span>
                              </div>
                            </div>

                            <div className="relative mt-6 flex items-center justify-between border-t border-bp-border/60 pt-5">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-bp-accent animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40">
                                  {result.availability} Match
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[16px] font-black text-bp-primary">{result.fee}</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bp-surface text-bp-body/40 group-hover:bg-bp-secondary group-hover:text-white transition-all duration-300">
                                  <ArrowRight size={16} strokeWidth={3} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => router.push('/search')}
                        className="px-12 py-5 bg-bp-primary text-white text-[16px] font-black rounded-btn hover:bg-bp-accent shadow-2xl active:scale-[0.98] transition-all transform hover:-translate-y-1"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-32 animate-in fade-in duration-1000">
              {error && (
                <div className="flex flex-col gap-4 rounded-[28px] border border-amber-100 bg-amber-50/70 p-5 text-left md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">Search sync unavailable</p>
                    <p className="mt-1 text-[14px] font-medium leading-relaxed text-amber-900/80">
                      Showing the latest available provider results while we retry the live search.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      void mutate()
                    }}
                    className="inline-flex items-center justify-center rounded-btn bg-bp-primary px-5 py-3 text-[13px] font-black text-white transition-all hover:bg-bp-accent"
                  >
                    Retry search
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-bp-accent/10 rounded-lg text-bp-accent"><Zap size={16} strokeWidth={3} /></div>
                   <p className="text-[13px] font-black text-bp-primary uppercase tracking-[0.15em]">Verified Professionals</p>
                </div>
                <div className="md:hidden">
                  <button className="flex items-center gap-2 text-[14px] font-black text-bp-accent px-4 py-2 bg-bp-accent/10 rounded-xl border border-bp-accent/20">
                     <SlidersHorizontal size={14} strokeWidth={3} />
                     Sort
                  </button>
                </div>
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
              
              {/* End of List */}
              <div className="py-16 text-center border-t border-bp-border mt-8 bg-bp-surface/50 rounded-[32px] px-8">
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-white border border-bp-border rounded-full text-[10px] font-black uppercase text-bp-body/40 tracking-widest">
                   Safety Verified
                </div>
                <p className="text-[18px] font-bold text-bp-body/60 italic max-w-[500px] mx-auto leading-relaxed">
                  &ldquo;Connecting with the right therapist is the first step towards pain-free living.&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
