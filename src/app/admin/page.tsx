'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  ShieldCheck,
  BarChart3,
  IndianRupee,
  User,
  ListChecks,
  Settings,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Activity,
  Loader2,
  Globe,
  ArrowRight,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  PageHeader,
  StatTile,
  SectionCard,
  EmptyState,
  DashCard,
} from '@/components/dashboard/primitives'
import { AdminPulse } from '@/components/dashboard/AdminPulse'
import { DashboardQueryError, isDashboardAccessError } from '@/lib/dashboard-query-error'

interface AdminStats {
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
  gmvMtd: number
}

interface AdminAnalytics {
  kpis: {
    totalGmv: number
    totalGmvFormatted: string
    activePatients: number
    completionRate: number
    totalProviders: number
    totalAppointments: number
  }
  monthlyRevenue: Array<{ label: string; revenue: number }>
  monthlyAppointments: Array<{ label: string; count: number }>
}

function formatCompactInr(amount: number): string {
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`
  }

  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`
  }

  return `₹${amount.toLocaleString('en-IN')}`
}

function fmtToday(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <Skeleton className="h-10 w-72 rounded-[var(--sq-sm)] bg-slate-100" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--sq-lg)] bg-slate-100" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-[var(--sq-lg)] bg-slate-100" />
    </div>
  )
}

interface AiInsights {
  summary: string
  summaryHi: string
  alerts: string[]
  alertsHi: string[]
  recommendations: string[]
  recommendationsHi: string[]
  healthScore: number
  keyMetrics: {
    appointmentTrend: string
    revenueStatus: string
    providerSupply: string
  }
  generatedAt: string
}

function AiInsightsCard() {
  const [insights, setInsights] = useState<AiInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHindi, setShowHindi] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/ai-insights', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as AiInsights
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }, [])

  const summary = showHindi ? insights?.summaryHi : insights?.summary
  const alerts = showHindi ? insights?.alertsHi : insights?.alerts
  const recommendations = showHindi ? insights?.recommendationsHi : insights?.recommendations

  const healthColor = (insights?.healthScore ?? 0) >= 70
    ? 'text-emerald-600'
    : (insights?.healthScore ?? 0) >= 40
      ? 'text-amber-600'
      : 'text-red-600'

  const healthBg = (insights?.healthScore ?? 0) >= 70
    ? 'bg-emerald-50'
    : (insights?.healthScore ?? 0) >= 40
      ? 'bg-amber-50'
      : 'bg-red-50'

  return (
    <SectionCard
      role="admin"
      title="AI Insights"
      action={
        insights
          ? { label: 'Refresh', onClick: fetchInsights }
          : undefined
      }
    >
      {!insights && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-[var(--sq-lg)] bg-[var(--color-ad-tile-3-bg)] flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-[var(--color-ad-tile-3-fg)]" />
          </div>
          <h3 className="text-[16px] font-bold text-[var(--color-ad-ink)] mb-2">
            AI-powered platform analysis
          </h3>
          <p className="text-[13px] text-slate-500 mb-6 max-w-sm mx-auto">
            Get an instant AI summary of today&apos;s appointments, revenue, provider activity, and actionable recommendations — in English and Hindi.
          </p>
          <button
            type="button"
            onClick={fetchInsights}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-ad-primary)] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles size={14} />
            Generate insights
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-[var(--color-ad-primary)]" />
          <span className="text-[13px] text-slate-500">Analyzing platform data with AI…</span>
        </div>
      )}

      {error && (
        <div className="py-6 text-center">
          <AlertTriangle size={24} className="mx-auto text-amber-500 mb-2" />
          <p className="text-[13px] text-slate-600 mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchInsights}
            className="text-[13px] font-semibold text-[var(--color-ad-primary)] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-5">
          {/* Language toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-[var(--sq-sm)] flex items-center justify-center ${healthBg}`}>
                <Activity size={18} className={healthColor} />
              </div>
              <div>
                <div className={`text-[20px] font-bold ${healthColor}`}>{insights.healthScore}/100</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Health score</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHindi(!showHindi)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--sq-xs)] border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Globe size={12} />
              {showHindi ? 'English' : 'हिन्दी'}
            </button>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Appointments', value: insights.keyMetrics.appointmentTrend, icon: '📊' },
              { label: 'Revenue', value: insights.keyMetrics.revenueStatus, icon: '💰' },
              { label: 'Supply', value: insights.keyMetrics.providerSupply, icon: '👥' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="rounded-[var(--sq-sm)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-3 text-center">
                <div className="text-[16px] mb-1">{icon}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                <div className="text-[13px] font-semibold text-[var(--color-ad-ink)] capitalize">{value}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-[var(--sq-sm)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Summary</div>
            <p className="text-[13px] text-[var(--color-ad-ink)] leading-relaxed">{summary}</p>
          </div>

          {/* Alerts */}
          {alerts && alerts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Alerts</span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[var(--sq-sm)] border border-amber-200 bg-amber-50 p-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-[12px] text-amber-800">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={13} className="text-[var(--color-ad-primary)]" />
                <span className="text-[10px] font-bold text-[var(--color-ad-primary)] uppercase tracking-widest">Recommendations</span>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[var(--sq-sm)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-ad-tile-1-bg)] flex items-center justify-center shrink-0 text-[10px] font-bold text-[var(--color-ad-primary)]">
                      {i + 1}
                    </div>
                    <span className="text-[12px] text-[var(--color-ad-ink)]">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated timestamp */}
          <div className="text-[10px] text-slate-400 text-right">
            Generated {new Date(insights.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      )}
    </SectionCard>
  )
}

export default function AdminDashboardHome() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const r = await fetch('/api/admin/stats')
      if (!r.ok) throw new DashboardQueryError('admin-stats', r.status)
      return r.json() as Promise<AdminStats>
    },
  })

  // Analytics powers the flag-gated `<AdminPulse>` card; it's best-effort
  // on top of the `admin-stats` query so a transient analytics outage
  // doesn't take the whole dashboard down — the card simply won't render.
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics-pulse'],
    queryFn: async () => {
      const r = await fetch('/api/admin/analytics')
      if (!r.ok) throw new DashboardQueryError('admin-analytics', r.status)
      return r.json() as Promise<AdminAnalytics>
    },
  })

  const hasAccessError = isDashboardAccessError(error)

  useEffect(() => {
    if (hasAccessError) {
      queryClient.removeQueries({ queryKey: ['admin-stats'], exact: true })
      queryClient.removeQueries({ queryKey: ['admin-analytics-pulse'], exact: true })
    }
  }, [hasAccessError, queryClient])

  if (isError) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        <PageHeader
          role="admin"
          kicker="PLATFORM"
          title="Platform overview"
          subtitle="Live admin stats are temporarily unavailable."
          action={{ label: 'Review approvals', href: '/admin/listings' }}
        />

        <SectionCard role="admin" title="Dashboard unavailable">
          <EmptyState
            role="admin"
            icon={ShieldCheck}
            title="We couldn't load platform metrics"
            description="Provider, patient, and GMV stats are temporarily unavailable. Please refresh in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  if (isLoading) return <DashboardSkeleton />

  const stats = data ?? {
    activeProviders: 0,
    pendingApprovals: 0,
    totalPatients: 0,
    gmvMtd: 0,
  }

  const gmvFormatted = formatCompactInr(stats.gmvMtd)
  const patientsPerProvider = stats.activeProviders > 0
    ? (stats.totalPatients / stats.activeProviders).toFixed(1)
    : '0.0'
  const gmvPerProvider = stats.activeProviders > 0
    ? formatCompactInr(Math.round(stats.gmvMtd / stats.activeProviders))
    : '₹0'
  const queueState = stats.pendingApprovals === 0
    ? 'Clear'
    : stats.pendingApprovals > 25
      ? 'Elevated'
      : 'Active'
  const statsFeedSignal = isError
    ? { label: 'Admin stats', value: 'Unavailable', tone: 'text-amber-700', dot: 'bg-amber-500' }
    : { label: 'Admin stats', value: 'Live', tone: 'text-emerald-600', dot: 'bg-emerald-500' }
  const queueSignal = queueState === 'Clear'
    ? { label: 'Review queue', value: queueState, tone: 'text-emerald-600', dot: 'bg-emerald-500' }
    : queueState === 'Elevated'
      ? { label: 'Review queue', value: queueState, tone: 'text-amber-700', dot: 'bg-amber-500' }
      : { label: 'Review queue', value: queueState, tone: 'text-slate-700', dot: 'bg-slate-500' }
  const providerSignal = stats.activeProviders > 0
    ? {
        label: 'Provider network',
        value: `${stats.activeProviders} verified`,
        tone: 'text-slate-700',
        dot: 'bg-slate-500',
      }
    : {
        label: 'Provider network',
        value: 'No verified providers',
        tone: 'text-slate-500',
        dot: 'bg-slate-400',
      }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="admin"
        kicker="PLATFORM"
        title="Platform overview"
        subtitle={stats.pendingApprovals > 0 ? `${stats.pendingApprovals} approvals are waiting for review.` : fmtToday(new Date())}
        action={{ label: 'Review approvals', href: '/admin/listings' }}
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          role="admin"
          icon={Users}
          label="Active providers"
          value={stats.activeProviders.toLocaleString('en-IN')}
          tone={1}
        />
        <StatTile
          role="admin"
          icon={ShieldCheck}
          label="Pending approvals"
          value={stats.pendingApprovals}
          tone={4}
        />
        <StatTile
          role="admin"
          icon={User}
          label="Total patients"
          value={stats.totalPatients.toLocaleString('en-IN')}
          tone={5}
        />
        <StatTile
          role="admin"
          icon={IndianRupee}
          label="Completed GMV"
          value={gmvFormatted}
          tone={3}
        />
      </div>

      {/* Main + rail */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <SectionCard
            role="admin"
            title="Verification queue"
            action={{ label: 'Open queue', href: '/admin/listings' }}
          >
            {stats.pendingApprovals > 0 ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 rounded-[var(--sq-sm)] border border-[var(--color-ad-tile-4-fg)] bg-[var(--color-ad-tile-4-bg)] p-4 sm:p-5">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-[var(--sq-lg)] bg-white text-[var(--color-ad-tile-4-fg)]">
                  <ShieldCheck size={22} />
                </div>
                <div className="flex-1">
                  <div className="text-[18px] sm:text-[22px] font-bold leading-none text-[var(--color-ad-ink)]">
                    {stats.pendingApprovals} provider
                    {stats.pendingApprovals !== 1 ? 's' : ''}
                  </div>
                  <div className="mt-1 text-[12px] sm:text-[13px] text-[var(--color-ad-tile-4-fg)]">
                    Waiting for verification review
                  </div>
                </div>
                <Link
                  href="/admin/listings"
                  className="rounded-full bg-[var(--color-ad-primary)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 w-full sm:w-auto text-center"
                >
                  Review now
                </Link>
              </div>
            ) : (
              <EmptyState
                role="admin"
                icon={CheckCircle2}
                title="Queue clear"
                description="All provider applications reviewed."
              />
            )}

            {/* Mini summary */}
            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 border-t border-[var(--color-ad-border-soft)] pt-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Active
                </div>
                <div className="text-[16px] sm:text-[20px] font-bold tabular-nums text-[var(--color-ad-ink)]">
                  {stats.activeProviders}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Patients
                </div>
                <div className="text-[16px] sm:text-[20px] font-bold tabular-nums text-[var(--color-ad-ink)]">
                  {stats.totalPatients}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Completed GMV
                </div>
                <div className="text-[16px] sm:text-[20px] font-bold tabular-nums text-[var(--color-ad-ink)] truncate">
                  {gmvFormatted}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard role="admin" title="Operations pulse">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[var(--sq-lg)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Queue state
                </div>
                <div className="mt-2 text-[22px] font-bold text-[var(--color-ad-ink)]">
                  {queueState}
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  {stats.pendingApprovals === 0 ? 'No provider backlog detected.' : 'Ops review is actively in progress.'}
                </p>
              </div>

              <div className="rounded-[var(--sq-lg)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Patients / provider
                </div>
                <div className="mt-2 text-[22px] font-bold text-[var(--color-ad-ink)]">
                  {patientsPerProvider}
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  Current platform care load distribution.
                </p>
              </div>

              <div className="rounded-[var(--sq-lg)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Completed GMV / provider
                </div>
                <div className="mt-2 text-[22px] font-bold text-[var(--color-ad-ink)]">
                  {gmvPerProvider}
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  Average completed GMV generated by each verified provider.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right rail */}
        <div className="xl:w-[340px] xl:shrink-0 space-y-6">
          {Array.isArray(analytics?.monthlyAppointments) && analytics?.kpis ? (
            <AdminPulse
              monthlyAppointments={analytics.monthlyAppointments.map((m) => m.count)}
              completionRate={analytics.kpis.completionRate}
              totalAppointments={analytics.kpis.totalAppointments}
            />
          ) : null}

          <AiInsightsCard />

          <DashCard role="admin">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Admin actions
            </div>
            <div className="space-y-1">
              {[
                {
                  label: 'Review approvals',
                  href: '/admin/listings',
                  icon: ListChecks,
                },
                {
                  label: 'Manage users',
                  href: '/admin/users',
                  icon: Users,
                },
                {
                  label: 'View analytics',
                  href: '/admin/analytics',
                  icon: BarChart3,
                },
                {
                  label: 'Platform settings',
                  href: '/admin',
                  icon: Settings,
                },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--sq-sm)] hover:bg-[var(--color-ad-border-soft)] transition-colors group"
                >
                  <Icon size={16} className="text-[var(--color-ad-primary)]" />
                  <span className="flex-1 text-[13px] font-medium text-[var(--color-ad-ink)]">
                    {label}
                  </span>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          </DashCard>

          <SectionCard role="admin" title="Data status">
            <div className="space-y-3">
              {[statsFeedSignal, queueSignal, providerSignal].map(({ label, value, tone, dot }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className={`flex items-center gap-2 font-semibold ${tone}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard role="admin" title="Platform mix">
            <div className="space-y-4 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Verified providers</span>
                <span className="font-bold text-[var(--color-ad-ink)]">{stats.activeProviders}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Pending approvals</span>
                <span className="font-bold text-[var(--color-ad-ink)]">{stats.pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Tracked patients</span>
                <span className="font-bold text-[var(--color-ad-ink)]">{stats.totalPatients.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
