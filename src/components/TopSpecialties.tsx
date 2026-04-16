'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
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
import { gsap, useGSAP } from '@/lib/gsap-client'

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
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // Staggered rise-and-fade for specialty cards as the grid scrolls
      // into view. Respect reduced-motion — skip entirely.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from('[data-specialty-card]', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: 'power3.out',
        stagger: { each: 0.06, from: 'start' },
        scrollTrigger: {
          trigger: '[data-specialty-grid]',
          start: 'top 85%',
          once: true,
        },
      })
    },
    { scope },
  )

  return (
    <section ref={scope} className="relative z-0 isolate bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Browse by specialty">
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
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--sq-sm)] border border-slate-200 bg-white text-slate-700 text-[14px] font-semibold hover:border-[#005A52] hover:text-[#005A52] transition-all group shrink-0 self-start lg:self-auto"
          >
            View all specialties
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid — 12 items, image-first cards */}
        {/* Grid — 12 items, image-first cards with squircle corners */}
        <div data-specialty-grid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPECIALTIES.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Stethoscope
            const hasImage = Boolean(s.image)

            return (
              <Link
                key={s.slug}
                data-specialty-card
                href={`/specialties/${s.slug}`}
                className={cn(
                  'group flex flex-col rounded-[var(--sq-lg)] border bg-white overflow-hidden',
                  'transition-all duration-200 hover:scale-[1.02]',
                  'hover:shadow-xl hover:shadow-slate-200/60',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_0_0_0.5px_rgba(0,0,0,0.04)]',
                  s.tint.border,
                  s.tint.hoverBorder,
                )}
              >
                {/* Image area */}
                {hasImage ? (
                  <div
                    className="relative w-full h-44 overflow-hidden"
                    style={{ backgroundColor: MUSTARD }}
                  >
                    <Image
                      src={s.image!}
                      alt={`${s.label} physiotherapy`}
                      fill
                      className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                ) : (
                  /* Fallback icon area */
                  <div className={cn('w-full h-36 flex items-center justify-center', s.tint.bg)}>
                    <div className={cn('w-16 h-16 rounded-[var(--sq-md)] flex items-center justify-center bg-white/60', s.tint.text)}>
                      <Icon size={28} />
                    </div>
                  </div>
                )}

                {/* Text content */}
                <div className="flex flex-col flex-1 gap-1.5 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {s.subLabel}
                  </p>
                  <h3 className={cn(
                    'text-[16px] font-bold transition-colors group-hover:text-indigo-700',
                    s.tint.text
                  )}>
                    {s.label}
                  </h3>
                  <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 flex-1">
                    {s.tagline}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors mt-1">
                    Learn more
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
