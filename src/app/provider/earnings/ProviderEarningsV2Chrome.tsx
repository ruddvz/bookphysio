'use client'

import { Wallet } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { useUiV2 } from '@/hooks/useUiV2'
import { halfWindowDeltaPct } from './provider-earnings-utils'

export interface ProviderEarningsV2ChromeProps {
  monthlySettled: readonly number[]
  totalSettledInr: number
}

/**
 * Flag-gated v2 strip — 6-month settled net sparkline, half-window trend, payout cadence badge.
 */
export function ProviderEarningsV2Chrome({ monthlySettled, totalSettledInr }: ProviderEarningsV2ChromeProps) {
  const v2 = useUiV2()
  if (!v2) return null

  const delta = halfWindowDeltaPct(monthlySettled)

  return (
    <div
      data-testid="provider-earnings-v2-chrome"
      className="flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <Wallet size={14} className="text-[var(--color-pv-primary)]" aria-hidden />
          Provider · Settled revenue
        </div>
        <p className="text-[14px] font-bold text-[var(--color-pv-ink)]">Six-month trend (India calendar months)</p>
        <p className="text-[12px] font-medium text-slate-500">
          Total settled · ₹{totalSettledInr.toLocaleString('en-IN')} (integer rupees)
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Sparkline
          role="provider"
          values={monthlySettled}
          width={128}
          height={36}
          ariaLabel="Monthly settled net trend"
        />
        <TrendDelta value={delta} />
        <Badge role="provider" variant="outline" tone={1}>
          Weekly payout · Thu
        </Badge>
      </div>
    </div>
  )
}
