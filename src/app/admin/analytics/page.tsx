'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, BarChart3, MapPin, ChevronDown, ArrowUpRight, DollarSign, Calendar, Activity, Download, Loader2, Filter, Share2, Info } from 'lucide-react'
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
        { label: 'Total Volume',    value: data.kpis.totalGmvFormatted,                             icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
        { label: 'Active Patients', value: data.kpis.activePatients.toLocaleString('en-IN'),         icon: Users,      color: 'text-blue-600',    bg: 'bg-blue-50',    trend: '+8.2%'  },
        { label: 'Completion Rate', value: `${data.kpis.completionRate}%`,                           icon: Activity,   color: 'text-[#00766C]',   bg: 'bg-[#E6F4F3]',  trend: '+2.4%'  },
        { label: 'Total Providers', value: data.kpis.totalProviders.toLocaleString('en-IN'),         icon: TrendingUp, color: 'text-orange-600',   bg: 'bg-orange-50',  trend: '+5.1%'  },
      ]
    : []

  const fallbackLine = 'M0,300 L167,220 L333,260 L500,140 L667,180 L833,80 L1000,110'
  const fallbackArea = 'M0,300 L167,220 L333,260 L500,140 L667,180 L833,80 L1000,110 L1000,350 L0,350 Z'
  const { line: chartLine, area: chartArea, dots: chartDots } = data?.monthlyRevenue
    ? buildChartPath(data.monthlyRevenue)
    : { line: fallbackLine, area: fallbackArea, dots: [] }

  const xLabels = data?.monthlyRevenue.map(d => d.label) ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00766C] flex items-center justify-center text-white shadow-xl shadow-[#00766C]/20 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
              <BarChart3 size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00766C]">Intelligence Hub</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-600">Syncing live data</span>
              </div>
            </div>
          </div>
          <h1 className="text-[42px] lg:text-[48px] font-black text-[#333333] tracking-tighter leading-none">
            Business <span className="text-[#00766C]">Analytics</span>
          </h1>
          <p className="text-[16px] font-medium text-[#666666] max-w-xl">
            Decision-support dashboard for platform growth, revenue distribution, and provider efficiency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-[18px]">
            <button className="px-5 py-2.5 text-[13px] font-black text-[#00766C] bg-white rounded-[14px] shadow-sm transform active:scale-95 transition-all">Real-time</button>
            <button className="px-5 py-2.5 text-[13px] font-black text-gray-500 hover:text-[#333333] transition-colors rounded-[14px]">Historical</button>
          </div>
          <div className="h-12 w-px bg-gray-200 mx-2 hidden sm:block" />
          <div className="flex items-center gap-2">
            <button className="p-3.5 rounded-[18px] border border-gray-200 text-[#333333] hover:bg-white hover:shadow-lg transition-all active:scale-95">
              <Filter size={18} />
            </button>
            <button className="p-3.5 rounded-[18px] border border-gray-200 text-[#333333] hover:bg-white hover:shadow-lg transition-all active:scale-95">
              <Download size={18} />
            </button>
            <button className="p-3.5 rounded-[18px] bg-[#333333] text-white hover:bg-black hover:shadow-xl transition-all active:scale-95">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpis.map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[#00766C]/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} strokeWidth={1} />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-current/10', stat.bg, stat.color)}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[13px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <ArrowUpRight size={14} strokeWidth={3} />
                    {stat.trend}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">vs last month</span>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  {stat.label}
                  <Info size={12} className="cursor-help" />
                </p>
                <p className="text-[36px] font-black text-[#333333] tracking-tighter leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Revenue Pulse */}
        <div className="xl:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 min-h-[520px] flex flex-col group/chart">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[24px] font-black text-[#333333] tracking-tight">Revenue Pulse</h2>
                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-widest">+18% MoM</div>
              </div>
              <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Platform Earnings (Monthly Revenue in ₹)</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#00766C]" />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300" />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Target</span>
                </div>
              </div>
              {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
              <div className="relative">
                <select className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-[12px] font-black text-[#333333] cursor-pointer outline-none hover:bg-gray-100 transition-all uppercase tracking-widest">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333333] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex-1 relative mt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 350" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00766C" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00766C" stopOpacity="0" />
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
                <line key={i} x1="0" y1={i * 100 + 25} x2="1000" y2={i * 100 + 25} stroke="#F9FAFB" strokeWidth="2" />
              ))}

              {/* Area & Line */}
              {chartArea && <path d={chartArea} fill="url(#chartGradient)" className="transition-all duration-1000" />}
              {chartLine && (
                <path 
                  d={chartLine} 
                  fill="none" 
                  stroke="#00766C" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  filter="url(#shadow)"
                  className="transition-all duration-1000 drop-shadow-2xl" 
                />
              )}

              {/* Dots for emphasis */}
              {chartDots.map((dot, i) => (
                <g key={i} className="group/dot cursor-pointer">
                  <circle 
                    cx={dot.x} 
                    cy={dot.y} 
                    r="6" 
                    fill="white" 
                    stroke="#00766C" 
                    strokeWidth="3" 
                  />
                  <circle 
                    cx={dot.x} 
                    cy={dot.y} 
                    r="14" 
                    fill="#00766C" 
                    fillOpacity="0"
                    className="group-hover/dot:fill-opacity-10 transition-all duration-300"
                  />
                </g>
              ))}
            </svg>
            <div className="flex justify-between mt-12 border-t border-gray-50 pt-6">
              {xLabels.map(m => (
                <span key={m} className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Acquisition Mix */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 flex flex-col group">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[22px] font-black text-[#333333] tracking-tight">Acquisition</h2>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#333333] transition-colors cursor-pointer">
              <Info size={14} />
            </div>
          </div>
          <div className="flex-1 space-y-10">
            {[
              { name: 'Organic Search', value: 65, color: 'bg-[#00766C]', change: '+12%' },
              { name: 'Direct Traffic', value: 42, color: 'bg-emerald-400', change: '+5%' },
              { name: 'Social Media', value: 28, color: 'bg-orange-400', change: '-2%' },
              { name: 'Partner Refs', value: 15, color: 'bg-blue-400', change: '+24%' },
            ].map(channel => (
              <div key={channel.name} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-[#333333] tracking-tight uppercase leading-none">{channel.name}</span>
                    <span className={cn("text-[10px] font-bold mt-1.5", channel.change.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>
                      {channel.change} vs avg
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[20px] font-black text-[#333333] tracking-tighter">{channel.value}</span>
                    <span className="text-[12px] font-bold text-gray-400">%</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner border border-gray-100">
                  <div 
                    className={cn('h-full rounded-full transition-all duration-1000 relative group-hover:brightness-110', channel.color)} 
                    style={{ width: `${channel.value}%` }}
                  >
                    <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-sm -skew-x-12 translate-x-12 group-hover:translate-x-[-200px] transition-transform duration-1000" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-5 mt-12 bg-[#333333] hover:bg-black text-white text-[13px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]">
            Explore Growth Channels <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Geographic Insights ── */}
      <div className="bg-[#1A1A1A] rounded-[50px] p-12 text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-[600px] h-full bg-[#00766C] opacity-10 translate-x-1/3 rounded-full blur-[150px] group-hover:opacity-20 transition-opacity duration-1000" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400 mb-8 backdrop-blur-md">
              <MapPin size={16} />
              <span className="text-[11px] font-black uppercase tracking-[0.25em]">Regional Density</span>
            </div>
            <h2 className="text-[36px] md:text-[44px] lg:text-[56px] font-black tracking-tighter leading-[0.9] mb-8">
              Geo-Spatial <br/><span className="text-[#00766C]">Performance</span>
            </h2>
            <div className="space-y-8 max-w-lg mb-12">
              <p className="text-[18px] text-gray-400 font-medium leading-relaxed">
                Platform load distribution across India's urban corridors. Visualizing the surge in home-visit demand within Tier-1 cities.
              </p>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-1 border-l-2 border-[#00766C] pl-6 font-black uppercase">
                  <span className="text-gray-500 text-[10px] tracking-widest">Top Hub</span>
                  <p className="text-[20px] tracking-tight">New Delhi</p>
                </div>
                <div className="space-y-1 border-l-2 border-emerald-500 pl-6 font-black uppercase">
                  <span className="text-gray-500 text-[10px] tracking-widest">Max Growth</span>
                  <p className="text-[20px] tracking-tight">+42% Pune</p>
                </div>
              </div>
            </div>
            <button className="px-10 py-5 bg-[#00766C] hover:bg-[#008F83] text-white text-[14px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-[#00766C]/20 hover:-translate-y-1 active:scale-95">
              Launch Global Map <MapPin size={18} />
            </button>
          </div>
          
          <div className="hidden lg:flex justify-center relative">
            <div className="w-[450px] h-[450px] rounded-full border border-white/5 flex items-center justify-center p-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               {/* ── Mock Grid Map ── */}
               <div className="grid grid-cols-4 gap-4 w-full h-full opacity-40 group-hover:opacity-70 transition-opacity">
                 {Array.from({ length: 16 }).map((_, i) => (
                   <div 
                    key={i} 
                    className="bg-white/5 rounded-xl border border-white/10 hover:bg-emerald-500/20 transition-all cursor-crosshair"
                    style={{ opacity: 0.1 + Math.random() * 0.5 }} 
                   />
                 ))}
               </div>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-10">
                  <div className="w-16 h-16 bg-[#00766C]/30 rounded-full blur-2xl animate-pulse" />
                  <MapPin size={48} className="text-[#00766C] drop-shadow-[0_0_20px_rgba(0,118,108,0.5)]" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

