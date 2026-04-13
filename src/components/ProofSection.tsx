'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { ShieldCheck, Clock, Home, ArrowRight } from 'lucide-react'
import type { SearchResponse } from '@/app/api/contracts/search'
import { getProviderDisplayName, getProviderInitials } from '@/lib/providers/display-name'
import { formatIndiaDateTime } from '@/lib/india-date'

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

const LIVE_PROVIDERS_URL = '/api/providers?limit=3&sort=rating'

async function fetcher(url: string): Promise<SearchResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch proof providers')
  return res.json() as Promise<SearchResponse>
}

export default function ProofSection() {
  const { data } = useSWR<SearchResponse>(
    LIVE_PROVIDERS_URL,
    fetcher,
    { revalidateOnFocus: false },
  )

  const providers = data?.providers ?? []

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
                  Live provider highlights
                </span>
              </div>
              <Link
                href="/search"
                className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Browse all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {providers.map((provider) => {
              const providerName = getProviderDisplayName(provider)
              const specialty = provider.specialties[0]?.name ?? 'Physiotherapist'
              const initials = getProviderInitials(provider.full_name)
              const slotLabel = provider.next_available_slot
                ? formatIndiaDateTime(provider.next_available_slot, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                : 'Check latest availability'

              return (
              <div
                key={provider.id}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
              >
                {/* Avatar */}
                {provider.avatar_url ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={provider.avatar_url} alt={providerName} fill className="object-cover" sizes="56px" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[16px] font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors shrink-0">
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-[15px]">{providerName}</span>
                    <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
                  </div>
                  <div className="text-[13px] text-slate-500">
                    {specialty} · {provider.city}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className={`text-[11px] ${i < Math.floor(provider.rating_avg) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                    <span className="text-[12px] text-slate-400 ml-1">{provider.rating_avg.toFixed(1)}</span>
                  </div>
                </div>

                {/* Price + slot */}
                <div className="text-right shrink-0">
                  <div className="text-[17px] font-bold text-slate-900">₹{provider.consultation_fee_inr ?? 0}</div>
                  <div className="text-[12px] font-semibold text-indigo-600 mt-1">{slotLabel}</div>
                </div>
              </div>
              )
            })}
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
              className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-semibold text-[15px] hover:bg-slate-800 transition-colors group"
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
