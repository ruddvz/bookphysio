'use client'

import Image from 'next/image'
import { ShieldCheck, Clock, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const providers = [
  { initials: 'SP', name: 'Sports Physio',      specialty: 'ACL · Runner rehab',    city: 'Mumbai',    fee: 800,  slot: 'Same-day slots',     rating: 4.9 },
  { initials: 'OR', name: 'Ortho Rehab',        specialty: 'Joint · Back pain',     city: 'Delhi',     fee: 700,  slot: 'Next-day available', rating: 4.8 },
  { initials: 'NP', name: 'Neuro Physio',       specialty: 'Stroke · Parkinson\'s', city: 'Bengaluru', fee: 900,  slot: 'Home visits',        rating: 5.0 },
]

const features = [
  {
    icon: ShieldCheck,
    title: '3-step credential check',
    desc: 'Every provider is verified against IAP records, degree uploads, and ID before going live.',
    color: 'text-[#00766C]',
    bg: 'bg-[#E6F4F3]',
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
    <section className="bg-[#F7F8F9] py-24 md:py-32" aria-label="Network transparency">
      <div className="bp-container">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <div className="bp-kicker mb-4">Straightforward booking</div>
          <h2 className="text-slate-900 mb-4">Real availability, no guesswork</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Every slot on a provider page is a slot the physiotherapist has actually opened up. Fees, timings and credentials are shown upfront, so there are no surprises at the session.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] items-start">

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
                className="text-[13px] font-semibold text-[#00766C] hover:text-[#005A52] flex items-center gap-1 group"
              >
                Browse all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {providers.map((p) => (
              <Link
                key={p.name}
                href="/search"
                className="group flex items-center gap-5 p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#00766C]/30 hover:shadow-lg hover:shadow-teal-500/8 transition-all duration-200"
              >
                {/* Avatar — decorative placeholder */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#E6F4F3] flex items-center justify-center text-[16px] font-bold text-[#00766C] group-hover:bg-[#B2D8D5] transition-colors shrink-0">
                  <Image
                    src="/images/physio-female.png"
                    alt=""
                    aria-hidden="true"
                    width={56}
                    height={56}
                    className="object-cover object-top w-full h-full"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-[15px]">{p.name}</span>
                    <ShieldCheck size={14} className="text-[#00766C] shrink-0" />
                  </div>
                  <div className="text-[13px] text-slate-500">
                    {p.specialty} · {p.city}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`text-[11px] ${i <= Math.round(p.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                    <span className="text-[12px] text-slate-400 ml-1">{p.rating}</span>
                  </div>
                </div>

                {/* Price + slot */}
                <div className="text-right shrink-0">
                  <div className="text-[17px] font-bold text-slate-900">₹{p.fee}</div>
                  <div className="text-[12px] font-semibold text-[#00766C] mt-1">{p.slot}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Why trust section */}
          <div className="space-y-6 lg:sticky lg:top-28">
            {/* Physio character + trust badge */}
            <div className="relative rounded-3xl overflow-hidden bg-[#E6F4F3] p-6 flex items-end justify-between min-h-[200px]">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-[11px] font-bold text-[#00766C] shadow-sm mb-3">
                  <ShieldCheck size={11} strokeWidth={3} />
                  100% verified
                </div>
                <div className="text-[15px] font-semibold text-[#1A1C29] leading-snug">
                  Every provider personally
                  <br />checked by our team
                </div>
              </div>
              <div className="shrink-0 -mb-6 -mr-2">
                <Image
                  src="/images/physio-female.png"
                  alt=""
                  aria-hidden="true"
                  width={120}
                  height={160}
                  className="object-contain object-bottom"
                  sizes="(min-width: 1024px) 120px, 0px"
                />
              </div>
            </div>

            <div>
              <h3 className="text-slate-900 text-[20px] font-bold mb-2">Why you can trust the list</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">
                Every provider you see has been checked by our team. We focus only on physiotherapy, so the details on a profile are the details you actually need before booking.
              </p>
            </div>

            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[14px] mb-1">{title}</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <Link
              href="/search"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-[#00766C] text-white rounded-xl font-semibold text-[14px] hover:bg-[#005A52] transition-colors group shadow-[0_4px_16px_rgba(0,118,108,0.25)]"
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