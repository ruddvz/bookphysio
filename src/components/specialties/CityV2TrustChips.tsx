'use client'

import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { useUiV2 } from '@/hooks/useUiV2'

export interface CityV2TrustChipsProps {
  cityLabel: string
  /** Weekly booking demand signal — shown as a rolling sparkline in v2. */
  demandValues?: readonly number[]
}

const DEFAULT_DEMAND: readonly number[] = [14, 18, 22, 25, 30, 34, 38]

/**
 * Flag-gated v2 hero addition for `/city/[slug]`. Renders nothing in v1.
 * In v2 it surfaces a 3-chip trust row + a rolling demand sparkline so the
 * city landing feels alive and connected to the search rail.
 */
export function CityV2TrustChips({ cityLabel, demandValues = DEFAULT_DEMAND }: CityV2TrustChipsProps) {
  const isV2 = useUiV2()
  if (!isV2) return null

  return (
    <div
      data-testid="city-v2-trust-chips"
      data-ui-version="v2"
      className="mt-6 flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,118,108,0.05)]"
    >
      <Badge role="patient" variant="success">IAP verified</Badge>
      <Badge role="patient" variant="soft" tone={2}>Clinic + Home visits</Badge>
      <Badge role="patient" variant="soft" tone={3}>Transparent ₹ pricing</Badge>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Bookings this week
        </span>
        <Sparkline
          role="patient"
          values={demandValues}
          width={90}
          height={24}
          ariaLabel={`${cityLabel} weekly booking demand`}
        />
      </div>
    </div>
  )
}
