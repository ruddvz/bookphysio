'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import SearchFilters from './SearchFilters'
import { Map } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
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
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const condition = searchParams.get('condition')
  const location = searchParams.get('location')
  const city = searchParams.get('city')
  const specialty = searchParams.get('specialty')
  const visit_type = searchParams.get('visit_type')
  const max_fee = searchParams.get('max_fee')

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      const apiParams: Record<string, string> = { page: '1', limit: '20' }
      
      if (city) apiParams.city = city
      else if (location) apiParams.city = location
      if (specialty) apiParams.specialty_id = specialty
      if (visit_type) apiParams.visit_type = visit_type
      if (max_fee) apiParams.max_fee_inr = max_fee

      const qs = new URLSearchParams(apiParams).toString()

      try {
        const res = await fetch(`${baseUrl}/api/providers?${qs}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json() as SearchResponse
        setDoctors(data.providers.map(providerToDoctor))
        setTotal(data.total)
      } catch {
        // Fallback for Github pages static export where API doesn't exist
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
    <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-8">
      {/* Results header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#333333] leading-7">
            {loading 
              ? 'Searching...'
              : total > 0
              ? `${total} physio${total === 1 ? '' : 's'} near ${displayLocation}`
              : `No physios found near ${displayLocation}`}
          </h1>
          {condition && (
            <p className="text-[14px] text-[#666666] mt-1">
              showing results for:{' '}
              <span className="font-medium text-[#333333]">{condition}</span>
            </p>
          )}
        </div>

        {/* Map View — coming soon */}
        <div className="relative group">
          <button
            type="button"
            disabled
            aria-label="Map view (coming soon)"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-[#AAAAAA] text-[14px] font-medium cursor-not-allowed select-none"
          >
            <Map className="w-4 h-4" />
            Map View
            <span className="text-[11px] font-semibold text-[#00766C] bg-[#E6F4F3] px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start md:flex-row flex-col">
        {/* Sidebar / mobile trigger */}
        <SearchFilters />

        {/* Results column */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {loading ? (
            <div className="bg-white rounded-[8px] border border-[#E5E5E5] p-12 text-center text-[#666]">
              Loading results...
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-[#E5E5E5] p-12 text-center">
              <p className="text-[18px] font-semibold text-[#333333] mb-2">No physiotherapists found</p>
              <p className="text-[14px] text-[#666666]">Try adjusting your filters or searching a different city.</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
