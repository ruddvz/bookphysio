'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const CITIES = [
  { name: 'Mumbai',     specialties: ['Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Home Visit', 'Paediatric Physio'] },
  { name: 'Delhi',      specialties: ['Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Home Visit', 'Geriatric Physio'] },
  { name: 'Bengaluru',  specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', 'Home Visit', 'Paediatric Physio'] },
  { name: 'Hyderabad',  specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', 'Home Visit', "Women's Health"] },
  { name: 'Chennai',    specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', "Women's Health", 'Home Visit'] },
  { name: 'Pune',       specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Neuro Physio'] },
  { name: 'Kolkata',    specialties: ['Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Home Visit', "Women's Health"] },
  { name: 'Ahmedabad',  specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Neuro Physio'] },
  { name: 'Jaipur',     specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', 'Neuro Physio', "Women's Health"] },
  { name: 'Chandigarh', specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', 'Neuro Physio', 'Geriatric Physio'] },
  { name: 'Kochi',      specialties: ['Sports Physio', 'Ortho Physio', 'Neuro Physio', 'Home Visit', 'Paediatric Physio'] },
  { name: 'Surat',      specialties: ['Sports Physio', 'Ortho Physio', 'Home Visit', "Women's Health", 'Neuro Physio'] },
]

function buildUrl(city: string, specialty: string) {
  const p = new URLSearchParams()
  p.set('location', city)
  if (specialty === 'Home Visit') p.set('visit_type', 'home_visit')
  else p.set('specialty', specialty)
  return `/search?${p}`
}

export default function CityLinks() {
  const [open, setOpen] = useState<string | null>(null)
  const mid = Math.ceil(CITIES.length / 2)

  return (
    <section className="bg-white py-20 border-t border-slate-100" aria-label="Browse physiotherapists by city">
      <div className="bp-container">
        <div className="mb-10">
          <div className="bp-kicker mb-3">Find Care Nearby</div>
          <h2 className="text-slate-900 text-[28px]">Physiotherapists by city</h2>
          <p className="text-slate-500 text-[14px] mt-2">
            Browse IAP-verified physiotherapists near you, filtered by specialty.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-0">
          {[CITIES.slice(0, mid), CITIES.slice(mid)].map((col, ci) => (
            <div key={ci}>
              {col.map(city => {
                const isOpen = open === city.name
                return (
                  <div key={city.name} className="border-b border-slate-100 last:border-0">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : city.name)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-3.5 text-left group"
                    >
                      <span className="flex items-center gap-2 text-[14px] font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        <MapPin size={13} className="text-indigo-500 shrink-0" />
                        {city.name}
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          'text-slate-300 transition-transform duration-200 shrink-0',
                          isOpen && 'rotate-180 text-indigo-500'
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-3 pl-5 flex flex-col gap-1.5 animate-fade-in">
                        {city.specialties.map(s => (
                          <Link
                            key={s}
                            href={buildUrl(city.name, s)}
                            className="text-[13px] text-slate-500 hover:text-indigo-600 transition-colors hover:underline underline-offset-2"
                          >
                            {s} in {city.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
