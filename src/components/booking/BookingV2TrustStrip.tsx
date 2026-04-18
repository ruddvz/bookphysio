'use client'

import { ShieldCheck, Receipt, Lock } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { useUiV2 } from '@/hooks/useUiV2'

export interface BookingV2TrustStripProps {
  /** Current booking step (1 = confirm, 2 = payment, 3 = success). */
  step: 1 | 2 | 3
  /** `true` if the target provider carries verified IAP / council registration. */
  providerVerified?: boolean
  /** Median end-to-end booking time in seconds. */
  medianBookingSeconds?: number
  /** Week-over-week delta; negative = faster (good when `inverse` is on). */
  deltaPct?: number
}

/**
 * Flag-gated v2 addition to `/book/[id]` (slice 16.15). Renders a thin trust +
 * speed strip under the existing step rail on steps 1 + 2 (hidden on the
 * success step). Returns `null` in v1 and on step 3 so SSR / success flow is
 * byte-identical with the v1 experience.
 */
export function BookingV2TrustStrip({
  step,
  providerVerified = true,
  medianBookingSeconds = 58,
  deltaPct = -12,
}: BookingV2TrustStripProps) {
  const isV2 = useUiV2()
  if (!isV2) return null
  if (step === 3) return null

  return (
    <div
      data-testid="booking-v2-trust-strip"
      data-ui-version="v2"
      className="mb-8 flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,118,108,0.05)]"
    >
      <Badge role="provider" variant="success">
        <ShieldCheck size={12} className="mr-1" />
        {providerVerified ? 'IAP verified provider' : 'Provider in review'}
      </Badge>
      <Badge role="patient" variant="soft" tone={2}>
        <Receipt size={12} className="mr-1" />
        GST-invoiced
      </Badge>
      <Badge role="patient" variant="soft" tone={3}>
        <Lock size={12} className="mr-1" />
        Encrypted UPI / Card
      </Badge>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Avg booking {medianBookingSeconds}s
        </span>
        <TrendDelta value={deltaPct} inverse />
      </div>
    </div>
  )
}
