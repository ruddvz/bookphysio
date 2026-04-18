'use client'

import { useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, BarChart3, MapPin, ChevronDown, DollarSign, Activity, Download, Loader2, Filter, Share2 } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useUiV2 } from '@/hooks/useUiV2'
import { AdminPulseRail } from '@/components/admin/AdminPulseRail'
import { RECHARTS_BAR_FILL, RECHARTS_FILL, RECHARTS_PRIMARY } from '@/components/dashboard/charts/recharts-theme'

interface AnalyticsData {
  kpis: {
    totalGmv: number
    totalGmvFormatted: string
    activePatients: number
    completionRate: number
    totalProviders: number
    totalAppointments: number
  }
  monthlyRevenue: { label: string; revenue: number }[]
  monthlyAppointments: { label: string; count: number }[]
}

export default function AdminAnalytics() {
  const revenueGradId = useId().replace(/:/g, '')
  const uiV2 = useUiV2()
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
    staleTime: 60000,
  })

  const kpis = data
    ? [
        { label: 'Total Volume',    value: data.kpis.totalGmvFormatted,                             icon: DollarSign, color: 'text-[var(--color-ad-ink)]',           bg: 'bg-[var(--color-ad-tile-1-bg)]' },
        { label: 'Active Patients', value: data.kpis.activePatients.toLocaleString('en-IN'),         icon: Users,      color: 'text-[var(--color-ad-ink)]',           bg: 'bg-[var(--color-ad-tile-2-bg)]' },
        { label: 'Completion Rate', value: `${data.kpis.completionRate}%`,                           icon: Activity,   color: 'text-[var(--color-ad-ink)]',           bg: 'bg-[var(--color-ad-tile-5-bg)]' },
        { label: 'Total Providers', value: data.kpis.totalProviders.toLocaleString('en-IN'),         icon: TrendingUp, color: 'text-[var(--color-ad-tile-4-fg)]',     bg: 'bg-[var(--color-ad-tile-4-bg)]' },
      ]
    : []

  const revenueSeries =
    data?.monthlyRevenue?.length
      ? data.monthlyRevenue.map((d) => ({ name: d.label, revenue: d.revenue }))
      : [
          { name: 'Jan', revenue: 120 },
          { name: 'Feb', revenue: 180 },
          { name: 'Mar', revenue: 150 },
          { name: 'Apr', revenue: 220 },
          { name: 'May', revenue: 190 },
          { name: 'Jun', revenue: 240 },
          { name: 'Jul', revenue: 210 },
        ]

  const appointmentSeries =
    data?.monthlyAppointments?.length
      ? data.monthlyAppointments.map((d) => ({ name: d.label, appointments: d.count }))
      : revenueSeries.map((row, i) => ({
          name: row.name,
          appointments: 40 + (i % 4) * 12,
        }))

  return (
    <div className="flex flex-col gap-8 pb-16 px-6 py-6 max-w-6xl mx-auto">

      {uiV2 ? (
        <AdminPulseRail
          activeProviders={data?.kpis.totalProviders ?? 0}
          pendingApprovals={0}
          totalPatients={data?.kpis.activePatients ?? 0}
          gmvMtd={data?.kpis.totalGmv ?? 0}
          reviewHref="/admin/listings"
        />
      ) : null}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ad-border)] bg-[var(--color-ad-tile-1-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-ad-ink)]">
              <BarChart3 size={12} />
              Analytics
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-600">Live</span>
            </div>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 tracking-tight">
            Analytics
          </h1>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Platform growth, revenue distribution, and provider efficiency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[var(--sq-sm)]">
            <button type="button" className="px-4 py-2 text-[13px] font-semibold text-[var(--color-ad-primary)] bg-white rounded-[var(--sq-xs)] shadow-sm">Real-time</button>
            <button type="button" className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-[var(--sq-xs)]">Historical</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" title="Filter" aria-label="Filter" className="p-2.5 rounded-[var(--sq-sm)] border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md transition-all">
              <Filter size={16} />
            </button>
            <button type="button" title="Download" aria-label="Download" className="p-2.5 rounded-[var(--sq-sm)] border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md transition-all">
              <Download size={16} />
            </button>
            <button type="button" title="Share" aria-label="Share" className="p-2.5 rounded-[var(--sq-sm)] bg-[var(--color-ad-primary)] text-white hover:bg-[var(--color-ad-primary-hover)] transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-[var(--sq-lg)] border border-slate-200 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-[var(--sq-lg)] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-10 h-10 rounded-[var(--sq-sm)] flex items-center justify-center', stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-[28px] font-bold text-slate-900 tracking-tight leading-none">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue Pulse */}
        <div className="xl:col-span-2 bg-white rounded-[var(--sq-lg)] border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Revenue Pulse</h2>
              </div>
              <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Monthly Revenue in INR</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-ad-primary)]" />
                  <span className="text-[11px] font-medium text-slate-400">Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="text-[11px] font-medium text-slate-400">Target</span>
                </div>
              </div>
              {isLoading && <Loader2 size={16} className="animate-spin text-slate-400" />}
              <div className="relative">
                <select aria-label="Time period" className="appearance-none pl-3 pr-8 py-2 rounded-[var(--sq-xs)] border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-700 cursor-pointer outline-none hover:bg-white transition-all">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex-1 relative mt-2 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={revenueGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={RECHARTS_PRIMARY} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={RECHARTS_FILL} stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={RECHARTS_PRIMARY}
                  strokeWidth={2.5}
                  fill={`url(#${revenueGradId})`}
                  dot={{ r: 4, fill: '#fff', stroke: RECHARTS_PRIMARY, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly appointments */}
        <div className="bg-white rounded-[var(--sq-lg)] border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col min-h-[480px]">
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">Appointments</h2>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-6">By month</p>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value, 'Appointments']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="appointments" fill={RECHARTS_BAR_FILL} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geographic Insights */}
      <div className="bg-slate-900 rounded-[var(--sq-lg)] p-8 md:p-10 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-[var(--sq-xs)] border border-white/10 text-emerald-400 mb-6">
              <MapPin size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Regional Density</span>
            </div>
            <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight leading-tight mb-4">
              Geographic Performance
            </h2>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-8 max-w-lg">
              Platform load distribution across India&apos;s urban corridors. Home-visit demand surging in Tier-1 cities.
            </p>
            <p className="text-[14px] text-slate-400">
              Geographic insights will populate as providers join across cities.
            </p>
          </div>

          <div className="hidden lg:flex justify-center relative">
            <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <div className="absolute inset-8 rounded-full border border-dashed border-white/15" />
              <div className="absolute inset-16 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-500/25 blur-2xl" />
                <MapPin
                  size={40}
                  className="relative text-blue-400 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
