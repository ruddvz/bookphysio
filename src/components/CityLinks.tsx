'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CityData {
  name: string
  specialties: string[]
}

const CITIES: CityData[] = [
  { name: 'Mumbai', specialties: ['Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Home Visit', 'Paediatric Physio', "Women's Health"] },
  { name: 'Delhi', specialties: ['Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Home Visit', 'Geriatric Physio', "Women's Health"] },
  { name: 'Bengaluru', specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', 'Home Visit', 'Paediatric Physio', "Women's Health"] },
  { name: 'Hyderabad', specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', 'Home Visit', "Women's Health", 'Geriatric Physio'] },
  { name: 'Chennai', specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', "Women's Health", 'Home Visit', 'Geriatric Physio'] },
  { name: 'Pune', specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Neuro Physio', 'Paediatric Physio'] },
  { name: 'Kolkata', specialties: ['Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Geriatric Physio'] },
  { name: 'Ahmedabad', specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Neuro Physio', 'Geriatric Physio'] },
  { name: 'Jaipur', specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', 'Neuro Physio', "Women's Health", 'Geriatric Physio'] },
  { name: 'Kochi', specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', 'Home Visit', "Women's Health", 'Paediatric Physio'] },
  { name: 'Chandigarh', specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', 'Neuro Physio', 'Geriatric Physio', "Women's Health"] },
  { name: 'Surat', specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Neuro Physio', 'Geriatric Physio'] },
]

function buildSearchUrl(city: string, specialty: string) {
  const params = new URLSearchParams()
  params.set('city', city)
  if (specialty !== 'Home Visit') {
    params.set('specialty', specialty)
  } else {
    params.set('visit_type', 'home_visit')
  }
  return `/search?${params.toString()}`
}

interface CityAccordionProps {
  city: CityData
  isOpen: boolean
  onToggle: () => void
}

function CityAccordion({ city, isOpen, onToggle }: CityAccordionProps) {
  return (
    <div className="border-b border-bp-border/40 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-3 text-left text-[15px] font-semibold text-bp-primary transition-colors hover:text-bp-accent"
      >
        <span className="flex items-center gap-2">
          <MapPin size={13} className="text-bp-accent/60 shrink-0" />
          {city.name}
        </span>
        <ChevronDown
          size={15}
          className={cn('shrink-0 text-bp-body/40 transition-transform duration-200', isOpen && 'rotate-180 text-bp-accent')}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1.5 pb-3 pl-5">
          {city.specialties.map((specialty) => (
            <Link
              key={specialty}
              href={buildSearchUrl(city.name, specialty)}
              className="text-[13px] font-medium text-bp-body/70 transition-colors hover:text-bp-accent hover:underline underline-offset-2"
            >
              {specialty} in {city.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CityLinks() {
  const [openCity, setOpenCity] = useState<string | null>(null)

  const toggle = (cityName: string) => {
    setOpenCity((prev) => (prev === cityName ? null : cityName))
  }

  const midpoint = Math.ceil(CITIES.length / 2)
  const leftColumn = CITIES.slice(0, midpoint)
  const rightColumn = CITIES.slice(midpoint)

  return (
    <section className="border-t border-bp-border bg-bp-surface/30 py-16" aria-label="Browse by city">
      <div className="bp-shell">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-bp-accent mb-2">Find care nearby</p>
            <h2 className="text-[28px] font-bold tracking-tight text-bp-primary">Physiotherapists by city</h2>
          </div>
          <p className="text-[13px] font-medium text-bp-body/50 max-w-xs">
            Browse verified physiotherapists in your city, filtered by specialty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <div>
            {leftColumn.map((city) => (
              <CityAccordion
                key={city.name}
                city={city}
                isOpen={openCity === city.name}
                onToggle={() => toggle(city.name)}
              />
            ))}
          </div>
          <div>
            {rightColumn.map((city) => (
              <CityAccordion
                key={city.name}
                city={city}
                isOpen={openCity === city.name}
                onToggle={() => toggle(city.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
