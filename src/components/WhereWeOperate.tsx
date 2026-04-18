'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'
import { revealOnScroll, useGSAP } from '@/lib/gsap-client'

// Hand-picked list of the 12 cities with the strongest current provider density.
// Kept explicit (not sliced from INDIA_CITIES) so we can tune ordering without
// moving rows around in the master locations file.
interface FeaturedCity {
  city: string
  slug: string
  state: string
  providers: string // short blurb — "12 physios", "Home visits live", etc.
}

const FEATURED_CITIES: FeaturedCity[] = [
  { city: 'Mumbai',      slug: 'mumbai',      state: 'Maharashtra',  providers: 'Home visits live' },
  { city: 'Delhi',       slug: 'delhi',       state: 'Delhi',        providers: 'Same-day slots'   },
  { city: 'Bengaluru',   slug: 'bengaluru',   state: 'Karnataka',    providers: 'Home visits live' },
  { city: 'Pune',        slug: 'pune',        state: 'Maharashtra',  providers: 'Same-day slots'   },
  { city: 'Hyderabad',   slug: 'hyderabad',   state: 'Telangana',    providers: 'Home visits live' },
  { city: 'Chennai',     slug: 'chennai',     state: 'Tamil Nadu',   providers: 'Same-day slots'   },
  { city: 'Ahmedabad',   slug: 'ahmedabad',   state: 'Gujarat',      providers: 'Home visits live' },
  { city: 'Kolkata',     slug: 'kolkata',     state: 'West Bengal',  providers: 'Same-day slots'   },
  { city: 'Jaipur',      slug: 'jaipur',      state: 'Rajasthan',    providers: 'Home visits live' },
  { city: 'Surat',       slug: 'surat',       state: 'Gujarat',      providers: 'Same-day slots'   },
  { city: 'Lucknow',     slug: 'lucknow',     state: 'Uttar Pradesh',providers: 'Home visits live' },
  { city: 'Chandigarh',  slug: 'chandigarh',  state: 'Chandigarh',   providers: 'Same-day slots'   },
]

export default function WhereWeOperate() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // Cities ripple in left-to-right so the grid feels like a map populating.
      revealOnScroll('[data-city-chip]', {
        y: 16,
        scale: 0.96,
        duration: 0.5,
        ease: 'back.out(1.3)',
        stagger: { each: 0.04, from: 'start' },
        trigger: '[data-city-grid]',
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      className="relative z-0 isolate bg-gradient-to-b from-slate-50 to-white py-20 md:py-24 border-t border-slate-100"
      aria-label="Cities we operate in"
    >
      <div className="bp-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div className="max-w-xl">
            <div
              className="bp-kicker mb-4"
              style={{
                background: 'rgba(0,118,108,0.08)',
                borderColor: 'rgba(0,118,108,0.2)',
                color: '#00766C',
              }}
            >
              Where we operate
            </div>
            <h2 className="text-slate-900 mb-3">
              Live in 15+ cities across India.
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Tap a city to see every verified physiotherapist there, their
              slots this week, and whether they offer home visits.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 text-[14px] font-semibold hover:border-[#00766C] hover:text-[#00766C] transition-colors group shrink-0 self-start md:self-auto"
          >
            See all 15+ cities
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <ul data-city-grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURED_CITIES.map((c) => (
            <li key={c.slug} data-city-chip>
              <Link
                href={`/search?city=${encodeURIComponent(c.city)}`}
                className="group flex items-center gap-3 rounded-[var(--sq-md)] border border-slate-200 bg-white px-4 py-3.5 hover:border-[#00766C]/40 hover:shadow-md hover:shadow-slate-200/60 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--sq-sm)] bg-[#E6F4F3] text-[#00766C] group-hover:bg-[#00766C] group-hover:text-white transition-colors">
                  <MapPin size={15} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-slate-900 text-[14px] font-semibold truncate">
                    {c.city}
                  </div>
                  <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider truncate">
                    {c.providers}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
