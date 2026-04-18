'use client'

import { CalendarCheck, TrendingUp, UserPlus } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { Badge } from '@/components/dashboard/primitives/Badge'
export interface ProviderPulseProps {
  /**
   * Forward-looking sessions per week (oldest → newest, bucket 0 = this
   * week). Drives the sparkline and the first-half vs second-half trend
   * chip. Pass at minimum 4 buckets for a meaningful comparison.
   */
  weeklyLoad: readonly number[]
  /** Visits left on today's schedule — powers the "In session" nudge. */
  remainingToday: number
  /** Upcoming first-time patients across the same window. */
  firstVisitCount: number
  className?: string
}

export type BookingStatusTone = 'success' | 'soft' | 'warning'

export interface BookingStatus {
  tone: BookingStatusTone
  label: string
  description: string
}

/**
 * Compare the first-half average of the forward-looking series to the
 * second half and return a whole-percent delta. Undefined when the
 * series is too short or the first-half baseline is zero, matching the
 * patient side's semantics.
 */
export function computeLoadTrend(values: readonly number[]): number | undefined {
  if (values.length < 2) return undefined
  const mid = Math.floor(values.length / 2)
  const head = values.slice(0, mid)
  const tail = values.slice(mid)
  if (head.length === 0 || tail.length === 0) return undefined
  const avg = (xs: readonly number[]) => xs.reduce((sum, v) => sum + v, 0) / xs.length
  const baseline = avg(head)
  if (baseline === 0) return undefined
  return Math.round(((avg(tail) - baseline) / baseline) * 100)
}

interface BookingStatusInput {
  remainingToday: number
  weeklyLoad: readonly number[]
}

/**
 * Heavy-clinic threshold for the "Busy week" nudge. Picked as 10 so a
 * ~5-day clinic week averaging 2 visits/day tips the badge — above that
 * the practitioner usually wants a pacing reminder rather than a push
 * to book more.
 */
const BUSY_WEEK_THRESHOLD = 10

/**
 * Map provider booking signals into a status tone, headline, and
 * supporting copy.
 *
 * - Visits left today → success / "In session"
 * - This week ≥ heavy threshold, nothing left today → soft / "Busy week"
 * - This week empty but later weeks booked → soft / "Quiet week"
 * - Nothing booked in the entire window → warning / "Open diary"
 * - Otherwise → success / "Steady"
 */
export function getBookingStatus({ remainingToday, weeklyLoad }: BookingStatusInput): BookingStatus {
  if (remainingToday > 0) {
    return {
      tone: 'success',
      label: 'In session',
      description: remainingTodayCopy(remainingToday),
    }
  }
  const thisWeek = weeklyLoad[0] ?? 0
  const hasAnyLoad = weeklyLoad.some((v) => v > 0)
  if (thisWeek >= BUSY_WEEK_THRESHOLD) {
    return {
      tone: 'soft',
      label: 'Busy week',
      description: 'Heavy clinic week — plan in breaks between consults.',
    }
  }
  if (thisWeek === 0 && hasAnyLoad) {
    const later = weeklyLoad.slice(1).reduce((sum, v) => sum + v, 0)
    return {
      tone: 'soft',
      label: 'Quiet week',
      description: `Nothing this week — ${later} session${later === 1 ? '' : 's'} booked further out.`,
    }
  }
  if (!hasAnyLoad) {
    return {
      tone: 'warning',
      label: 'Open diary',
      description: 'No sessions booked — share your profile to draw patients in.',
    }
  }
  return {
    tone: 'success',
    label: 'Steady',
    description: 'Clinic is paced well across the next few weeks.',
  }
}

function remainingTodayCopy(remaining: number): string {
  return remaining === 1 ? '1 more consult today.' : `${remaining} more consults today.`
}

// `soft` uses the outline variant so it reads as visually distinct from
// the provider brand chip — otherwise "Quiet week" / "Busy week" would
// collide with the teal `success` "In session" chip on the same card.
const TONE_TO_BADGE_VARIANT = {
  success: 'success',
  soft: 'outline',
  warning: 'warning',
} as const

/**
 * Flag-gated v2 provider dashboard rail card. Surfaces forward booking
 * load (sparkline + trend chip), first-visit pipeline, and a status
 * nudge derived from today's remaining visits + weekly load. Pure /
 * props-driven so the dashboard page stays the source of truth for the
 * underlying schedule data.
 */
export function ProviderPulse({
  weeklyLoad,
  remainingToday,
  firstVisitCount,
  className = '',
}: ProviderPulseProps) {
  const trend = computeLoadTrend(weeklyLoad)
  const status = getBookingStatus({ remainingToday, weeklyLoad })
  const firstVisitCopy = `${firstVisitCount} ${firstVisitCount === 1 ? 'first visit' : 'first visits'}`
  // A fixed-length zero-filled series still has `length > 0`, so gate
  // the sparkline + headline on any non-zero entry instead — otherwise
  // a flat-zero baseline contradicts the "Open diary" nudge underneath.
  const hasAnyLoad = weeklyLoad.some((v) => v > 0)

  return (
    <aside
      className={`rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)] ${className}`}
      data-testid="provider-pulse"
      aria-label="Booking pulse"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Booking pulse
        </div>
        <Badge role="provider" variant={TONE_TO_BADGE_VARIANT[status.tone]} tone={1}>
          {status.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--color-pv-primary)]" aria-hidden="true" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Weekly load
            </div>
            <div className="text-[13px] font-bold text-[var(--color-pv-ink)]">
              {hasAnyLoad ? `${weeklyLoad.length}-week outlook` : 'No sessions booked'}
            </div>
          </div>
        </div>
        {hasAnyLoad ? (
          <Sparkline
            role="provider"
            values={weeklyLoad}
            width={96}
            height={28}
            ariaLabel="Booking load trend"
          />
        ) : null}
      </div>

      {typeof trend === 'number' ? (
        <div className="mt-2 flex items-center gap-2">
          <TrendDelta value={trend} />
          <span className="text-[11px] font-medium text-slate-500">vs earlier weeks</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2 text-[12px] font-medium text-slate-500">
        <UserPlus size={14} className="text-[var(--color-pv-primary)]" aria-hidden="true" />
        Pipeline · <span className="font-bold text-[var(--color-pv-ink)]">{firstVisitCopy}</span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[var(--sq-sm)] bg-[var(--color-pv-track-bg)]/70 px-3 py-2.5">
        <CalendarCheck size={14} className="mt-0.5 text-[var(--color-pv-primary)] shrink-0" aria-hidden="true" />
        <p className="text-[12px] font-medium text-[var(--color-pv-ink)] leading-snug">
          {status.description}
        </p>
      </div>
    </aside>
  )
}

export default ProviderPulse
