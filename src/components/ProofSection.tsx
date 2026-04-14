'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Clock, Home, ArrowRight } from 'lucide-react'

const providers = [
  { initials: 'SP', name: 'Sports Physio Specialist', specialty: 'ACL · Runner rehab',   city: 'Mumbai',    fee: 800, slot: 'Same-day slots',     rating: 4.9, useImage: true  },
  { initials: 'OR', name: 'Ortho Rehab Specialist',   specialty: 'Joint · Back pain',    city: 'Delhi',     fee: 700, slot: 'Next-day available', rating: 4.8, useImage: false },
  { initials: 'NP', name: 'Neuro Physio Expert',      specialty: "Stroke · Parkinson's", city: 'Bengaluru', fee: 900, slot: 'Home visits',        rating: 5.0, useImage: false },
]

const trust = [
  { icon: ShieldCheck, text: '3-step credential check against IAP records' },
  { icon: Clock,       text: 'Instant confirmation — slot held immediately' },
  { icon: Home,        text: 'In-clinic or home visit, shown side by side'  },
]

export default function ProofSection() {
  return (
    <section className="bg-[#F7F8F9] py-24 md:py-32 overflow-hidden" aria-label="Network transparency">
      <div className="bp-container">
        <div className="grid lg:grid-cols-[360px_1fr] gap-16 items-center">

          {/* Left: female physio with floating stat badges */}
          <div className="hidden lg:block relative self-center">
            <div className="relative w-[280px] mx-auto">
              {/* Teal circle bg */}
              <div className="w-[280px] h-[280px] rounded-full bg-[#E6F4F3]" />

              {/* Female physio character */}
              <Image
                src="/images/physio-female.png"
                alt="A verified physiotherapist"
                width={220}
                height={340}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 object-contain object-bottom pointer-events-none select-none"
                aria-hidden="true"
              />

              {/* Floating: rating */}
              <div className="absolute -top-4 -right-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 text-center">
                <div className="text-[20px] font-bold text-amber-500 leading-none">4.9★</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium uppercase tracking-wide">Avg. rating</div>
              </div>

              {/* Floating: IAP badge */}
              <div className="absolute top-1/3 -left-12 bg-[#00766C] text-white rounded-2xl px-4 py-3 text-center shadow-xl">
                <div className="text-[16px] font-bold leading-none">IAP</div>
                <div className="text-[10px] mt-1 opacity-80 font-medium uppercase tracking-wide">Verified</div>
              </div>

              {/* Floating: booking speed */}
              <div className="absolute -bottom-6 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[12px] font-semibold text-slate-700">Book in 60 seconds</span>
              </div>
            </div>
          </div>

          {/* Right: header + provider cards + trust */}
          <div>
            <div className="bp-kicker mb-4">Straightforward booking</div>
            <h2 className="text-slate-900 mb-4">Real availability, no guesswork.</h2>
            <p className="text-slate-500 text-[17px] leading-relaxed mb-8">
              Every slot on a provider page is a slot the physiotherapist has actually opened up. Fees, timings and credentials are shown upfront, so there are no surprises at the session.
            </p>

            {/* List header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[13px] font-semibold text-slate-500">Example provider categories</span>
              </div>
              <Link href="/search" className="text-[13px] font-semibold text-[#00766C] hover:text-[#005A52] flex items-center gap-1 group">
                Browse all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Provider cards */}
            <div className="space-y-3 mb-8">
              {providers.map((p) => (
                <div
                  key={p.name}
                  className={`group flex items-center gap-5 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/60 cursor-pointer ${
                    p.useImage
                      ? 'border-[#00766C]/20 bg-[#E6F4F3]/50 hover:border-[#00766C]/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {p.useImage ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                      <Image src="/images/physio-female.png" alt={p.name} width={56} height={56} className="object-cover object-top w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[16px] font-bold text-slate-600 group-hover:bg-slate-200 transition-colors shrink-0">
                      {p.initials}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-[15px]">{p.name}</span>
                      <ShieldCheck size={14} className="text-[#00766C] shrink-0" />
                    </div>
                    <div className="text-[13px] text-slate-500">{p.specialty} · {p.city}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-[11px] ${i <= Math.floor(p.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                      ))}
                      <span className="text-[12px] text-slate-400 ml-1">{p.rating}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[17px] font-bold text-slate-900">₹{p.fee}</div>
                    <div className="text-[12px] font-semibold text-[#00766C] mt-1">{p.slot}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust checklist */}
            <div className="space-y-3 mb-8">
              {trust.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#E6F4F3] border border-[#00766C]/20 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#00766C]" />
                  </div>
                  <span className="text-[14px] text-slate-600">{text}</span>
                </div>
              ))}
            </div>

            <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-[15px] hover:bg-slate-700 transition-colors group w-fit">
              Search verified physios
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
