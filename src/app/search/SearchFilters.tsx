'use client'

import { useState } from 'react'

const SPECIALTIES = [
  'Sports Physio',
  'Neuro Physio',
  'Ortho Physio',
  'Paediatric Physio',
  "Women's Health",
  'Geriatric Physio',
  'Post-Surgery Rehab',
  'Pain Management',
]

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Surat',
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

const SECTION_HEADING_STYLE: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#666666',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '12px',
}

const DIVIDER_STYLE: React.CSSProperties = {
  height: '1px',
  backgroundColor: '#E5E5E5',
  margin: '16px 0',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#333333',
  cursor: 'pointer',
  padding: '4px 0',
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
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E5E5E5',
        padding: '20px',
        width: '280px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: '96px',
      }}
    >
      {/* Specialty */}
      <section aria-labelledby="filter-specialty">
        <p id="filter-specialty" style={SECTION_HEADING_STYLE}>
          Specialty
        </p>
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend className="sr-only">Filter by specialty</legend>
          {SPECIALTIES.map((specialty) => (
            <label key={specialty} style={LABEL_STYLE}>
              <input
                type="checkbox"
                checked={filters.specialties.includes(specialty)}
                onChange={() => toggleSpecialty(specialty)}
                style={{ accentColor: '#00766C', width: '16px', height: '16px' }}
              />
              {specialty}
            </label>
          ))}
        </fieldset>
      </section>

      <div style={DIVIDER_STYLE} role="separator" />

      {/* City */}
      <section aria-labelledby="filter-city">
        <p id="filter-city" style={SECTION_HEADING_STYLE}>
          City
        </p>
        <select
          value={filters.city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Filter by city"
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #E5E5E5',
            fontSize: '14px',
            color: '#333333',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            appearance: 'auto',
          }}
        >
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </section>

      <div style={DIVIDER_STYLE} role="separator" />

      {/* Visit Type */}
      <section aria-labelledby="filter-visit-type">
        <p id="filter-visit-type" style={SECTION_HEADING_STYLE}>
          Visit Type
        </p>
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend className="sr-only">Filter by visit type</legend>
          {(['Any', 'In-clinic', 'Home Visit', 'Online'] as VisitType[]).map((type) => (
            <label key={type} style={LABEL_STYLE}>
              <input
                type="radio"
                name="visitType"
                value={type}
                checked={filters.visitType === type}
                onChange={() => setVisitType(type)}
                style={{ accentColor: '#00766C', width: '16px', height: '16px' }}
              />
              {type}
            </label>
          ))}
        </fieldset>
      </section>

      <div style={DIVIDER_STYLE} role="separator" />

      {/* Availability */}
      <section aria-labelledby="filter-availability">
        <p id="filter-availability" style={SECTION_HEADING_STYLE}>
          Availability
        </p>
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend className="sr-only">Filter by availability</legend>
          {(['Any day', 'Today', 'Tomorrow', 'This week'] as Availability[]).map((avail) => (
            <label key={avail} style={LABEL_STYLE}>
              <input
                type="radio"
                name="availability"
                value={avail}
                checked={filters.availability === avail}
                onChange={() => setAvailability(avail)}
                style={{ accentColor: '#00766C', width: '16px', height: '16px' }}
              />
              {avail}
            </label>
          ))}
        </fieldset>
      </section>

      <div style={DIVIDER_STYLE} role="separator" />

      {/* Fee Range */}
      <section aria-labelledby="filter-fee">
        <p id="filter-fee" style={SECTION_HEADING_STYLE}>
          Fee Range
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#333333',
            marginBottom: '10px',
            fontWeight: 500,
          }}
        >
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
          style={{
            width: '100%',
            accentColor: '#00766C',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666666',
            marginTop: '4px',
          }}
        >
          <span>₹0</span>
          <span>₹2,000</span>
        </div>
      </section>
    </aside>
  )
}
