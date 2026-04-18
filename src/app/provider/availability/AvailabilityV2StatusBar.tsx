'use client'

import { Shield } from 'lucide-react'
import { useUiV2 } from '@/hooks/useUiV2'

/**
 * v2 status strip for availability settings — self-gates via `useUiV2()`.
 */
export function AvailabilityV2StatusBar() {
  const v2 = useUiV2()
  if (!v2) return null

  return (
    <div
      data-ui-version="v2"
      data-testid="availability-v2-status-bar"
      className="mb-6 rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-5"
      aria-label="Availability settings overview"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-pv-primary)]">
            AVAILABILITY
          </p>
          <h2 className="text-[22px] font-bold tracking-tight text-[var(--color-pv-ink)]">
            Working Hours
          </h2>
          <p className="mt-1 max-w-xl text-[14px] text-[var(--color-pv-muted)]">
            Set your weekly schedule and slot duration
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-pv-border-soft)] bg-white px-4 py-2 text-[13px] font-bold text-[var(--color-pv-ink)]">
          <Shield className="h-4 w-4 text-[var(--color-pv-primary)]" aria-hidden />
          Changes apply from the next booking window
        </div>
      </div>
    </div>
  )
}
