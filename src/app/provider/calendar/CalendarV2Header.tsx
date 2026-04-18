'use client'

import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'

/**
 * v2 chrome for provider calendar — self-gates via `useUiV2()`.
 */
export function CalendarV2Header() {
  const v2 = useUiV2()
  if (!v2) return null

  return (
    <div
      data-ui-version="v2"
      data-testid="calendar-v2-header"
      className="mb-6 rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-5"
      aria-label="Calendar overview"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-pv-primary)]">
            SCHEDULE
          </p>
          <h2 className="text-[22px] font-bold tracking-tight text-[var(--color-pv-ink)]">
            Clinical Calendar
          </h2>
          <p className="mt-1 max-w-xl text-[14px] text-[var(--color-pv-muted)]">
            Weekly view of your sessions and open slots
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Calendar meta">
          <Badge role="provider" variant="soft" tone={1}>
            7-day view
          </Badge>
          <Badge role="provider" variant="outline">
            IST
          </Badge>
          <Badge role="provider" variant="success">
            Live
          </Badge>
        </div>
      </div>
      <div
        className="mt-4 flex flex-wrap items-center gap-6 border-t border-[var(--color-pv-border-soft)] pt-4 text-[13px] font-bold text-[var(--color-pv-muted)]"
        aria-label="Legend"
      >
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-pv-primary)]" aria-hidden />
          Booked
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
          Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" aria-hidden />
          Blocked
        </span>
      </div>
    </div>
  )
}
