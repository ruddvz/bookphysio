'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Baby,
  Bone,
  Brain,
  Dumbbell,
  Flower2,
  HeartPulse,
  Ribbon,
  Stethoscope,
  Users,
} from 'lucide-react'
import { SPECIALTIES } from '@/lib/specialties'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Bone,
  Brain,
  HeartPulse,
  Dumbbell,
  Baby,
  Flower2,
  Ribbon,
  Users,
}

export default function TopSpecialties() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Browse by specialty">
      <div className="bp-container">

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Browse by specialty</div>
            <h2 className="text-slate-900 mb-3">
              Start from what is bothering you.
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Pick a specialty and we will show you verified physiotherapists in your city, along with their real availability.
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SPECIALTIES.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Stethoscope
            return (
              <Link
                key={s.slug}
                href={`/specialties/${s.slug}`}
                className={cn(
                  'group flex flex-col gap-4 p-6 rounded-2xl border bg-white',
                  'transition-all duration-200 hover:-translate-y-1',
                  'hover:shadow-lg hover:shadow-slate-200/80',
                  s.tint.border,
                  s.tint.hoverBorder,
                )}
              >
                {/* Icon */}
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', s.tint.bg, s.tint.text)}>
                  <Icon size={22} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={cn('text-[16px] font-bold mb-1 transition-colors group-hover:text-indigo-700', s.tint.text)}>
                    {s.label}
                  </h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{s.tagline}</p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  Learn more
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-8 flex flex-wrap items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold">
            IAP-verified care
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-semibold">
            Home visits available
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-semibold">
            Same-day booking
          </div>
          <p className="ml-auto text-[12px] text-slate-400 font-medium hidden md:block">
            NCAHP-recognised specialties
          </p>
        </div>
      </div>
    </section>
  )
}
