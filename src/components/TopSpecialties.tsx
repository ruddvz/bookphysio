'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const specialties = [
  {
    emoji: '🏃',
    label: 'Sports Physio',
    desc: 'Athletic injuries and performance recovery.',
    href: '/search?specialty=Sports+Physio',
    from: '#0F4C81',
    to:   '#1565C0',
    text: 'text-blue-700',
    bg:   'bg-blue-50',
    border: 'border-blue-100',
    hoverBorder: 'hover:border-blue-200',
  },
  {
    emoji: '🧠',
    label: 'Neuro Physio',
    desc: 'Stroke rehab, nerve recovery, and balance.',
    href: '/search?specialty=Neuro+Physio',
    from: '#0D766E',
    to:   '#0F766E',
    text: 'text-indigo-700',
    bg:   'bg-indigo-50',
    border: 'border-indigo-100',
    hoverBorder: 'hover:border-indigo-200',
  },
  {
    emoji: '🦴',
    label: 'Ortho Physio',
    desc: 'Joint pain, posture, and mobility support.',
    href: '/search?specialty=Ortho+Physio',
    text: 'text-green-700',
    bg:   'bg-green-50',
    border: 'border-green-100',
    hoverBorder: 'hover:border-green-200',
  },
  {
    emoji: '👶',
    label: 'Paediatric Physio',
    desc: 'Growth, motor skills, and early intervention.',
    href: '/search?specialty=Paediatric+Physio',
    text: 'text-sky-700',
    bg:   'bg-sky-50',
    border: 'border-sky-100',
    hoverBorder: 'hover:border-sky-200',
  },
  {
    emoji: '🌸',
    label: "Women's Health",
    desc: 'Pre- and post-natal recovery and pelvic care.',
    href: '/search?specialty=Womens+Health',
    text: 'text-pink-700',
    bg:   'bg-pink-50',
    border: 'border-pink-100',
    hoverBorder: 'hover:border-pink-200',
  },
  {
    emoji: '🤝',
    label: 'Geriatric Physio',
    desc: 'Strength, mobility, and independence at home.',
    href: '/search?specialty=Geriatric+Physio',
    text: 'text-violet-700',
    bg:   'bg-violet-50',
    border: 'border-violet-100',
    hoverBorder: 'hover:border-violet-200',
  },
]

export default function TopSpecialties() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Browse by specialty">
      <div className="bp-container">

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Browse by Specialty</div>
            <h2 className="text-slate-900 mb-3">
              Start from the care you need.
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Choose a specialty and we&apos;ll surface IAP-verified physiotherapists near you — with real-time availability.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-semibold hover:border-indigo-200 hover:text-indigo-700 transition-all group shrink-0 self-start lg:self-auto"
          >
            View all specialties
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {specialties.map(({ emoji, label, desc, href, text, bg, border, hoverBorder }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'group flex flex-col gap-4 p-6 rounded-2xl border bg-white',
                'transition-all duration-200 hover:-translate-y-1',
                'hover:shadow-lg hover:shadow-slate-200/80',
                border,
                hoverBorder,
              )}
            >
              {/* Icon */}
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl', bg)}>
                {emoji}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={cn('text-[18px] font-bold mb-1.5 transition-colors group-hover:text-indigo-700', text)}>
                  {label}
                </h3>
                <p className="text-slate-500 text-[14px] leading-relaxed">{desc}</p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                Find specialists
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-8 flex flex-wrap items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold">
            ✓ IAP-verified care
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-semibold">
            🏠 Home visits available
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-semibold">
            ⚡ Same-day booking
          </div>
          <p className="ml-auto text-[13px] text-slate-400 font-medium hidden md:block">
            Search should feel curated, not crowded.
          </p>
        </div>
      </div>
    </section>
  )
}