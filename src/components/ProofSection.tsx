'use client'

import { ShieldCheck, Clock, Home, ArrowRight, Users, Calendar, Star as StarIcon, MapPin as MapPinIcon } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

interface PlatformStats {
  providers: number
  cities: number
  appointments: number
  avgRating: number
}

async function fetchStats(url: string): Promise<PlatformStats> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed')
  return res.json() as Promise<PlatformStats>
}

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
  const { data: stats } = useSWR<PlatformStats>('/api/stats', fetchStats, { revalidateOnFocus: false })

  const trustStats = [
    { icon: Users,     value: stats ? `${stats.providers}+` : 'IAP',  label: 'Verified providers'   },
    { icon: MapPinIcon, value: stats ? `${stats.cities}+` : '10+',    label: 'Cities supported'     },
    { icon: Calendar,  value: stats ? `${stats.appointments.toLocaleString('en-IN')}+` : 'Free', label: stats ? 'Appointments booked' : 'To list your practice' },
    { icon: StarIcon,  value: stats && stats.avgRating > 0 ? `${stats.avgRating}★` : '60s',  label: stats && stats.avgRating > 0 ? 'Average rating' : 'To book a session' },
  ]

  return (
    <section className="bg-[#F8F7FF] py-24 md:py-32" aria-label="Network transparency">
      <div className="bp-container">
        {/* Section header */}
        <div className="max-w-2xl mb-10">
          <div className="bp-kicker mb-4">Straightforward booking</div>
          <h2 className="text-slate-900 mb-4">Real availability, no guesswork</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Every slot on a provider page is a slot the physiotherapist has actually opened up. Fees, timings and credentials are shown upfront, so there are no surprises at the session.
          </p>
        </div>

        {/* Dynamic trust stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {trustStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/60 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <stat.icon size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
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
                className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Browse all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {providers.map((p) => (
              <div
                key={p.name}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[16px] font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors shrink-0">
                  {p.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-[15px]">{p.name}</span>
                    <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
                  </div>
                  <div className="text-[13px] text-slate-500">
                    {p.specialty} · {p.city}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className={`text-[11px] ${i < Math.floor(p.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                    <span className="text-[12px] text-slate-400 ml-1">{p.rating}</span>
                  </div>
                </div>

                {/* Price + slot */}
                <div className="text-right shrink-0">
                  <div className="text-[17px] font-bold text-slate-900">₹{p.fee}</div>
                  <div className="text-[12px] font-semibold text-indigo-600 mt-1">{p.slot}</div>
                </div>
              </div>
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