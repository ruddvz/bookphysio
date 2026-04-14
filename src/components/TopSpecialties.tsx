'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Baby,
  Bone,
  Brain,
  Briefcase,
  Dumbbell,
  Ear,
  Flower2,
  HeartPulse,
  PersonStanding,
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
  PersonStanding,
  Briefcase,
  Ear,
}

/** Mustard yellow — matches the 3D illustration card accent */
const MUSTARD = '#F5A623'

export default function TopSpecialties() {
  return (
    <section className="bg-white py-24 md:py-32 border-y border-slate-100" aria-label="Browse by specialty">
      <div className="bp-container">

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="border-l-4 border-[#00766C] pl-5">
              <div className="bp-kicker mb-3" style={{ background: 'rgba(0,118,108,0.08)', borderColor: 'rgba(0,118,108,0.2)', color: '#00766C' }}>
                Browse by specialty
              </div>
              <h2 className="text-slate-900 mb-3">
                Start from what is bothering you.
              </h2>
            </div>
            <p className="text-slate-500 text-[16px] leading-relaxed mt-4">
              Pick a specialty and we will show you verified physiotherapists in your city, along with their real availability.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-semibold hover:border-[#00766C]/40 hover:text-[#00766C] transition-all group shrink-0 self-start lg:self-auto"
          >
            View all specialties
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid — 12 items, image-first cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPECIALTIES.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Stethoscope
            const hasImage = Boolean(s.image)

            return (
              <Link
                key={s.slug}
                href={`/specialties/${s.slug}`}
                className={cn(
                  'group flex flex-col rounded-2xl border bg-white overflow-hidden',
                  'transition-all duration-200 hover:-translate-y-1',
                  'hover:shadow-lg hover:shadow-slate-200/80',
                  s.tint.border,
                  s.tint.hoverBorder,
                )}
              >
                {/* Image area */}
                {hasImage ? (
                  <div
                    className="relative w-full h-40 overflow-hidden"
                    style={{ backgroundColor: MUSTARD }}
                  >
                    <Image
                      src={s.image!}
                      alt={`${s.label} physiotherapy`}
                      fill
                      className="object-contain object-bottom"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                ) : (
                  /* Fallback icon area */
                  <div className={cn('w-full h-32 flex items-center justify-center', s.tint.bg)}>
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', s.tint.bg, s.tint.text)}>
                      <Icon size={28} />
                    </div>
                  </div>
                )}

                {/* Text content */}
                <div className="flex flex-col flex-1 gap-1.5 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {s.subLabel}
                  </p>
                  <h3 className="text-[16px] font-bold text-slate-900 transition-colors group-hover:text-[#00766C]">
                    {s.label}
                  </h3>
                  <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 flex-1">
                    {s.tagline}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 group-hover:text-[#00766C] transition-colors mt-1">
                    Learn more
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-8 flex flex-wrap items-center gap-3 px-5 py-4 rounded-2xl bg-[#F7F8F9] border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E6F4F3] border border-[#00766C]/20 text-[#00766C] text-[12px] font-semibold">
            IAP-verified care
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold">
            Home visits available
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold">
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
