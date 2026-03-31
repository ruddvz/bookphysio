'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardSkeleton } from '@/components/DoctorCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import SearchFilters from './SearchFilters'
import { Map as MapIcon, List, Search as SearchIcon, MapPin, SlidersHorizontal } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import dynamic from 'next/dynamic'

const ProviderMap = dynamic(() => import('@/components/ProviderMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#F5F5F5] animate-pulse flex items-center justify-center font-bold text-[#333333]">Loading map experience...</div>
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
    icpVerified: false,
  }
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(true) // Desktop persistent map
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')

  const condition = searchParams.get('condition')
  const location = searchParams.get('location')
  const city = searchParams.get('city')
  const specialty = searchParams.get('specialty')
  const visit_type = searchParams.get('visit_type')
  const max_fee = searchParams.get('max_fee')

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true)
      const apiParams: Record<string, string> = { page: '1', limit: '20' }
      if (city) apiParams.city = city
      else if (location) apiParams.city = location
      if (specialty) apiParams.specialty_id = specialty
      if (visit_type) apiParams.visit_type = visit_type
      if (max_fee) apiParams.max_fee_inr = max_fee

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
  }, [searchParams, city, location, specialty, visit_type, max_fee])

  const displayLocation = city ?? location ?? 'your area'

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Search Header */}
      <header className="z-30 bg-white border-b border-[#E5E5E5] flex-shrink-0">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">Physiotherapists in {displayLocation}</span>
              </div>
              <h1 className="text-[20px] md:text-[24px] font-black text-[#333333] tracking-tight leading-none">
                {loading 
                  ? 'Finding best physios...'
                  : total > 0
                  ? `${total} results found`
                  : `No results for ${displayLocation}`}
              </h1>
            </div>

            {/* Desktop Map Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[14px] font-bold text-gray-400">Map</span>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${
                  showMap ? 'bg-[#00766C]' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  showMap ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
          
          <div className="mt-4 pb-2">
            <SearchFilters total={total} />
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 overflow-hidden relative">
        <div className="flex h-full w-full">
          {/* Results List Column */}
          <div className={`h-full overflow-y-auto transition-all duration-300 ease-in-out ${
            showMap ? 'md:w-[60%] lg:w-[65%]' : 'w-full'
          } ${mobileView === 'map' ? 'hidden md:block' : 'block'}`}>
            <div className="max-w-[800px] mx-auto py-6 px-4 md:px-8">
              {loading ? (
                <div className="flex flex-col gap-6">
                  {[...Array(3)].map((_, i) => (
                    <DoctorCardSkeleton key={i} />
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="pt-10">
                  <EmptyState
                    title="No physiotherapists found"
                    description={`We couldn't find any physiotherapists matching your criteria near ${displayLocation}. Try adjusting your filters or expanding your search.`}
                    icon={SearchIcon}
                    action={
                      <button
                        onClick={() => router.push('/search')}
                        className="px-8 py-3 bg-[#00766C] text-white text-[15px] font-bold rounded-full hover:bg-[#005A52] transition-colors shadow-md"
                      >
                        Clear Filters
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider">Top Rated Professionals</p>
                    <div className="md:hidden">
                      <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#00766C]">
                         <SlidersHorizontal className="w-3.5 h-3.5" />
                         Sort
                      </button>
                    </div>
                  </div>
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                  
                  {/* Subtle Footer */}
                  <div className="py-12 text-center border-t border-gray-100 mt-6">
                    <p className="text-[14px] text-gray-400 font-medium italic">
                      "Your health is our priority. Find the perfect physiotherapist today."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Map Column (Desktop Focus) */}
          <div className={`h-full border-l border-[#E5E5E5] transition-all duration-300 ease-in-out ${
            showMap ? 'md:w-[40%] lg:w-[35%]' : 'w-0 border-none opacity-0 overflow-hidden'
          } ${mobileView === 'map' ? 'fixed inset-0 z-40 md:relative' : 'hidden md:block'}`}>
            <div className="h-full w-full relative bg-[#F5F5F5]">
              <ProviderMap doctors={doctors} />
              
              {/* Mobile Close Map Button */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden absolute top-6 left-6 z-50 bg-white p-3.5 rounded-full shadow-2xl border border-[#E5E5E5] text-[#333333] active:scale-95 transition-transform"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Floating View Switcher (Pill) */}
        <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
            className="bg-[#333333] text-white px-8 py-3.5 rounded-full flex items-center gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.3)] font-black text-[15px] whitespace-nowrap active:scale-95 transition-all"
          >
            {mobileView === 'list' ? (
              <>
                <MapIcon className="w-5 h-5 text-teal-400" />
                Map View
              </>
            ) : (
              <>
                <List className="w-5 h-5 text-teal-400" />
                Show List
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
