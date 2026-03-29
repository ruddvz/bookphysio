'use client'

import { useState } from 'react'

const SPECIALTIES = [
  'Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Paediatric Physio',
  "Women's Health", 'Geriatric Physio', 'Post-Surgery Rehab', 'Pain Management',
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
]

type VisitType = 'Any' | 'In-clinic' | 'Home Visit' | 'Online'
type Availability = 'Any day' | 'Today' | 'Tomorrow' | 'This week'

interface FilterState {
  specialties: string[]
  city: string
  visitType: VisitType
  availability: Availability
  maxFee: number
}

const INITIAL_STATE: FilterState = {
  specialties: [],
  city: 'Mumbai',
  visitType: 'Any',
  availability: 'Any day',
  maxFee: 2000,
}

export default function SearchFilters() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_STATE)

  function toggleSpecialty(specialty: string): void {
    setFilters((prev) => {
      const already = prev.specialties.includes(specialty)
      return {
        ...prev,
        specialties: already
          ? prev.specialties.filter((s) => s !== specialty)
          : [...prev.specialties, specialty],
      }
    })
  }

  function setCity(city: string): void {
    setFilters((prev) => ({ ...prev, city }))
  }

  function setVisitType(visitType: VisitType): void {
    setFilters((prev) => ({ ...prev, visitType }))
  }

  function setAvailability(availability: Availability): void {
    setFilters((prev) => ({ ...prev, availability }))
  }

  function setMaxFee(maxFee: number): void {
    setFilters((prev) => ({ ...prev, maxFee }))
  }

  return (
    <aside
      aria-label="Search filters"
      className="bg-white rounded-[8px] border border-[#E5E5E5] p-5 w-[280px] shrink-0 self-start sticky top-24"
    >
      {/* Specialty */}
      <section aria-labelledby="filter-specialty">
        <p id="filter-specialty" className="text-[13px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
          Specialty
        </p>
        <fieldset className="border-none m-0 p-0">
          <legend className="sr-only">Filter by specialty</legend>
          {SPECIALTIES.map((specialty) => (
            <label key={specialty} className="flex items-center gap-2 text-[14px] text-[#333333] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={filters.specialties.includes(specialty)}
                onChange={() => toggleSpecialty(specialty)}
                className="accent-[#00766C] w-4 h-4"
              />
              {specialty}
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
          value={filters.city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Filter by city"
          className="w-full px-2.5 py-2 rounded-[6px] border border-[#E5E5E5] text-[14px] text-[#333333] bg-white cursor-pointer outline-none focus:border-[#00766C]"
        >
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
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
                checked={filters.visitType === type}
                onChange={() => setVisitType(type)}
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
                checked={filters.availability === avail}
                onChange={() => setAvailability(avail)}
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
          ₹0 – ₹{filters.maxFee.toLocaleString('en-IN')}
        </p>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={filters.maxFee}
          onChange={(e) => setMaxFee(Number(e.target.value))}
          aria-label="Maximum fee per session"
          className="w-full accent-[#00766C] cursor-pointer"
        />
        <div className="flex justify-between text-[12px] text-[#666666] mt-1">
          <span>₹0</span>
          <span>₹2,000</span>
        </div>
      </section>
    </aside>
  )
}
