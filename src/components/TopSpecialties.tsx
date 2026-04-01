'use client'

import Link from 'next/link'
import { Activity, Brain, Bone, Baby, Heart, UserRound, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Home, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Specialty = {
  icon: typeof Activity
  label: string
  href: string
  tone: string
  iconTone: string
  description: string
}

const specialties: Specialty[] = [
  {
    icon: Activity,
    label: 'Sports Physio',
    description: 'Athletic injuries and performance recovery.',
    href: '/search?specialty=Sports+Physio',
    tone: 'bg-blue-50',
    iconTone: 'text-blue-600',
  },
  {
    icon: Brain,
    label: 'Neuro Physio',
    description: 'Stroke rehab, nerve recovery, and balance.',
    href: '/search?specialty=Neuro+Physio',
    tone: 'bg-teal-50',
    iconTone: 'text-[#00766C]',
  },
  {
    icon: Bone,
    label: 'Ortho Physio',
    description: 'Joint pain, posture, and mobility support.',
    href: '/search?specialty=Ortho+Physio',
    tone: 'bg-emerald-50',
    iconTone: 'text-emerald-600',
  },
  {
    icon: Baby,
    label: 'Paediatric Physio',
    description: 'Growth, motor skills, and early intervention.',
    href: '/search?specialty=Paediatric+Physio',
    tone: 'bg-cyan-50',
    iconTone: 'text-cyan-700',
  },
  {
    icon: Heart,
    label: "Women's Health",
    description: 'Pre- and post-natal recovery and pelvic care.',
    href: '/search?specialty=Womens+Health',
    tone: 'bg-[#F0FAF9]',
    iconTone: 'text-[#005A52]',
  },
  {
    icon: UserRound,
    label: 'Geriatric Physio',
    description: 'Strength, mobility, and independence at home.',
    href: '/search?specialty=Geriatric+Physio',
    tone: 'bg-violet-50',
    iconTone: 'text-violet-600',
  },
]

function SpecialtyCard({ icon: Icon, label, description, href, tone, iconTone }: Specialty) {
  return (
    <Link
      href={href}
      className={cn(
        'bp-card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00766C]/20 hover:shadow-[0_22px_50px_-30px_rgba(15,23,42,0.22)] md:p-7',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-[18px]', tone)}>
          <Icon size={28} strokeWidth={2.2} className={iconTone} />
        </div>
        <ArrowRight size={18} className="mt-1 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#00766C]" />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-900 transition-colors group-hover:text-[#00766C]">
          {label}
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-slate-500">{description}</p>

        <div className="mt-auto pt-6 text-[13px] font-semibold text-[#00766C]">
          Explore specialists
        </div>
      </div>
    </Link>
  )
}

export default function TopSpecialties() {
  return (
    <section className="bp-section border-y border-[#E6E8EC] bg-white">
      <div className="bp-shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <Sparkles size={13} />
              Browse by specialty
            </div>
            <h2 className="bp-title">Search by clinical specialty.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Start with the care type, then narrow by location and visit mode. The layout stays simple so the decision feels obvious.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-[#DDE3E8] bg-[#FCFDFD] px-5 py-3 text-[14px] font-semibold text-slate-700 transition-all hover:border-[#00766C] hover:text-[#005A52]"
          >
            View all specialties
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {specialties.map((specialty) => (
            <SpecialtyCard key={specialty.label} {...specialty} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[24px] border border-[#E6E8EC] bg-[#FCFDFD] px-4 py-4 text-[13px] text-slate-600">
          <span className="bp-chip-active inline-flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#00766C]" />
            Verified care
          </span>
          <span className="bp-chip inline-flex items-center gap-2">
            <Home size={14} className="text-[#00766C]" />
            Home visits
          </span>
          <span className="bp-chip inline-flex items-center gap-2">
            <Clock3 size={14} className="text-[#00766C]" />
            Same-day booking
          </span>
          <p className="ml-auto text-slate-500">
            Matching is tuned for clarity first, not noise.
          </p>
        </div>
      </div>
    </section>
  )
}