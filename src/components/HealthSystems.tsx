import Link from 'next/link'
import { BadgeCheck, Clock3, Home, MapPin, ShieldCheck, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'IAP Verified Clinicians',
    desc: 'Every profile shows registration number, degree, and patient feedback — before it hits search.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Home,
    title: 'Home Visits Included',
    desc: 'Book care where the patient needs it — home and clinic options always shown side by side.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Clock3,
    title: 'Same-Day Slots',
    desc: 'Availability shows inline so your booking feels immediate, not buried inside a full calendar.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent Pricing',
    desc: 'Fees, GST, and payment method stay visible upfront. No surprises at checkout.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']

export default function HealthSystems() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Platform trust signals">
      <div className="bp-container">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          {/* Left column */}
          <div>
            <div className="bp-kicker mb-4">Built for Trust</div>
            <h2 className="text-slate-900 mb-4">Everything a patient needs to feel confident.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed mb-8">
              Credentials, visit format, fees, and availability — shown upfront, not buried in steps.
            </p>

            <div className="space-y-3 mb-8">
              {[
                'ICP registered & verified',
                'In-clinic + home visit modes',
                'Transparent INR pricing',
                'Mobile-first booking flow',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-[14px] font-medium text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={12} className="text-indigo-600" />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="bp-btn bp-btn-primary">
                Browse providers
                <ArrowRight size={14} />
              </Link>
              <Link href="/how-it-works" className="bp-btn bp-btn-secondary">
                See how it works
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon size={20} className={color} />
                  </div>
                  <h3 className="text-slate-900 font-semibold text-[15px] mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Coverage card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Coverage</div>
                  <div className="text-[15px] font-semibold text-slate-900">18 Indian cities & growing</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.map(city => (
                  <Link
                    key={city}
                    href={`/search?location=${encodeURIComponent(city)}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}