'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, BarChart3, MapPin, ChevronDown, DollarSign, Activity, Download, Loader2, Filter, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

function buildChartPath(data: { revenue: number }[], width = 1000, height = 350, pad = 25): { line: string; area: string; dots: { x: number; y: number }[] } {
  if (data.length < 2) return { line: '', area: '', dots: [] }
  const max = Math.max(...data.map(d => d.revenue), 1)
  const xs = data.map((_, i) => (i / (data.length - 1)) * width)
  const ys = data.map(d => pad + (1 - d.revenue / max) * (height - pad * 2))
  const pairs = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' L')
  const dots = xs.map((x, i) => ({ x, y: ys[i] }))
  return {
    line: `M${pairs}`,
    area: `M${pairs} L${width},${height} L0,${height} Z`,
    dots
  }
}

const GEO_GRID_CELL_OPACITIES = [
  0.14, 0.22, 0.31, 0.18,
  0.27, 0.38, 0.24, 0.45,
  0.19, 0.34, 0.28, 0.41,
  0.16, 0.29, 0.36, 0.21,
]

export default function AdminAnalytics() {
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

  const fallbackLine = 'M0,300 L167,220 L333,260 L500,140 L667,180 L833,80 L1000,110'
  const fallbackArea = 'M0,300 L167,220 L333,260 L500,140 L667,180 L833,80 L1000,110 L1000,350 L0,350 Z'
  const { line: chartLine, area: chartArea, dots: chartDots } = data?.monthlyRevenue
    ? buildChartPath(data.monthlyRevenue)
    : { line: fallbackLine, area: fallbackArea, dots: [] }

  const xLabels = data?.monthlyRevenue.map(d => d.label) ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

  return (
    <div className="flex flex-col gap-8 pb-16 px-6 py-6 max-w-6xl mx-auto">

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
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button type="button" className="px-4 py-2 text-[13px] font-semibold text-[var(--color-ad-primary)] bg-white rounded-lg shadow-sm">Real-time</button>
            <button type="button" className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg">Historical</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" title="Filter" aria-label="Filter" className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md transition-all">
              <Filter size={16} />
            </button>
            <button type="button" title="Download" aria-label="Download" className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md transition-all">
              <Download size={16} />
            </button>
            <button type="button" title="Share" aria-label="Share" className="p-2.5 rounded-xl bg-[var(--color-ad-primary)] text-white hover:bg-[var(--color-ad-primary-hover)] transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg, stat.color)}>
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
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[480px] flex flex-col">
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
                <select aria-label="Time period" className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-700 cursor-pointer outline-none hover:bg-white transition-all">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex-1 relative mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 350" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="15" />
                  <feOffset dx="0" dy="10" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 100 + 25} x2="1000" y2={i * 100 + 25} stroke="#F1F5F9" strokeWidth="1.5" />
              ))}

              {/* Area & Line */}
              {chartArea && <path d={chartArea} fill="url(#chartGradient)" className="transition-all duration-1000" />}
              {chartLine && (
                <path
                  d={chartLine}
                  fill="none"
                  stroke="#0A0A0A"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                  className="transition-all duration-1000"
                />
              )}

              {/* Dots */}
              {chartDots.map((dot, i) => (
                <g key={i} className="group/dot cursor-pointer">
                  <circle cx={dot.x} cy={dot.y} r="5" fill="white" stroke="#0A0A0A" strokeWidth="2.5" />
                  <circle cx={dot.x} cy={dot.y} r="12" fill="#0A0A0A" fillOpacity="0" className="group-hover/dot:fill-opacity-10 transition-all duration-300" />
                </g>
              ))}
            </svg>
            <div className="flex justify-between mt-8 border-t border-slate-100 pt-4">
              {xLabels.map(m => (
                <span key={m} className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Acquisition Mix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mb-6">Acquisition</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8">
              <BarChart3 size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-[14px] text-slate-500">Acquisition data will appear as traffic grows.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Insights */}
      <div className="bg-slate-900 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 text-emerald-400 mb-6">
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
            <div className="w-[360px] h-[360px] rounded-full border border-white/5 flex items-center justify-center p-8">
               <div className="grid grid-cols-4 gap-3 w-full h-full opacity-50">
                 {Array.from({ length: 16 }).map((_, i) => (
                   <div
                    key={i}
                    className="bg-white/5 rounded-lg border border-white/10 hover:bg-emerald-500/20 transition-all cursor-crosshair"
                    style={{ opacity: GEO_GRID_CELL_OPACITIES[i % GEO_GRID_CELL_OPACITIES.length] }}
                   />
                 ))}
               </div>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-full blur-2xl animate-pulse" />
                  <MapPin size={40} className="text-blue-400 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
