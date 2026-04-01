'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, BarChart3, MapPin, ChevronDown, ArrowUpRight, DollarSign, Calendar, Activity, Download, Loader2 } from 'lucide-react'
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

function buildChartPath(data: { revenue: number }[], width = 1000, height = 350, pad = 25): { line: string; area: string } {
  if (data.length < 2) return { line: '', area: '' }
  const max = Math.max(...data.map(d => d.revenue), 1)
  const xs = data.map((_, i) => (i / (data.length - 1)) * width)
  const ys = data.map(d => pad + (1 - d.revenue / max) * (height - pad * 2))
  const pairs = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' L')
  return {
    line: `M${pairs}`,
    area: `M${pairs} L${width},${height} L0,${height} Z`,
  }
}

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
        { label: 'Total Volume',    value: data.kpis.totalGmvFormatted,                             icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Active Patients', value: data.kpis.activePatients.toLocaleString('en-IN'),         icon: Users,      color: 'text-blue-600',    bg: 'bg-blue-50'    },
        { label: 'Completion Rate', value: `${data.kpis.completionRate}%`,                           icon: Activity,   color: 'text-[#00766C]',   bg: 'bg-[#E6F4F3]'  },
        { label: 'Total Providers', value: data.kpis.totalProviders.toLocaleString('en-IN'),         icon: TrendingUp, color: 'text-orange-600',   bg: 'bg-orange-50'  },
      ]
    : []

  const fallbackLine = 'M0,300 L167,220 L333,260 L500,140 L667,180 L833,80 L1000,110'
  const fallbackArea = 'M0,300 L167,220 L333,260 L500,140 L667,180 L833,80 L1000,110 L1000,350 L0,350 Z'
  const { line: chartLine, area: chartArea } = data?.monthlyRevenue
    ? buildChartPath(data.monthlyRevenue)
    : { line: fallbackLine, area: fallbackArea }

  const xLabels = data?.monthlyRevenue.map(d => d.label) ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00766C] flex items-center justify-center text-white">
              <BarChart3 size={18} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Business Intelligence</span>
          </div>
          <h1 className="text-[36px] font-black text-[#333333] tracking-tighter leading-none">Platform Analytics</h1>
          <p className="text-[15px] font-medium text-[#666666]">Real-time performance metrics and growth insights.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-[14px]">
            <button className="px-4 py-2 text-[13px] font-black text-[#00766C] bg-white rounded-[10px] shadow-sm">Real-time</button>
            <button className="px-4 py-2 text-[13px] font-black text-gray-400 hover:text-gray-600 transition-colors">Historical</button>
          </div>
          <div className="h-10 w-px bg-gray-200 mx-2" />
          <button className="p-3 rounded-[14px] border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all active:scale-95">
            <Download size={18} />
          </button>
          <div className="relative">
            <select className="appearance-none pl-11 pr-10 py-3 rounded-[14px] border border-gray-200 bg-white text-[14px] font-bold text-[#333333] cursor-pointer outline-none focus:border-[#00766C] focus:ring-4 focus:ring-[#00766C]/5 transition-all">
              <option>Last 7 Months</option>
              <option>This Quarter</option>
            </select>
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-7 rounded-[28px] border border-gray-100 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((stat) => (
            <div key={stat.label} className="bg-white p-7 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00766C]/10 transition-all duration-500 group">
              <div className="flex items-center justify-between mb-5">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3', stat.bg, stat.color)}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-[12px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  Live
                </div>
              </div>
              <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-[32px] font-black text-[#333333] tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Revenue Pulse */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-[20px] font-black text-[#333333] tracking-tight">Revenue Pulse</h2>
              <p className="text-[13px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Platform Earnings (Monthly)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00766C]" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Actual</span>
              </div>
              {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
            </div>
          </div>

          <div className="flex-1 relative mt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 350" preserveAspectRatio="none">
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 100 + 25} x2="1000" y2={i * 100 + 25} stroke="#F3F4F6" strokeWidth="2" strokeDasharray="8 8" />
              ))}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00766C" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {chartArea && <path d={chartArea} fill="url(#chartGradient)" opacity="0.1" />}
              {chartLine && <path d={chartLine} fill="none" stroke="#00766C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
            <div className="flex justify-between mt-8">
              {xLabels.map(m => (
                <span key={m} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Acquisition Mix */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 flex flex-col">
          <h2 className="text-[20px] font-black text-[#333333] tracking-tight mb-8">Acquisition Mix</h2>
          <div className="flex-1 space-y-8">
            {[
              { name: 'Organic Search', value: 65, color: 'bg-[#00766C]' },
              { name: 'Direct Traffic', value: 42, color: 'bg-emerald-400' },
              { name: 'Social Media', value: 28, color: 'bg-orange-400' },
              { name: 'Partner Refs', value: 15, color: 'bg-blue-400' },
            ].map(channel => (
              <div key={channel.name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-black text-[#333333] tracking-tight uppercase">{channel.name}</span>
                  <span className="text-[13px] font-black text-[#00766C]">{channel.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <div className={cn('h-full transition-all duration-1000', channel.color)} style={{ width: `${channel.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-8 bg-gray-50 hover:bg-gray-100 text-[#333333] text-[13px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            View Full Report <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Geographic Insights ── */}
      <div className="bg-[#333333] rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-full bg-[#00766C] opacity-10 translate-x-1/2 rounded-full blur-[120px]" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-emerald-400 mb-6">
              <MapPin size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Regional Density</span>
            </div>
            <h2 className="text-[32px] md:text-[40px] font-black tracking-tight leading-tight mb-6">
              Bookings Heatmap:<br /><span className="text-emerald-400">NCR is Leading.</span>
            </h2>
            <p className="text-[16px] text-gray-400 font-medium mb-10 max-w-[450px] leading-relaxed">
              New Delhi and Gurgaon account for 42% of total platform volume this quarter. Expansion into Mumbai showing 4x MOM growth.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[{ pct: '28%', city: 'New Delhi' }, { pct: '14%', city: 'Gurgaon' }, { pct: '12%', city: 'Mumbai' }].map(({ pct, city }) => (
                <div key={city} className="space-y-1">
                  <p className="text-[24px] font-black tracking-tight">{pct}</p>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{city}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] aspect-video flex items-center justify-center relative">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-bounce" strokeWidth={2.5} />
              <p className="text-[14px] font-black tracking-widest uppercase">Interactive Map</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">Mapbox Integration (Phase 11.4)</p>
            </div>
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#00766C] rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </div>
  )
}
