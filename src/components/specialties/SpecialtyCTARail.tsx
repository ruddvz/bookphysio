'use client'

import Link from 'next/link'
import { ArrowRight, Calendar, Phone, ShieldCheck } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { useUiV2 } from '@/hooks/useUiV2'

export interface SpecialtyCTARailProps {
  /** Human-readable specialty name, used for CTA copy, e.g. "Orthopaedic Physiotherapy". */
  specialtyLabel: string
  /** Destination for the primary CTA (usually `/search?specialty=<slug>`). */
  bookingHref: string
  /** Optional weekly demand series; renders an inline sparkline + trend chip. */
  demandValues?: readonly number[]
  /** Optional E.164 phone number for a secondary "Talk to an advisor" action. */
  advisorPhone?: string
  className?: string
}

const DEFAULT_DEMAND: readonly number[] = [18, 24, 21, 29, 33, 38, 42]

function indefiniteArticle(word: string): 'a' | 'an' {
  const first = word.trim().charAt(0).toLowerCase()
  return 'aeiou'.includes(first) ? 'an' : 'a'
}

function computeDelta(values: readonly number[]): number | undefined {
  if (values.length < 2) return undefined
  const first = values[0]
  const last = values[values.length - 1]
  if (!first) return undefined
  return Math.round(((last - first) / first) * 100)
}

/**
 * Flag-gated CTA rail for specialty article pages. Surfaces the primary
 * booking action alongside a credential chip, demand sparkline, and an
 * optional advisor phone. Renders nothing when `ui-v2` is disabled, so
 * the production article remains byte-for-byte identical for non-dogfood
 * traffic.
 */
export function SpecialtyCTARail({
  specialtyLabel,
  bookingHref,
  demandValues = DEFAULT_DEMAND,
  advisorPhone,
  className,
}: SpecialtyCTARailProps) {
  const uiV2 = useUiV2()

  if (!uiV2) return null

  const delta = computeDelta(demandValues)
  const bookAriaLabel = `Book ${indefiniteArticle(specialtyLabel)} ${specialtyLabel} session`

  return (
    <aside
      className={`rounded-[var(--sq-lg)] border border-black/10 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.08)] ${className ?? ''}`}
      data-testid="specialty-cta-rail"
      aria-label={`${specialtyLabel} quick actions`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00766C]" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00766C]">
              NCAHP verified
            </span>
          </div>
          <div className="hidden items-center gap-2 sm:inline-flex">
            <Sparkline
              role="patient"
              values={demandValues}
              width={96}
              height={28}
              ariaLabel={`${specialtyLabel} demand trend`}
            />
            {typeof delta === 'number' ? <TrendDelta value={delta} /> : null}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Weekly demand
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {advisorPhone ? (
            <Link
              href={`tel:${advisorPhone}`}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-black/5"
              aria-label="Talk to an advisor"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Talk to an advisor
            </Link>
          ) : null}
          <Link
            href={bookingHref}
            className="group inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-85"
            aria-label={bookAriaLabel}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Find a specialist
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default SpecialtyCTARail
