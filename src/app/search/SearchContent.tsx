'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import SearchFilters from './SearchFilters'
import { Map as MapIcon, List, Search as SearchIcon, MapPin, SlidersHorizontal, ChevronRight, Activity, Zap, ArrowRight, Sparkles } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const CustomIndiaMap = dynamic(() => import('@/components/CustomIndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-6 relative overflow-hidden">
       {/* Background Animated Dots */}
       <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00766C_1px,transparent_1.5px)] [background-size:24px_24px]"></div>
       <div className="w-16 h-16 rounded-full border-2 border-gray-100 border-t-[#00766C] animate-spin" />
       <div>
          <p className="text-[14px] font-black tracking-widest text-[#00766C] uppercase">Projecting Geography</p>
          <div className="w-24 h-1 bg-gray-100 rounded-full mt-2 relative overflow-hidden">
             <div className="absolute inset-y-0 left-0 bg-[#00766C] animate-progress-indeterminate"></div>
          </div>
       </div>
    </div>
  )
})

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
  },
  {
    title: 'Back Pain Fast Track',
    specialty: 'Spine and posture support',
    city: 'Delhi',
    fee: '₹900',
    nextSlot: 'Tomorrow · 10:30 AM',
    icon: MapPin,
    href: '/search?city=Delhi&specialty=Pain%20Management',
  },
  {
    title: 'Home Visit Preview',
    specialty: 'Mobility support at home',
    city: 'Mumbai',
    fee: '₹1,200',
    nextSlot: 'Today · Evening',
    icon: Zap,
    href: '/search?visit_type=home_visit',
  },
  {
    title: 'Post-op Recovery',
    specialty: 'Shoulder and knee follow-up',
    city: 'Pune',
    fee: '₹1,000',
    nextSlot: 'Soon',
    icon: Sparkles,
    href: '/search?specialty=Post-Surgery%20Rehab',
  },
]

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
    icpVerified: true, // Assuming high-quality from top-level results
  }
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [hoveredDoctorId, setHoveredDoctorId] = useState<string | null>(null)

  const condition = searchParams.get('condition')
  const location = searchParams.get('location')
  const city = searchParams.get('city')

  // Handle city selection from map
  const handleCitySelect = (selectedCity: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('city', selectedCity)
    params.delete('location') // Remove location param when city is selected
    router.push(`/search?${params.toString()}`)
  }

  // Handle provider selection from map
  const handleProviderSelect = (providerId: string) => {
    setHoveredDoctorId(providerId)
    // Scroll to provider in list (optional enhancement)
    const element = document.getElementById(`doctor-${providerId}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
  const { data, error: swrError, isLoading: swrLoading } = useSWR<SearchResponse>(
    fetchUrl,
    (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json()),
    { 
      refreshInterval: 30000, // 30 seconds poll
      revalidateOnFocus: true,
      dedupingInterval: 5000
    }
  )

  useEffect(() => {
    if (data?.providers) {
      setDoctors(data.providers.map(providerToDoctor))
      setTotal(data.total)
      setLoading(false)
      setError(false)
    }
    if (swrError) {
      setDoctors([])
      setTotal(0)
      setError(true)
      setLoading(false)
    }
  }, [data, swrError])

  const displayLocation = (lat && lng) ? 'Near Me' : city ?? location ?? 'India'


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bp-surface selection:bg-bp-accent/10 selection:text-bp-accent">
      
      {/* ── Search Header (Premium) ── */}
      <header className="z-30 bg-white border-b border-bp-border flex-shrink-0 relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-6 md:py-8">
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

            {/* Desktop Map Interaction Tooltip */}
            <div className="hidden md:flex items-center gap-5 p-2 bg-bp-surface/50 border border-bp-border rounded-[24px]">
               <div className="flex flex-col text-right">
                  <span className="text-[14px] font-bold text-bp-primary leading-none mb-1">Live Map View</span>
                  <span className="text-[11px] font-bold text-bp-body/40 tracking-widest uppercase">Toggle on/off</span>
               </div>
               <button
                onClick={() => setShowMap(!showMap)}
                aria-label={showMap ? 'Hide map view' : 'Show map view'}
                title={showMap ? 'Hide map view' : 'Show map view'}
                className={cn(
                  "relative w-16 h-8 rounded-full transition-all duration-500 shadow-inner active:scale-95 group overflow-hidden",
                  showMap ? "bg-bp-primary shadow-bp-primary/10" : "bg-bp-border/50"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r from-bp-primary to-bp-accent opacity-0 group-hover:opacity-100 transition-opacity",
                  showMap ? "opacity-100" : "opacity-0"
                )}></div>
                <div className={cn(
                  "absolute top-1.5 left-1.5 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md relative z-10",
                  showMap ? "translate-x-8" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
          
          <SearchFilters total={total} />
        </div>
      </header>

      {/* ── Main Results Viewport ── */}
      <main className="flex-1 overflow-hidden relative">
        <div className="flex h-full w-full">
          
          {/* Results column (Smooth Scroll) */}
          <div className={cn(
            "h-full overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] scroll-smooth custom-scrollbar",
            showMap ? "md:w-[60%] lg:w-[65%]" : "w-full",
            mobileView === 'map' ? "hidden md:block" : "block"
          )}>
            <div className="max-w-[850px] mx-auto py-10 px-6 md:px-10">
              {loading ? (
                <div className="flex flex-col gap-10">
                  {[...Array(3)].map((_, i) => (
                    <DoctorCardSkeleton key={i} />
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="pt-16 pb-32">
                  <EmptyState
                    title="No exact matches found"
                    description={`We couldn't locate any verified physios matching your criteria in ${displayLocation}. Here is a premium demo preview of how BookPhysio surfaces nearby care.`}
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
                              onClick={() => fetchProviders()}
                              className="inline-flex items-center justify-center rounded-[22px] bg-[#333333] px-5 py-3 text-[13px] font-black text-white transition-all hover:bg-[#00766C]"
                            >
                              Retry search
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-[#E6F4F3] px-3 py-1 text-[#00766C]">
                            <Sparkles size={12} />
                            Demo preview
                          </span>
                          <span>These cards show how live results will look once providers match.</span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {DEMO_RESULTS.map((result) => {
                            const ResultIcon = result.icon

                            return (
                              <Link
                                key={result.title}
                                href={result.href}
                                className="group rounded-[30px] border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-teal-100 hover:shadow-xl"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                                      Preview result
                                    </div>
                                    <h3 className="mt-3 text-[18px] font-black tracking-tight text-[#333333]">{result.title}</h3>
                                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">{result.specialty}</p>
                                  </div>
                                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#E6F4F3] text-[#00766C] transition-transform group-hover:scale-105">
                                    <ResultIcon size={22} strokeWidth={2.5} />
                                  </div>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                                    {result.city}
                                  </span>
                                  <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                                    {result.fee}
                                  </span>
                                  <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                                    {result.nextSlot}
                                  </span>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Preview search flow</span>
                                  <span className="inline-flex items-center gap-2 text-[13px] font-black text-[#00766C]">
                                    Open
                                    <ArrowRight size={14} />
                                  </span>
                                </div>
                              </Link>
                            )
                          })}
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={() => router.push('/search')}
                            className="px-12 py-5 bg-[#333333] text-white text-[16px] font-black rounded-[24px] hover:bg-[#00766C] shadow-2xl active:scale-[0.98] transition-all transform hover:-translate-y-1"
                          >
                            Clear All Filters
                          </button>
                          <div className="flex items-center gap-10 px-8 py-4 bg-gray-50 rounded-[28px] border border-gray-100 opacity-70">
                             <div className="flex flex-col items-center">
                                <Activity size={24} className="text-[#00766C] mb-1" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Filter</span>
                             </div>
                             <div className="h-8 w-px bg-gray-200" />
                             <div className="flex flex-col items-center">
                                <Zap size={24} className="text-[#FF6B35] mb-1" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instant Reach</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-8 pb-32 animate-in fade-in duration-1000">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 bg-teal-50 rounded-lg text-[#00766C]"><Zap size={16} strokeWidth={3} /></div>
                       <p className="text-[13px] font-black text-[#333333] uppercase tracking-[0.15em]">Verified Professionals</p>
                    </div>
                    <div className="md:hidden">
                      <button className="flex items-center gap-2 text-[14px] font-black text-[#00766C] px-4 py-2 bg-[#E6F4F3] rounded-xl border border-teal-100">
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
                  
                  {/* Strategic End of List Content */}
                  <div className="py-20 text-center border-t border-gray-100 mt-12 bg-gray-50/50 rounded-[40px] px-8">
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase text-gray-400 tracking-widest">
                       Safety Verified
                    </div>
                    <p className="text-[18px] font-bold text-gray-400 italic max-w-[500px] mx-auto leading-relaxed">
                      "Connecting with the right therapist is the first step towards pain-free living. Let us help you find your specialist today."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Map column (Premium) */}
          <div className={cn(
            "h-full border-l border-gray-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl relative z-20",
            showMap ? "md:w-[40%] lg:w-[35%]" : "w-0 border-none opacity-0 overflow-hidden",
            mobileView === 'map' ? "fixed inset-0 z-40 md:relative" : "hidden md:block"
          )}>
            <div className="h-full w-full relative bg-white">
              <CustomIndiaMap
                doctors={doctors}
                hoveredDoctorId={hoveredDoctorId}
                selectedCity={city}
                onCitySelect={handleCitySelect}
                onProviderSelect={handleProviderSelect}
              />

              
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden absolute top-10 left-10 z-50 bg-white p-5 rounded-[24px] shadow-2xl border border-gray-100 text-[#333333] active:scale-95 transition-all flex items-center gap-3 font-black"
              >
                <List size={24} strokeWidth={3} className="text-[#00766C]" />
                Show List
              </button>
            </div>
          </div>
        </div>

        {/* Floating Toggle (Mobile Segmented Control) */}
        <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#333333] p-1.5 rounded-[30px] flex items-center shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
             <button
               onClick={() => setMobileView('list')}
               className={cn(
                  "px-8 py-3.5 rounded-[24px] flex items-center gap-3 font-black text-[15px] transition-all",
                  mobileView === 'list' ? "bg-white text-[#333333]" : "text-white/60"
               )}
             >
                <List size={18} />
                List
             </button>
             <button
               onClick={() => setMobileView('map')}
               className={cn(
                  "px-8 py-3.5 rounded-[24px] flex items-center gap-3 font-black text-[15px] transition-all",
                  mobileView === 'map' ? "bg-white text-[#333333]" : "text-white/60"
               )}
             >
                <MapIcon size={18} />
                Map
             </button>
          </div>
        </div>
      </main>
    </div>
  )
}
