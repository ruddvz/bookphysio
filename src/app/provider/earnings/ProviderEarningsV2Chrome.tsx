'use client'

import { useId } from 'react'
import { Wallet } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { RECHARTS_FILL, RECHARTS_PRIMARY } from '@/components/dashboard/charts/recharts-theme'
import { useUiV2 } from '@/hooks/useUiV2'
import { halfWindowDeltaPct } from './provider-earnings-utils'

function shortMonthFromKey(key: string): string {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short' })
}

export interface ProviderEarningsV2ChromeProps {
  monthlySettled: readonly number[]
  /** YYYY-MM keys, same length as monthlySettled (oldest → newest) */
  monthKeys: readonly string[]
  totalSettledInr: number
}

/**
 * Flag-gated v2 strip — 6-month settled net line chart, half-window trend, payout cadence badge.
 */
export function ProviderEarningsV2Chrome({
  monthlySettled,
  monthKeys,
  totalSettledInr,
}: ProviderEarningsV2ChromeProps) {
  const v2 = useUiV2()
  const gradId = useId().replace(/:/g, '')
  if (!v2) return null

  const delta = halfWindowDeltaPct(monthlySettled)
  const chartData = monthlySettled.map((net, i) => ({
    label: monthKeys[i] ? shortMonthFromKey(monthKeys[i]!) : `M${i + 1}`,
    net,
  }))

  return (
    <div
      data-testid="provider-earnings-v2-chrome"
      className="flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-1 sm:min-w-0 sm:flex-1">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <Wallet size={14} className="text-[var(--color-pv-primary)]" aria-hidden />
          Provider · Settled revenue
        </div>
        <p className="text-[14px] font-bold text-[var(--color-pv-ink)]">Six-month trend (India calendar months)</p>
        <p className="text-[12px] font-medium text-slate-500">
          Total settled · ₹{totalSettledInr.toLocaleString('en-IN')} (integer rupees)
        </p>
      </div>
      <div className="flex w-full flex-wrap items-end justify-end gap-3 sm:w-auto sm:min-w-[220px]">
        <div
          className="h-[100px] w-full min-w-[200px] sm:w-[240px]"
          role="img"
          aria-label="Monthly settled net trend"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RECHARTS_PRIMARY} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={RECHARTS_FILL} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Settled']}
                labelFormatter={(label) => String(label)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke={RECHARTS_PRIMARY}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={{ r: 3, fill: '#fff', stroke: RECHARTS_PRIMARY, strokeWidth: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <TrendDelta value={delta} />
        <Badge role="provider" variant="outline" tone={1}>
          Weekly payout · Thu
        </Badge>
      </div>
    </div>
  )
}
