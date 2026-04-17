'use client'

import Link from 'next/link'
import {
  ArrowRight,
  IndianRupee,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { useUiV2 } from '@/hooks/useUiV2'

export interface AdminPulseRailProps {
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
  gmvMtd: number
  providersTrend?: readonly number[]
  approvalsTrend?: readonly number[]
  patientsTrend?: readonly number[]
  gmvTrend?: readonly number[]
  reviewHref?: string
  className?: string
}

const DEFAULT_PROVIDERS_TREND: readonly number[] = [12, 14, 15, 17, 19, 22, 24]
const DEFAULT_APPROVALS_TREND: readonly number[] = [6, 9, 7, 11, 8, 10, 12]
const DEFAULT_PATIENTS_TREND: readonly number[] = [180, 220, 240, 280, 310, 360, 420]
const DEFAULT_GMV_TREND: readonly number[] = [42, 55, 61, 73, 78, 92, 104]

function formatCompactInr(amount: number): string {
  if (amount >= 100_000) return `₹${Math.trunc(amount / 100_000)}L`
  if (amount >= 1_000) return `₹${Math.trunc(amount / 1_000)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

function computeDelta(values: readonly number[]): number | undefined {
  if (values.length < 2) return undefined
  const first = values[0]
  const last = values[values.length - 1]
  if (!first) return undefined
  return Math.round(((last - first) / first) * 100)
}

interface KpiPillProps {
  icon: LucideIcon
  label: string
  value: string
  values: readonly number[]
  trailing?: React.ReactNode
  inverseDelta?: boolean
}

function KpiPill({ icon: Icon, label, value, values, trailing, inverseDelta = false }: KpiPillProps) {
  const delta = computeDelta(values)
  return (
    <div
      className="flex items-center gap-3 rounded-[var(--sq-lg)] border border-[var(--color-ad-border-soft)] bg-white p-3 sm:p-4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--sq-sm)] bg-[var(--color-ad-tile-1-bg)] text-[var(--color-ad-tile-1-fg)]">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="truncate">{label}</span>
          {trailing}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-[18px] font-bold tabular-nums text-[var(--color-ad-ink)]">{value}</span>
          {typeof delta === 'number' ? <TrendDelta value={delta} inverse={inverseDelta} /> : null}
        </div>
      </div>
      <Sparkline
        role="admin"
        values={values}
        width={72}
        height={24}
        ariaLabel={`${label} trend`}
        className="hidden sm:block"
      />
    </div>
  )
}

interface PulseHeaderProps {
  reviewHref: string
}

function AdminPulseHeader({ reviewHref }: PulseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-ad-muted)]">
          Ops pulse · Last 7 days
        </div>
        <div className="mt-1 text-[15px] font-semibold text-[var(--color-ad-ink)]">
          Platform health at a glance
        </div>
      </div>
      <Link
        href={reviewHref}
        className="group inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--color-ad-primary)] px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-85 md:self-auto"
        aria-label="Open verification queue"
      >
        Review queue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

interface KpiGridProps {
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
  gmvMtd: number
  providersTrend: readonly number[]
  approvalsTrend: readonly number[]
  patientsTrend: readonly number[]
  gmvTrend: readonly number[]
}

function AdminPulseKpiGrid({
  activeProviders,
  pendingApprovals,
  totalPatients,
  gmvMtd,
  providersTrend,
  approvalsTrend,
  patientsTrend,
  gmvTrend,
}: KpiGridProps) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiPill
        icon={Users}
        label="Active providers"
        value={activeProviders.toLocaleString('en-IN')}
        values={providersTrend}
      />
      <KpiPill
        icon={ShieldCheck}
        label="Pending approvals"
        value={pendingApprovals.toLocaleString('en-IN')}
        values={approvalsTrend}
        inverseDelta
        trailing={
          pendingApprovals > 0 ? (
            <Badge role="admin" variant="warning">
              Action
            </Badge>
          ) : null
        }
      />
      <KpiPill
        icon={User}
        label="Total patients"
        value={totalPatients.toLocaleString('en-IN')}
        values={patientsTrend}
      />
      <KpiPill
        icon={IndianRupee}
        label="Completed GMV"
        value={formatCompactInr(gmvMtd)}
        values={gmvTrend}
      />
    </div>
  )
}

export function AdminPulseRail({
  activeProviders,
  pendingApprovals,
  totalPatients,
  gmvMtd,
  providersTrend = DEFAULT_PROVIDERS_TREND,
  approvalsTrend = DEFAULT_APPROVALS_TREND,
  patientsTrend = DEFAULT_PATIENTS_TREND,
  gmvTrend = DEFAULT_GMV_TREND,
  reviewHref = '/admin/listings',
  className,
}: AdminPulseRailProps) {
  const uiV2 = useUiV2()

  if (!uiV2) return null

  return (
    <aside
      className={`rounded-[var(--sq-lg)] border border-[var(--color-ad-border)] bg-[var(--color-ad-surface)] p-4 sm:p-5 ${className ?? ''}`}
      data-testid="admin-pulse-rail"
      aria-label="Platform ops pulse"
    >
      <AdminPulseHeader reviewHref={reviewHref} />
      <AdminPulseKpiGrid
        activeProviders={activeProviders}
        pendingApprovals={pendingApprovals}
        totalPatients={totalPatients}
        gmvMtd={gmvMtd}
        providersTrend={providersTrend}
        approvalsTrend={approvalsTrend}
        patientsTrend={patientsTrend}
        gmvTrend={gmvTrend}
      />
    </aside>
  )
}
