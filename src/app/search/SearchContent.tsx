'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import SearchFilters from './SearchFilters'
import { Map as MapIcon, List, Search as SearchIcon, MapPin, SlidersHorizontal, ChevronRight, Activity, Zap } from 'lucide-react'
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
  online: 'Online',
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

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true)
      const apiParams: Record<string, string> = { page: '1', limit: '40' } // Larger limit for better clustering
      if (city) apiParams.city = city
      else if (location) apiParams.city = location
      if (specialty) apiParams.specialty_id = specialty
      if (visit_type) apiParams.visit_type = visit_type
      if (max_fee) apiParams.max_fee_inr = max_fee
      if (lat) apiParams.lat = lat
      if (lng) apiParams.lng = lng

      const qs = new URLSearchParams(apiParams).toString()


      try {
        const res = await fetch(`/api/providers?${qs}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json() as SearchResponse
        setDoctors(data.providers.map(providerToDoctor))
        setTotal(data.total)
      } catch {
        setDoctors([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [searchParams, city, location, specialty, visit_type, max_fee, lat, lng])

  const displayLocation = (lat && lng) ? 'Near Me' : city ?? location ?? 'India'


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white selection:bg-[#00766C]/10 selection:text-[#00766C]">
      
      {/* ── Search Header (Premium) ── */}
      <header className="z-30 bg-white border-b border-gray-100 flex-shrink-0 relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <Link href="/" className="hover:text-[#00766C] transition-colors">Find Physios</Link>
                <ChevronRight size={12} strokeWidth={4} />
                <span className="text-[#00766C] bg-[#E6F4F3] px-2.5 py-1 rounded-lg border border-teal-100">{displayLocation}</span>
                {specialty && (
                  <>
                    <ChevronRight size={12} strokeWidth={4} />
                    <span className="text-gray-600">{specialty}</span>
                  </>
                )}
              </div>
              <h1 className="text-[32px] md:text-[42px] font-black text-[#333333] tracking-tighter leading-none flex items-center gap-4">
                {loading ? 'Sourcing Top Experts' : total > 0 ? `${total} Top Experts Found` : 'Search Results'}
                {loading && <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#00766C] animate-spin shrink-0" />}
              </h1>
              <p className="text-[15px] font-bold text-gray-400 tracking-tight leading-relaxed">Verified physiotherapy clinic & home-visit experts available in {displayLocation}.</p>
            </div>

            {/* Desktop Map Interaction Tooltip */}
            <div className="hidden md:flex items-center gap-5 p-2 bg-[#F9FBFC] border border-gray-100 rounded-[24px]">
               <div className="flex flex-col text-right">
                  <span className="text-[14px] font-black text-[#333333] leading-none mb-1">Live Map View</span>
                  <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Toggle on/off</span>
               </div>
               <button
                onClick={() => setShowMap(!showMap)}
                className={cn(
                  "relative w-16 h-8 rounded-full transition-all duration-500 shadow-inner active:scale-95 group overflow-hidden",
                  showMap ? "bg-[#00766C] shadow-teal-900/10" : "bg-gray-100"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity",
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
                    title="No Experts Found"
                    description={`We couldn't locate any verified physios matching your criteria in ${displayLocation}. Expand your search radius or clear filters to see more results.`}
                    icon={SearchIcon}
                    action={
                      <div className="flex flex-col items-center gap-6">
                        <button
                          onClick={() => router.push('/search')}
                          className="px-12 py-5 bg-[#333333] text-white text-[16px] font-black rounded-[24px] hover:bg-[#00766C] shadow-2xl active:scale-[0.98] transition-all transform hover:-translate-y-1"
                        >
                          Clear All Filters
                        </button>
                        <div className="flex items-center gap-10 px-8 py-4 bg-gray-50 rounded-[28px] border border-gray-100 opacity-60">
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
