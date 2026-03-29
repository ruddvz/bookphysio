'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPECIALTIES = [
  'Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Paediatric Physio',
  "Women's Health", 'Geriatric Physio', 'Post-Surgery Rehab', 'Pain Management',
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
]

const VISIT_TYPE_URL: Record<string, string> = {
  'In-clinic': 'in_clinic',
  'Home Visit': 'home_visit',
  'Online': 'online',
}
const VISIT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(VISIT_TYPE_URL).map(([k, v]) => [v, k])
)

type VisitType = 'Any' | 'In-clinic' | 'Home Visit' | 'Online'
type Availability = 'Any day' | 'Today' | 'Tomorrow' | 'This week'

const DEFAULT_MAX_FEE = 2000
const DEFAULT_CITY = ''

// ---------------------------------------------------------------------------
// Hook — reads current URL and builds a push helper
// ---------------------------------------------------------------------------

function useFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCity = searchParams.get('city') ?? DEFAULT_CITY
  const currentVisitTypeRaw = searchParams.get('visit_type') ?? ''
  const currentVisitType: VisitType = (VISIT_TYPE_LABEL[currentVisitTypeRaw] as VisitType) ?? 'Any'
  const currentMaxFee = Number(searchParams.get('max_fee') ?? DEFAULT_MAX_FEE)
  const currentSpecialty = searchParams.get('specialty') ?? ''

  const hasActiveFilters =
    currentCity !== DEFAULT_CITY ||
    currentVisitType !== 'Any' ||
    currentMaxFee !== DEFAULT_MAX_FEE ||
    currentSpecialty !== ''

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      router.push(`/search?${next.toString()}`)
    },
    [router, searchParams]
  )

  function clearAll() {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('city')
    next.delete('visit_type')
    next.delete('max_fee')
    next.delete('specialty')
    router.push(`/search?${next.toString()}`)
  }

  return {
    currentCity,
    currentVisitType,
    currentMaxFee,
    currentSpecialty,
    hasActiveFilters,
    pushParams,
    clearAll,
  }
}

// ---------------------------------------------------------------------------
// FilterPanel — the actual filter controls (shared by sidebar + drawer)
// ---------------------------------------------------------------------------

interface FilterPanelProps {
  city: string
  visitType: VisitType
  availability: Availability
  maxFee: number
  specialty: string
  onCity: (v: string) => void
  onVisitType: (v: VisitType) => void
  onAvailability: (v: Availability) => void
  onMaxFee: (v: number) => void
  onSpecialty: (v: string) => void
  hasActiveFilters: boolean
  onClear: () => void
}

function FilterPanel({
  city, visitType, availability, maxFee, specialty,
  onCity, onVisitType, onAvailability, onMaxFee, onSpecialty,
  hasActiveFilters, onClear,
}: FilterPanelProps) {
  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[15px] font-semibold text-[#333333]">Filters</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] font-medium text-[#00766C] hover:text-[#005A52] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Specialty */}
      <section aria-labelledby="filter-specialty">
        <p id="filter-specialty" className="text-[13px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
          Specialty
        </p>
        <fieldset className="border-none m-0 p-0">
          <legend className="sr-only">Filter by specialty</legend>
          {SPECIALTIES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-[14px] text-[#333333] cursor-pointer py-1">
              <input
                type="radio"
                name="specialty"
                value={s}
                checked={specialty === s}
                onChange={() => onSpecialty(specialty === s ? '' : s)}
                className="accent-[#00766C] w-4 h-4"
              />
              {s}
            </label>
          ))}
        </fieldset>
      </section>

      <div className="h-px bg-[#E5E5E5] my-4" role="separator" />

      {/* City */}
      <section aria-labelledby="filter-city">
        <p id="filter-city" className="text-[13px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
          City
        </p>
        <select
          value={city}
          onChange={(e) => onCity(e.target.value)}
          aria-label="Filter by city"
          className="w-full px-2.5 py-2 rounded-[6px] border border-[#E5E5E5] text-[14px] text-[#333333] bg-white cursor-pointer outline-none focus:border-[#00766C]"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      <div className="h-px bg-[#E5E5E5] my-4" role="separator" />

      {/* Visit Type */}
      <section aria-labelledby="filter-visit-type">
        <p id="filter-visit-type" className="text-[13px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
          Visit Type
        </p>
        <fieldset className="border-none m-0 p-0">
          <legend className="sr-only">Filter by visit type</legend>
          {(['Any', 'In-clinic', 'Home Visit', 'Online'] as VisitType[]).map((type) => (
            <label key={type} className="flex items-center gap-2 text-[14px] text-[#333333] cursor-pointer py-1">
              <input
                type="radio"
                name="visitType"
                value={type}
                checked={visitType === type}
                onChange={() => onVisitType(type)}
                className="accent-[#00766C] w-4 h-4"
              />
              {type}
            </label>
          ))}
        </fieldset>
      </section>

      <div className="h-px bg-[#E5E5E5] my-4" role="separator" />

      {/* Availability */}
      <section aria-labelledby="filter-availability">
        <p id="filter-availability" className="text-[13px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
          Availability
        </p>
        <fieldset className="border-none m-0 p-0">
          <legend className="sr-only">Filter by availability</legend>
          {(['Any day', 'Today', 'Tomorrow', 'This week'] as Availability[]).map((avail) => (
            <label key={avail} className="flex items-center gap-2 text-[14px] text-[#333333] cursor-pointer py-1">
              <input
                type="radio"
                name="availability"
                value={avail}
                checked={availability === avail}
                onChange={() => onAvailability(avail)}
                className="accent-[#00766C] w-4 h-4"
              />
              {avail}
            </label>
          ))}
        </fieldset>
      </section>

      <div className="h-px bg-[#E5E5E5] my-4" role="separator" />

      {/* Fee Range */}
      <section aria-labelledby="filter-fee">
        <p id="filter-fee" className="text-[13px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
          Fee Range
        </p>
        <p className="text-[14px] text-[#333333] mb-2.5 font-medium">
          ₹0 – ₹{maxFee.toLocaleString('en-IN')}
        </p>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={maxFee}
          onChange={(e) => onMaxFee(Number(e.target.value))}
          aria-label="Maximum fee per session"
          className="w-full accent-[#00766C] cursor-pointer"
        />
        <div className="flex justify-between text-[12px] text-[#666666] mt-1">
          <span>₹0</span>
          <span>₹2,000</span>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export — sidebar (desktop) + drawer trigger (mobile)
// ---------------------------------------------------------------------------

export default function SearchFilters() {
  const {
    currentCity, currentVisitType, currentMaxFee, currentSpecialty,
    hasActiveFilters, pushParams, clearAll,
  } = useFilters()

  // Local availability state (UI-only, no API support yet)
  const [availability, setAvailability] = useState<Availability>('Any day')
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fee slider uses local state to avoid a navigation on every tick;
  // pushes to URL only on mouseup/touchend.
  const [localMaxFee, setLocalMaxFee] = useState(currentMaxFee)

  function handleCity(city: string) {
    pushParams({ city: city || null })
  }

  function handleVisitType(vt: VisitType) {
    pushParams({ visit_type: vt === 'Any' ? null : VISIT_TYPE_URL[vt] })
  }

  function handleSpecialty(s: string) {
    pushParams({ specialty: s || null })
  }

  function handleMaxFeeCommit() {
    pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) })
  }

  function handleClear() {
    setLocalMaxFee(DEFAULT_MAX_FEE)
    setAvailability('Any day')
    clearAll()
    setDrawerOpen(false)
  }

  const panelProps: FilterPanelProps = {
    city: currentCity,
    visitType: currentVisitType,
    availability,
    maxFee: localMaxFee,
    specialty: currentSpecialty,
    onCity: handleCity,
    onVisitType: handleVisitType,
    onAvailability: setAvailability,
    onMaxFee: setLocalMaxFee,
    onSpecialty: handleSpecialty,
    hasActiveFilters,
    onClear: handleClear,
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        aria-label="Search filters"
        className="hidden md:block bg-white rounded-[8px] border border-[#E5E5E5] p-5 w-[280px] shrink-0 self-start sticky top-24"
        onMouseUp={handleMaxFeeCommit}
        onTouchEnd={handleMaxFeeCommit}
      >
        <FilterPanel {...panelProps} />
      </aside>

      {/* ── Mobile: Filters trigger button ── */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E5E5] bg-white text-[14px] font-medium text-[#333333] shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#00766C]" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-[#00766C] text-white text-[11px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile: Slide-up drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="relative bg-white rounded-t-[16px] p-5 pb-8 max-h-[85vh] overflow-y-auto"
            onMouseUp={handleMaxFeeCommit}
            onTouchEnd={handleMaxFeeCommit}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-[#E5E5E5] rounded-full mx-auto mb-4" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="absolute top-4 right-4 p-1 text-[#666666] hover:text-[#333333]"
            >
              <X className="w-5 h-5" />
            </button>

            <FilterPanel {...panelProps} />

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full py-3 rounded-[24px] bg-[#00766C] text-white text-[15px] font-semibold hover:bg-[#005A52] transition-colors"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  )
}
