'use client'

import { useId } from 'react'
import { FileText, CheckCircle2, ClipboardList } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { RECHARTS_FILL, RECHARTS_PRIMARY } from '@/components/dashboard/charts/recharts-theme'
import type { PatientFacingRecord } from '@/lib/clinical/types'
import {
  buildVisitSparkline,
  buildVisitSparklineMonthLabels,
  groupRecordsByProvider,
  summaryCompletionCount,
  planCount,
  formatRecordDate,
  truncate,
} from './records-utils'

export interface PatientRecordsSummaryV2Props {
  records: PatientFacingRecord[]
}

const SUMMARY_TRUNCATE = 160
const PLAN_TRUNCATE = 120

/**
 * v2 records summary surface.
 *
 * Self-gates behind `useUiV2()` — returns `null` in v1 so the existing
 * visit-history SectionCard renders byte-identically. In v2 it replaces
 * the history section with:
 *   1. A visit-frequency Sparkline card (monthly counts, last 6 months)
 *   2. Provider-grouped summary tiles — each tile shows visit count,
 *      latest summary excerpt, and a "Plan" badge when a care plan exists.
 */
export function PatientRecordsSummaryV2({ records }: PatientRecordsSummaryV2Props) {
  const v2 = useUiV2()
  const visitGradId = useId().replace(/:/g, '')
  if (!v2) return null
  if (records.length === 0) return null

  const sparklineValues = buildVisitSparkline(records)
  const monthLabels = buildVisitSparklineMonthLabels(6)
  const visitTrendData = sparklineValues.map((count, i) => ({
    label: monthLabels[i] ?? `M${i + 1}`,
    visits: count,
  }))
  const providerGroups = groupRecordsByProvider(records)
  const summaryCount = summaryCompletionCount(records)
  const plans = planCount(records)

  return (
    <div
      data-testid="patient-records-summary-v2"
      data-ui-version="v2"
      className="flex flex-col gap-6"
    >
      {/* ── Frequency sparkline card ─────────────────────────────────────── */}
      <div className="rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pt-muted)]">
              Visit frequency
            </p>
            <p className="mt-0.5 text-[22px] font-bold tabular-nums text-[var(--color-pt-ink)]">
              {records.length}
            </p>
            <p className="text-[12px] font-medium text-[var(--color-pt-muted)]">
              total visits · last 6 months
            </p>
          </div>
          <div
            className="h-[72px] w-[140px] shrink-0"
            role="img"
            aria-label="Visit frequency over the last 6 months"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitTrendData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={visitGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={RECHARTS_PRIMARY} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={RECHARTS_FILL} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: 'var(--color-pt-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide allowDecimals={false} domain={[0, 'auto']} />
                <Tooltip
                  formatter={(value: number) => [value, 'Visits']}
                  labelFormatter={(label) => String(label)}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke={RECHARTS_PRIMARY}
                  strokeWidth={2}
                  fill={`url(#${visitGradId})`}
                  dot={{ r: 2, fill: '#fff', stroke: RECHARTS_PRIMARY, strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini stat row */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-pt-border-soft)] pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={14}
              className="shrink-0 text-[var(--color-pt-primary)]"
              aria-hidden
            />
            <span className="text-[12px] font-medium text-[var(--color-pt-muted)]">
              <span
                data-testid="summary-count"
                className="font-bold text-[var(--color-pt-ink)]"
              >
                {summaryCount}
              </span>
              {' '}
              {summaryCount === 1 ? 'summary' : 'summaries'} shared
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList
              size={14}
              className="shrink-0 text-[var(--color-pt-primary)]"
              aria-hidden
            />
            <span className="text-[12px] font-medium text-[var(--color-pt-muted)]">
              <span
                data-testid="plan-count"
                className="font-bold text-[var(--color-pt-ink)]"
              >
                {plans}
              </span>
              {' '}
              care {plans === 1 ? 'plan' : 'plans'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Provider-grouped summary tiles ────────────────────────────────── */}
      <ol
        data-testid="provider-groups"
        aria-label="Visit history grouped by care provider"
        className="flex flex-col gap-4"
      >
        {providerGroups.map((group) => (
          <li key={group.providerName} className="flex flex-col gap-2">
            {/* Provider header */}
            <div className="flex items-center gap-3 px-1">
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-pt-primary)]"
              />
              <span className="text-[13px] font-bold tracking-tight text-[var(--color-pt-ink)]">
                {group.providerName.startsWith('Dr.')
                  ? group.providerName
                  : `Dr. ${group.providerName}`}
              </span>
              <Badge role="patient" variant="soft" tone={2}>
                {group.visits.length} {group.visits.length === 1 ? 'visit' : 'visits'}
              </Badge>
            </div>

            {/* Visit tiles */}
            <div className="flex flex-col divide-y divide-[var(--color-pt-border-soft)] overflow-hidden rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white">
              {group.visits.map((record) => (
                <article
                  key={record.visit_id}
                  data-testid="record-tile"
                  data-visit-id={record.visit_id}
                  className="px-4 py-4"
                >
                  {/* Title row */}
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-pt-tile-1-bg)] text-[var(--color-pt-primary)]"
                    >
                      <FileText size={13} strokeWidth={2.3} />
                    </div>
                    <span className="text-[13px] font-bold text-[var(--color-pt-ink)]">
                      Visit {record.visit_number}
                    </span>
                    <span className="text-[12px] font-medium text-[var(--color-pt-muted)]">
                      ·
                    </span>
                    <span className="text-[12px] font-medium text-[var(--color-pt-muted)]">
                      {formatRecordDate(record.visit_date)}
                    </span>
                    {record.plan && (
                      <Badge role="patient" variant="success" className="ml-auto">
                        Plan
                      </Badge>
                    )}
                  </div>

                  {/* Summary excerpt */}
                  {record.patient_summary ? (
                    <p className="mt-2.5 pl-9 text-[13px] leading-relaxed text-slate-600">
                      {truncate(record.patient_summary, SUMMARY_TRUNCATE)}
                    </p>
                  ) : (
                    <p className="mt-2.5 pl-9 text-[12px] italic text-[var(--color-pt-muted)]">
                      No summary shared for this visit yet.
                    </p>
                  )}

                  {/* Plan excerpt */}
                  {record.plan && (
                    <div className="mt-3 pl-9">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-pt-muted)]">
                        What&apos;s next
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                        {truncate(record.plan, PLAN_TRUNCATE)}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
