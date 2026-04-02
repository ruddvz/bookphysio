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
    tone: 'bg-[#e3ecfa]',
    iconTone: 'text-[#355b9c]',
  },
  {
    icon: Brain,
    label: 'Neuro Physio',
    description: 'Stroke rehab, nerve recovery, and balance.',
    href: '/search?specialty=Neuro+Physio',
    tone: 'bg-[#dcefe9]',
    iconTone: 'text-[#0f7668]',
  },
  {
    icon: Bone,
    label: 'Ortho Physio',
    description: 'Joint pain, posture, and mobility support.',
    href: '/search?specialty=Ortho+Physio',
    tone: 'bg-[#e4efe2]',
    iconTone: 'text-[#4e7458]',
  },
  {
    icon: Baby,
    label: 'Paediatric Physio',
    description: 'Growth, motor skills, and early intervention.',
    href: '/search?specialty=Paediatric+Physio',
    tone: 'bg-[#e6f1f4]',
    iconTone: 'text-[#466b76]',
  },
  {
    icon: Heart,
    label: "Women's Health",
    description: 'Pre- and post-natal recovery and pelvic care.',
    href: '/search?specialty=Womens+Health',
    tone: 'bg-[#f7ece6]',
    iconTone: 'text-[#9a614c]',
  },
  {
    icon: UserRound,
    label: 'Geriatric Physio',
    description: 'Strength, mobility, and independence at home.',
    href: '/search?specialty=Geriatric+Physio',
    tone: 'bg-[#ede8f4]',
    iconTone: 'text-[#69558f]',
  },
]

function SpecialtyCard({ icon: Icon, label, description, href, tone, iconTone }: Specialty) {
  return (
    <Link
      href={href}
      className={cn(
        'bp-card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0f7668]/20 hover:shadow-[0_24px_54px_-34px_rgba(24,49,45,0.34)] md:p-7',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-[18px]', tone)}>
          <Icon size={28} strokeWidth={2.2} className={iconTone} />
        </div>
        <ArrowRight size={18} className="mt-1 text-[#c3b8aa] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0f7668]" />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <h3 className="text-[22px] font-semibold tracking-[-0.04em] text-[#18312d] transition-colors group-hover:text-[#0f7668]">
          {label}
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-[#66706b]">{description}</p>

        <div className="mt-auto pt-6 text-[13px] font-semibold text-[#0b5c52] underline-offset-4 group-hover:underline">
          Explore specialists
        </div>
      </div>
    </Link>
  )
}

export default function TopSpecialties() {
  return (
    <section className="bp-section border-y border-[#e0d6c9] bg-[#fffaf4]" aria-label="Browse by specialty">
      <div className="bp-shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <Sparkles size={13} />
              Browse by specialty
            </div>
            <h2 className="bp-title">Start from the kind of recovery you need.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Choose your care category and we'll surface verified physiotherapists in your city.
            </p>
          </div>

          <Link
            href="/search"
            className="bp-button-secondary"
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

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[28px] border border-[#ded4c7] bg-white px-4 py-4 text-[13px] text-[#5d6662]">
          <span className="bp-chip-active inline-flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#0f7668]" />
            Verified care
          </span>
          <span className="bp-chip inline-flex items-center gap-2">
            <Home size={14} className="text-[#0f7668]" />
            Home visits
          </span>
          <span className="bp-chip inline-flex items-center gap-2">
            <Clock3 size={14} className="text-[#0f7668]" />
            Same-day booking
          </span>
          <p className="ml-auto text-[#7d8a85]">
            Search should feel curated, not crowded.
          </p>
        </div>
      </div>
    </section>
  )
}