'use client'

import { useMemo, useState } from 'react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import {
  groupEarningsByMonth,
  buildEarningsSparkline,
  pctChange,
  formatInrPv,
  type EarningsTransaction,
} from './earnings-v2-utils'

export interface ProviderEarningsV2Props {
  transactions: EarningsTransaction[]
  nowMs?: number
}

/**
 * v2 KPI strip + month-grouped ledger — self-gates via `useUiV2()`.
 */
export function ProviderEarningsV2({ transactions, nowMs }: ProviderEarningsV2Props) {
  const v2 = useUiV2()
  const [fallbackNow] = useState(() => Date.now())
  const resolvedNow = nowMs ?? fallbackNow

  const paid = useMemo(() => transactions.filter((t) => t.status === 'paid'), [transactions])

  const months = useMemo(() => groupEarningsByMonth(transactions), [transactions])

  const gross = useMemo(() => paid.reduce((s, t) => s + t.amount, 0), [paid])
  const gstTotal = useMemo(() => paid.reduce((s, t) => s + t.gst, 0), [paid])
  const netTotal = useMemo(() => paid.reduce((s, t) => s + t.net, 0), [paid])

  const sparklineValues = useMemo(
    () => buildEarningsSparkline(transactions, resolvedNow),
    [transactions, resolvedNow],
  )

  if (!v2) return null

  const istNow = new Date(resolvedNow + 5.5 * 60 * 60 * 1000)
  const currentKey = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth() - 1, 1))
  const previousKey = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`

  const currentGross = months.find((m) => m.key === currentKey)?.totalGross ?? 0
  const previousGross = months.find((m) => m.key === previousKey)?.totalGross ?? 0
  const grossDelta = pctChange(currentGross, previousGross)

  const monthLabel = new Date(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    1,
  ).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div
      data-ui-version="v2"
      data-testid="provider-earnings-v2"
      className="mb-8 space-y-6"
      aria-label="Earnings overview"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-pv-primary)]">
            FINANCIALS
          </p>
          <h2 className="text-[24px] font-bold tracking-tight text-[var(--color-pv-ink)]">
            Earnings Overview
          </h2>
        </div>
        <Badge role="provider" variant="soft" tone={1} aria-label="Current statement month">
          {monthLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          data-testid="kpi-gross"
          className="rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-muted)]">
            Gross Revenue
          </p>
          <p className="mt-2 text-[22px] font-bold tabular-nums text-[var(--color-pv-ink)]">
            {formatInrPv(gross)}
          </p>
          {grossDelta != null ? (
            <div className="mt-2">
              <TrendDelta value={grossDelta} />
            </div>
          ) : (
            <p className="mt-2 text-[12px] font-bold text-[var(--color-pv-muted)]">No prior month</p>
          )}
        </div>

        <div
          data-testid="kpi-gst"
          className="rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-muted)]">
            GST Collected
          </p>
          <p className="mt-2 text-[22px] font-bold tabular-nums text-[var(--color-pv-ink)]">
            {formatInrPv(gstTotal)}
          </p>
          <div className="mt-2">
            <Badge role="provider" variant="soft" tone={1}>
              18%
            </Badge>
          </div>
        </div>

        <div
          data-testid="kpi-net"
          className="rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-muted)]">
            Net Payout
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-[22px] font-bold tabular-nums text-[var(--color-pv-ink)]">
              {formatInrPv(netTotal)}
            </p>
            <Sparkline
              role="provider"
              values={sparklineValues}
              width={64}
              height={24}
              ariaLabel="Six month net payout trend"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {months.map((m) => (
          <div key={m.key} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-bold text-[var(--color-pv-ink)]">{m.label}</span>
              <span className="text-[12px] font-bold tabular-nums text-[var(--color-pv-muted)]">
                {formatInrPv(m.totalNet)} net
              </span>
            </div>
            <div className="flex flex-col divide-y divide-[var(--color-pv-border-soft)] overflow-hidden rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-white">
              {m.items.map((t) => (
                <article
                  key={t.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[14px] font-bold text-[var(--color-pv-ink)]">{t.patient}</p>
                    <p className="text-[12px] text-[var(--color-pv-muted)]">{t.date}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[14px] font-bold tabular-nums">{formatInrPv(t.amount)}</span>
                    <span className="text-[14px] font-bold tabular-nums text-[var(--color-pv-primary)]">
                      {formatInrPv(t.net)}
                    </span>
                    <Badge
                      role="provider"
                      variant={t.status === 'paid' ? 'success' : 'warning'}
                    >
                      {t.status}
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
