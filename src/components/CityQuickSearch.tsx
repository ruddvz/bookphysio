import Link from 'next/link'
import { MapPin } from 'lucide-react'

const TOP_CITIES = [
  { name: 'Mumbai', slug: 'Mumbai' },
  { name: 'Delhi', slug: 'Delhi' },
  { name: 'Bangalore', slug: 'Bangalore' },
  { name: 'Hyderabad', slug: 'Hyderabad' },
  { name: 'Chennai', slug: 'Chennai' },
  { name: 'Pune', slug: 'Pune' },
  { name: 'Kolkata', slug: 'Kolkata' },
  { name: 'Gurgaon', slug: 'Gurgaon' },
]

export default function CityQuickSearch() {
  return (
    <section className="bg-white py-16 border-t border-slate-100" aria-label="Find physiotherapists by city">
      <div className="bp-container text-center">
        <div className="bp-kicker mb-3">Popular Cities</div>
        <h2 className="text-slate-900 text-[28px] mb-3">Find physiotherapists near you</h2>
        <p className="text-slate-500 text-[14px] mb-10 max-w-lg mx-auto">
          Book verified physiotherapists for clinic visits and home sessions in major Indian cities.
        </p>

        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {TOP_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/search?location=${encodeURIComponent(city.slug)}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 bg-white text-[14px] font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all shadow-sm hover:shadow-md group"
            >
              <MapPin size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
              Physiotherapists in {city.name}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/search"
            className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-4"
          >
            Browse all cities →
          </Link>
        </div>
      </div>
    </section>
  )
}
