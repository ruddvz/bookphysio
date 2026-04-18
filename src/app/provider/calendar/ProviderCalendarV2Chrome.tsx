'use client'

import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { useUiV2 } from '@/hooks/useUiV2'

function halfWindowDeltaPct(values: readonly number[]): number {
  if (values.length < 2) return 0
  const mid = Math.floor(values.length / 2)
  const head = values.slice(0, mid)
  const tail = values.slice(mid)
  const avg = (xs: readonly number[]) => xs.reduce((s, v) => s + v, 0) / xs.length
  const a = avg(head)
  const b = avg(tail)
  if (a === 0) return Math.round(b * 100) / 100
  return Math.round(((b - a) / a) * 100)
}

export interface ProviderCalendarV2ChromeProps {
  /** Bookings per day Mon–Sun (same order as week view). */
  bookingsPerDay: readonly number[]
  weekTotalRupees: number
}

/**
 * Flag-gated v2 strip above the calendar grid — weekly load sparkline + trend +
 * revenue badge. Returns null when ui-v2 is off.
 */
export function ProviderCalendarV2Chrome({ bookingsPerDay, weekTotalRupees }: ProviderCalendarV2ChromeProps) {
  const v2 = useUiV2()
  if (!v2) return null

  const delta = halfWindowDeltaPct(bookingsPerDay)
  const totalVisits = bookingsPerDay.reduce((s, n) => s + n, 0)

  return (
    <div
      data-testid="provider-calendar-v2-chrome"
      className="mb-5 flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <CalendarClock size={14} className="text-[var(--color-pv-primary)]" aria-hidden />
          Provider · Week load
        </div>
        <p className="text-[14px] font-bold text-[var(--color-pv-ink)]">Session density vs prior half-week</p>
        <p className="text-[12px] font-medium text-slate-500">
          {totalVisits} visit{totalVisits === 1 ? '' : 's'} scheduled this week
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Sparkline role="provider" values={bookingsPerDay} width={112} height={32} ariaLabel="Weekly booking load" />
        <TrendDelta value={delta} />
        <Badge role="provider" variant="soft" tone={1}>
          ₹{weekTotalRupees.toLocaleString('en-IN')} week
        </Badge>
      </div>
    </div>
  )
}
