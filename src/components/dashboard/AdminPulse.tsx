'use client'

import { Activity, CheckCircle2, TrendingUp } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { useUiV2 } from '@/hooks/useUiV2'

export interface AdminPulseProps {
  /**
   * Monthly appointment counts in chronological order (oldest → newest).
   * Drives the sparkline and the first-half vs second-half trend chip.
   * The `/api/admin/analytics` endpoint returns a 7-month window.
   */
  monthlyAppointments: readonly number[]
  /** Completion rate as a percentage, 0–100. */
  completionRate: number
  /** All-time appointment count — used to detect an empty platform. */
  totalAppointments: number
  className?: string
}

export type PlatformStatusTone = 'success' | 'soft' | 'warning'

export interface PlatformStatus {
  tone: PlatformStatusTone
  label: string
  description: string
}

/**
 * Compare the first-half average of the series to the second half and
 * return a whole-percent delta. Undefined when the series is too short
 * or the first-half baseline is zero, matching the per-role pulse
 * cards' semantics.
 */
export function computePlatformTrend(values: readonly number[]): number | undefined {
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

interface PlatformStatusInput {
  monthlyAppointments: readonly number[]
  completionRate: number
  totalAppointments: number
}

/**
 * A completion rate below this threshold flips the status to "Watch
 * list" even when volume is growing. Picked at 60% because anything
 * lower usually reflects a structural issue (flaky providers, broken
 * checkout) that deserves ops attention ahead of growth talk.
 */
const COMPLETION_RATE_WATCH_THRESHOLD = 60

/**
 * A first-half → second-half appointment drop steeper than this flips
 * the status to "Cooling". -10% is roughly a month of lost growth at
 * the platform scale we expect during the v2 rollout.
 */
const COOLING_TREND_THRESHOLD = -10

/**
 * Mirror threshold for "Healthy" — a sustained +5% month-over-month
 * average lift is a strong enough signal to celebrate on the rail.
 */
const HEALTHY_TREND_THRESHOLD = 5

/**
 * Map platform signals into a status tone, headline, and supporting copy.
 *
 * - `totalAppointments === 0` → warning / "No activity" (onboarding nudge)
 * - Low completion rate → warning / "Watch list" (takes priority over trend)
 * - Sharp negative volume trend → soft / "Cooling"
 * - Strong positive volume trend with healthy completion → success / "Healthy"
 * - Otherwise → success / "Steady"
 */
export function getPlatformStatus({
  monthlyAppointments,
  completionRate,
  totalAppointments,
}: PlatformStatusInput): PlatformStatus {
  if (totalAppointments === 0) {
    return {
      tone: 'warning',
      label: 'No activity',
      description: 'Platform has no bookings yet — onboard providers or run a demand campaign.',
    }
  }
  if (completionRate < COMPLETION_RATE_WATCH_THRESHOLD) {
    return {
      tone: 'warning',
      label: 'Watch list',
      description: 'Completion rate is low — investigate cancellations and no-shows.',
    }
  }
  const trend = computePlatformTrend(monthlyAppointments)
  if (typeof trend === 'number' && trend <= COOLING_TREND_THRESHOLD) {
    return {
      tone: 'soft',
      label: 'Cooling',
      description: 'Volume is trending down — review provider supply and patient demand.',
    }
  }
  if (typeof trend === 'number' && trend >= HEALTHY_TREND_THRESHOLD) {
    return {
      tone: 'success',
      label: 'Healthy',
      description: 'Appointment volume is rising with strong completion.',
    }
  }
  return {
    tone: 'success',
    label: 'Steady',
    description: 'Platform metrics are stable across the rolling window.',
  }
}

// `soft` uses the outline variant so it reads as visually distinct from
// the admin brand `success` chip — without outline they collide on the
// admin palette and "Cooling" would look identical to "Healthy".
const TONE_TO_BADGE_VARIANT = {
  success: 'success',
  soft: 'outline',
  warning: 'warning',
} as const

/**
 * Flag-gated v2 admin dashboard rail card. Surfaces platform-level
 * health (monthly appointment volume sparkline + trend chip),
 * completion rate, and a status nudge. Pure / props-driven so the
 * `/admin` page stays the source of truth for the underlying data.
 */
export function AdminPulse({
  monthlyAppointments,
  completionRate,
  totalAppointments,
  className = '',
}: AdminPulseProps) {
  const uiV2 = useUiV2()
  if (!uiV2) return null

  const trend = computePlatformTrend(monthlyAppointments)
  const status = getPlatformStatus({ monthlyAppointments, completionRate, totalAppointments })
  const completionCopy = `${completionRate.toFixed(1)}%`
  // A 7-month zero-filled series still has `length > 0`, so gate the
  // sparkline + headline on any non-zero entry instead — otherwise an
  // all-zero baseline contradicts the "No activity" nudge underneath.
  const hasAnyVolume = monthlyAppointments.some((v) => v > 0)

  return (
    <aside
      className={`rounded-[var(--sq-lg)] border border-[var(--color-ad-border)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)] ${className}`}
      data-testid="admin-pulse"
      aria-label="Platform pulse"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Platform pulse
        </div>
        <Badge role="admin" variant={TONE_TO_BADGE_VARIANT[status.tone]} tone={1}>
          {status.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--color-ad-primary)]" aria-hidden="true" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Appointment volume
            </div>
            <div className="text-[13px] font-bold text-[var(--color-ad-ink)]">
              {hasAnyVolume ? `${monthlyAppointments.length}-month trend` : 'Not yet active'}
            </div>
          </div>
        </div>
        {hasAnyVolume ? (
          <Sparkline
            role="admin"
            values={monthlyAppointments}
            width={96}
            height={28}
            ariaLabel="Appointment volume trend"
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
        <CheckCircle2 size={14} className="text-[var(--color-ad-primary)]" aria-hidden="true" />
        Completion · <span className="font-bold text-[var(--color-ad-ink)]">{completionCopy}</span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[var(--sq-sm)] bg-[var(--color-ad-surface)] px-3 py-2.5">
        <Activity size={14} className="mt-0.5 text-[var(--color-ad-primary)] shrink-0" aria-hidden="true" />
        <p className="text-[12px] font-medium text-[var(--color-ad-ink)] leading-snug">
          {status.description}
        </p>
      </div>
    </aside>
  )
}

export default AdminPulse
