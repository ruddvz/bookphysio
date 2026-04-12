'use client'

import { ShieldCheck, Clock, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const providers = [
  { initials: 'SP', name: 'Sports Physio',      specialty: 'ACL · Runner rehab',   city: 'Mumbai',    fee: 800,  slot: 'Same-day slots',     rating: 4.9 },
  { initials: 'OR', name: 'Ortho Rehab',        specialty: 'Joint · Back pain',    city: 'Delhi',     fee: 700,  slot: 'Next-day available', rating: 4.8 },
  { initials: 'NP', name: 'Neuro Physio',       specialty: 'Stroke · Parkinson\'s', city: 'Bengaluru', fee: 900,  slot: 'Home visits',       rating: 5.0 },
]

const features = [
  {
    icon: ShieldCheck,
    title: '3-step credential check',
    desc: 'Every provider is verified against IAP records, degree uploads, and ID before going live.',
    color: 'text-indigo-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Clock,
    title: 'Instant confirmation',
    desc: 'What you see is what you book. No callbacks or waiting around. Your slot is held as soon as you confirm.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Home,
    title: 'Home visits included',
    desc: 'Filter by in-clinic or home visit. Compare side-by-side in a single transparent view.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

export default function ProofSection() {
  return (
    <section className="bg-[#F8F7FF] py-24 md:py-32" aria-label="Network transparency">
      <div className="bp-container">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <div className="bp-kicker mb-4">Straightforward booking</div>
          <h2 className="text-slate-900 mb-4">Real availability, no guesswork</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Every slot on a provider page is a slot the physiotherapist has actually opened up. Fees, timings and credentials are shown upfront, so there are no surprises at the session.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px] items-start">

          {/* Live provider cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[13px] font-semibold text-slate-500">
                  Example provider categories
                </span>
              </div>
              <Link
                href="/search"
                className="group flex items-center gap-1 text-[13px] font-semibold text-[#00766C] hover:text-[#005A52]"
              >
                Browse all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {providers.map((p) => (
              <Link
                key={p.name}
                href="/search"
                aria-label={`Browse ${p.name} providers in ${p.city}`}
                className="group flex items-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-[#00766C]/5"
              >
                {/* Avatar */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[16px] font-bold text-slate-600 transition-colors group-hover:bg-[#E6F4F3] group-hover:text-[#00766C]">
                  {p.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-[15px]">{p.name}</span>
                    <ShieldCheck size={14} className="shrink-0 text-[#00766C]" />
                  </div>
                  <div className="text-[13px] text-slate-500">
                    {p.specialty} · {p.city}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {'★★★★★'.split('').map((_, i) => (
                      <span key={i} className={`text-[11px] ${i < Math.floor(p.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                    <span className="text-[12px] text-slate-400 ml-1">{p.rating}</span>
                  </div>
                </div>

                {/* Price + slot */}
                <div className="text-right shrink-0">
                  <div className="text-[17px] font-bold text-slate-900">₹{p.fee}</div>
                  <div className="mt-1 text-[12px] font-semibold text-[#00766C]">{p.slot}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Why trust section */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div>
              <h3 className="text-slate-900 text-[22px] font-bold mb-2">Why you can trust the list</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Every provider you see has been checked by our team. We focus only on physiotherapy, so the details on a profile are the details you actually need before booking.
              </p>
            </div>

            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex gap-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[15px] mb-1">{title}</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <Link
              href="/search"
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] py-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#E0552A]"
            >
              Search verified physios
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
