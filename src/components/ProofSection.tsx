'use client'

import Image from 'next/image'
import { ShieldCheck, Clock, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PROOF_CHARACTER = '/images/physio-female.png'

const providers = [
  { initials: 'SP', name: 'Sports Physio', specialty: 'ACL · Runner rehab', city: 'Mumbai', fee: 800, slot: 'Same-day slots', rating: 4.9 },
  { initials: 'OR', name: 'Ortho Rehab', specialty: 'Joint · Back pain', city: 'Delhi', fee: 700, slot: 'Next-day available', rating: 4.8 },
  { initials: 'NP', name: 'Neuro Physio', specialty: 'Stroke · Parkinson\'s', city: 'Bengaluru', fee: 900, slot: 'Home visits', rating: 5.0 },
]

const features = [
  {
    icon: ShieldCheck,
    title: '3-step credential check',
    desc: 'Every provider is verified against IAP records, degree uploads, and ID before going live.',
  },
  {
    icon: Clock,
    title: 'Instant confirmation',
    desc: 'No callbacks. Your slot is held the moment you confirm.',
  },
  {
    icon: Home,
    title: 'Home visits included',
    desc: 'Filter by in-clinic or home visit and compare side-by-side.',
  },
]

export default function ProofSection() {
  return (
    <section className="bg-[#F7F8F9] py-20 md:py-28" aria-label="Network transparency">
      <div className="bp-container">
        <div className="max-w-2xl mb-14">
          <div className="bp-kicker mb-4">Straightforward booking</div>
          <h2 className="text-slate-900 mb-3">Real availability, no guesswork</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Every slot you see is one the physiotherapist has actually opened. Fees, timings, and credentials are shown upfront — no surprises.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] items-start">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[13px] font-semibold text-slate-500">Example provider categories</span>
              </div>
              <Link
                href="/search"
                className="text-[13px] font-semibold text-[#00766C] hover:text-[#005A52] flex items-center gap-1 group"
              >
                Browse all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {providers.map((provider) => (
              <Link
                key={provider.name}
                href="/search"
                className="group flex items-center gap-5 p-5 rounded-2xl border border-[#00766C]/20 bg-white hover:shadow-lg hover:shadow-[#00766C]/5 hover:border-[#00766C]/40 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E6F4F3] flex items-center justify-center text-[16px] font-bold text-[#00766C] group-hover:bg-[#00766C] group-hover:text-white transition-colors shrink-0">
                  {provider.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-[15px]">{provider.name}</span>
                    <ShieldCheck size={14} className="text-[#00766C] shrink-0" />
                  </div>
                  <div className="text-[13px] text-slate-500">
                    {provider.specialty} · {provider.city}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {'★★★★★'.split('').map((_, index) => (
                      <span key={index} className={`text-[11px] ${index < Math.floor(provider.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                    <span className="text-[12px] text-slate-400 ml-1">{provider.rating}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[17px] font-bold text-slate-900">₹{provider.fee}</div>
                  <div className="text-[12px] font-semibold text-[#00766C] mt-1">{provider.slot}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="relative rounded-2xl bg-[#E6F4F3] overflow-hidden flex justify-center" style={{ minHeight: 200 }}>
              <Image
                src={PROOF_CHARACTER}
                alt=""
                aria-hidden="true"
                width={180}
                height={240}
                className="object-contain object-bottom"
                sizes="180px"
              />
            </div>

            <div>
              <h3 className="text-slate-900 text-[20px] font-bold mb-2">Why you can trust the list</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">
                Every provider has been checked by our team. We focus only on physiotherapy.
              </p>
            </div>

            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E6F4F3] flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#00766C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-[14px] mb-0.5">{title}</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <Link
              href="/search"
              className="mt-2 w-full flex items-center justify-center gap-2 py-4 bg-[#00766C] text-white rounded-xl font-semibold text-[15px] hover:bg-[#005A52] transition-colors group"
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
