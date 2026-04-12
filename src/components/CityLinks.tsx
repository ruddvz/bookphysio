import Link from 'next/link'
import { MapPin } from 'lucide-react'

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
  return (
    <section className="bg-[#F7F8F9] py-20 border-t border-slate-100" aria-label="Browse physiotherapists by city">
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="bp-kicker mb-3">Find care nearby</div>
            <h2 className="text-slate-900 text-[26px] font-bold tracking-tight">Physiotherapists by city</h2>
            <p className="text-slate-500 text-[14px] mt-2">
              Browse IAP-verified physiotherapists near you, filtered by specialty.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            12 cities covered
          </div>
        </div>

        {/* City grid — all SEO links always in DOM */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CITIES.map(city => (
            <div key={city.name} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#00766C]/30 hover:shadow-md transition-all duration-200">
              {/* City header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#E6F4F3] flex items-center justify-center shrink-0">
                  <MapPin size={13} className="text-[#00766C]" />
                </div>
                <Link
                  href={`/search?location=${encodeURIComponent(city.name)}`}
                  className="text-[15px] font-semibold text-slate-800 hover:text-[#00766C] transition-colors"
                >
                  {city.name}
                </Link>
              </div>

              {/* Specialty links */}
              <div className="flex flex-col gap-1.5 pl-9">
                {city.specialties.map(s => (
                  <Link
                    key={s}
                    href={buildUrl(city.name, s)}
                    className="text-[12px] text-slate-500 hover:text-[#00766C] transition-colors hover:underline underline-offset-2"
                  >
                    {s} in {city.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
