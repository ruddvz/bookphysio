'use client'

import { Settings } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { useUiV2 } from '@/hooks/useUiV2'
import { PROVIDER_AVAILABILITY_DAYS, type ProviderMultiSlotSchedule } from '@/lib/provider-availability'

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

export interface ProviderAvailabilityV2ChromeProps {
  schedule: ProviderMultiSlotSchedule
  durationMinutes: number
}

/**
 * Flag-gated v2 strip — sparkline of open-window counts per weekday + template badge.
 */
export function ProviderAvailabilityV2Chrome({ schedule, durationMinutes }: ProviderAvailabilityV2ChromeProps) {
  const v2 = useUiV2()
  if (!v2) return null

  const series = PROVIDER_AVAILABILITY_DAYS.map((day) =>
    schedule[day].enabled ? schedule[day].slots.length : 0,
  )
  const delta = halfWindowDeltaPct(series)
  const enabledDays = PROVIDER_AVAILABILITY_DAYS.filter((d) => schedule[d].enabled).length

  return (
    <div
      data-testid="provider-availability-v2-chrome"
      className="mb-6 flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <Settings size={14} className="text-[var(--color-pv-primary)]" aria-hidden />
          Provider · Template pulse
        </div>
        <p className="text-[14px] font-bold text-[var(--color-pv-ink)]">Recurring windows per weekday</p>
        <p className="text-[12px] font-medium text-slate-500">
          {enabledDays} active day{enabledDays === 1 ? '' : 's'} · {durationMinutes} min slots
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Sparkline role="provider" values={series} width={112} height={32} ariaLabel="Availability windows per day" />
        <TrendDelta value={delta} />
        <Badge role="provider" variant="soft" tone={2}>
          {durationMinutes}m cadence
        </Badge>
      </div>
    </div>
  )
}
