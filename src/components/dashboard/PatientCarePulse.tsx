'use client'

import { Activity, CalendarHeart, Users } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { useUiV2 } from '@/hooks/useUiV2'

export interface PatientCarePulseProps {
  /**
   * Weekly visit counts in chronological order (oldest → newest). The
   * component derives both the sparkline and the trend chip from this
   * series; pass at minimum 4 points for a meaningful comparison.
   */
  weeklyVisits: readonly number[]
  /** Distinct providers seen across the visit window. */
  careTeamSize: number
  /**
   * Days until the next confirmed appointment. `null` means nothing is
   * booked, which switches the status copy to a nudge.
   */
  nextAppointmentInDays: number | null
  className?: string
}

export type CareStatusTone = 'success' | 'soft' | 'warning'

export interface CareStatus {
  tone: CareStatusTone
  label: string
  description: string
}

/**
 * Compare the average of the first half of the series to the second
 * half and return a percentage delta rounded to the nearest integer.
 * Returns `undefined` when the series is too short or the baseline is
 * zero (no meaningful comparison possible).
 */
export function computeVisitTrend(values: readonly number[]): number | undefined {
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

interface CareStatusInput {
  nextAppointmentInDays: number | null
  weeklyVisits: readonly number[]
}

/**
 * How many trailing buckets count as "recent" for the status nudge.
 * A visit in the 8-week window but older than this threshold no longer
 * suppresses the "Time to book" copy, so the badge matches the actual
 * engagement signal rather than any non-zero entry in the series.
 */
const RECENT_BUCKET_WINDOW = 3

/**
 * Map the care signal into a status tone, headline, and supporting copy.
 *
 * - Booked appointment → success / "On track"
 * - No booking but recent visits (in the trailing window) → soft / "Stay engaged"
 * - No booking and no recent visits → warning / "Time to book"
 */
export function getCareStatus({ nextAppointmentInDays, weeklyVisits }: CareStatusInput): CareStatus {
  if (nextAppointmentInDays !== null) {
    return {
      tone: 'success',
      label: 'On track',
      description: nextVisitDescription(nextAppointmentInDays),
    }
  }
  const hasRecent = weeklyVisits.slice(-RECENT_BUCKET_WINDOW).some((v) => v > 0)
  if (hasRecent) {
    return {
      tone: 'soft',
      label: 'Stay engaged',
      description: 'Recent care logged — book a follow-up to keep momentum.',
    }
  }
  return {
    tone: 'warning',
    label: 'Time to book',
    description: 'Your last visit was a while back. A quick check-in can help.',
  }
}

function nextVisitDescription(days: number): string {
  if (days <= 0) return 'Next visit today.'
  if (days === 1) return 'Next visit tomorrow.'
  return `Next visit in ${days} days.`
}

// `soft` uses the outline variant so it reads as visually distinct from
// the brand-teal `success` chip — without outline they collide on the
// patient palette and "Stay engaged" would look identical to "On track".
const TONE_TO_BADGE_VARIANT = {
  success: 'success',
  soft: 'outline',
  warning: 'warning',
} as const

/**
 * Flag-gated v2 patient dashboard rail card. Surfaces visit cadence
 * (sparkline + trend chip), care team size, and a status nudge derived
 * from the next appointment. Pure / props-driven so the dashboard page
 * stays the source of truth for the underlying data.
 */
export function PatientCarePulse({
  weeklyVisits,
  careTeamSize,
  nextAppointmentInDays,
  className = '',
}: PatientCarePulseProps) {
  const uiV2 = useUiV2()
  if (!uiV2) return null

  const trend = computeVisitTrend(weeklyVisits)
  const status = getCareStatus({ nextAppointmentInDays, weeklyVisits })
  const careTeamCopy = `${careTeamSize} ${careTeamSize === 1 ? 'provider' : 'providers'}`
  // A fixed-length zero-filled series still has `length > 0`, so gate the
  // sparkline + cadence headline on any non-zero entry instead — otherwise
  // a flat-zero baseline contradicts the "Time to book" nudge underneath.
  const hasAnyVisits = weeklyVisits.some((v) => v > 0)

  return (
    <aside
      className={`rounded-[var(--sq-lg)] border border-[var(--color-pt-border)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)] ${className}`}
      data-testid="patient-care-pulse"
      aria-label="Care pulse"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Care pulse
        </div>
        <Badge role="patient" variant={TONE_TO_BADGE_VARIANT[status.tone]} tone={1}>
          {status.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[var(--color-pt-primary)]" aria-hidden="true" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Visit cadence
            </div>
            <div className="text-[13px] font-bold text-[var(--color-pt-ink)]">
              {hasAnyVisits ? `${weeklyVisits.length}-week trend` : 'No recent visits'}
            </div>
          </div>
        </div>
        {hasAnyVisits ? (
          <Sparkline
            role="patient"
            values={weeklyVisits}
            width={96}
            height={28}
            ariaLabel="Visit cadence trend"
          />
        ) : null}
      </div>

      {typeof trend === 'number' ? (
        <div className="mt-2 flex items-center gap-2">
          <TrendDelta value={trend} />
          <span className="text-[11px] font-medium text-slate-500">vs prior window</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2 text-[12px] font-medium text-slate-500">
        <Users size={14} className="text-[var(--color-pt-primary)]" aria-hidden="true" />
        Care team · <span className="font-bold text-[var(--color-pt-ink)]">{careTeamCopy}</span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[var(--sq-sm)] bg-[var(--color-pt-surface)]/70 px-3 py-2.5">
        <CalendarHeart size={14} className="mt-0.5 text-[var(--color-pt-primary)] shrink-0" aria-hidden="true" />
        <p className="text-[12px] font-medium text-[var(--color-pt-ink)] leading-snug">
          {status.description}
        </p>
      </div>
    </aside>
  )
}

export default PatientCarePulse
