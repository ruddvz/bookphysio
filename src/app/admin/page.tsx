'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Users, TrendingUp, BarChart3, ShieldCheck, Clock,
  ArrowRight, ArrowUpRight, UserPlus, CheckCircle2,
  Activity, MessageSquare, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const REVENUE_BARS = [38, 54, 44, 72, 64, 88, 76]
const WEEK_DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const queueItems = [
  {
    label: 'Provider approval',
    name: 'Dr. Arun K.',
    detail: 'IAP documents uploaded · Mumbai · Sports Physio',
    status: 'pending',
    icon: UserPlus,
  },
  {
    label: 'Support queue',
    name: 'Patient billing query',
    detail: 'Refund clarification requested through the app',
    status: 'waiting',
    icon: MessageSquare,
  },
  {
    label: 'Platform health',
    name: 'Search ranking signal',
    detail: 'Bangalore sports specialists trending above baseline',
    status: 'healthy',
    icon: Activity,
  },
]

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  waiting: 'bg-blue-50 text-blue-700 border-blue-100',
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  waiting: 'Waiting',
  healthy: 'Healthy',
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({ activeProviders: 0, pendingApprovals: 0, totalPatients: 0, gmvMtd: 0 })
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (mounted) setLoadFailed(false)
        const r = await fetch('/api/admin/stats')
        if (!r.ok) {
          throw new Error('Failed to load admin stats')
        }

        const d: typeof stats = await r.json()
        if (mounted) setStats(d)
      } catch {
        if (mounted) setLoadFailed(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [])

  const showLiveStats = !loading && !loadFailed

  const kpis = [
    { label: 'Active Providers', value: showLiveStats ? stats.activeProviders.toLocaleString() : '—', icon: ShieldCheck, iconBg: 'bg-teal-50', iconColor: 'text-teal-600', href: '/admin/listings' },
    { label: 'Pending Approvals', value: showLiveStats ? String(stats.pendingApprovals) : '—', icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', href: '/admin/listings', urgent: showLiveStats && stats.pendingApprovals > 0 },
    { label: 'Total Patients', value: showLiveStats ? stats.totalPatients.toLocaleString() : '—', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', href: '/admin/users' },
    { label: 'GMV This Month', value: showLiveStats ? `₹${(stats.gmvMtd / 100_000).toFixed(1)}L` : '—', icon: BarChart3, iconBg: 'bg-violet-50', iconColor: 'text-violet-600', href: '/admin/analytics' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider">
              Admin Command Center
            </span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-900 tracking-tight">
            Platform Overview
          </h1>
          <p className="text-slate-500 text-[15px] mt-1">Real-time snapshot of the BookPhysio platform.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/admin/listings" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-[14px] hover:bg-slate-800 transition-colors">
            Review approvals
            <ArrowRight size={14} />
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-[14px] hover:border-slate-300 transition-colors">
            Analytics
            <TrendingUp size={14} />
          </Link>
        </div>
      </div>

      {loadFailed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[14px] font-medium text-amber-900">
          Live admin stats unavailable. Dashboard chrome is visible, but KPI values could not be loaded.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              'group p-5 bg-white rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all',
              card.urgent ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              {card.urgent && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
              {!card.urgent && (
                <ArrowUpRight size={15} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
              )}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            {loading ? (
              <Loader2 size={18} className="text-slate-300 animate-spin mt-2" />
            ) : (
              <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
            )}
          </Link>
        ))}
      </div>

      {/* Main 2-col */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Platform Revenue</h2>
              <p className="text-[13px] text-slate-400">Last 7 days GMV</p>
            </div>
            <Link href="/admin/analytics" className="text-[13px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
              Full report <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-48">
            {REVENUE_BARS.map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative flex items-end" style={{ height: '160px' }}>
                  <div
                    className={cn(
                      'w-full rounded-lg transition-all duration-500',
                      i === REVENUE_BARS.length - 1
                        ? 'bg-teal-500'
                        : 'bg-slate-100 hover:bg-teal-100'
                    )}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{WEEK_DAYS[i]}</span>
              </div>
            ))}
          </div>

          {/* Summary row */}
          <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-slate-100">
            {[
              { label: 'Total sessions', value: '1,284' },
              { label: 'Avg. session fee', value: '₹850' },
              { label: 'Completion rate', value: '94.2%' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</div>
                <div className="text-[18px] font-bold text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Action queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-[15px]">Action Queue</h3>
              <Link href="/admin/listings" className="text-[12px] text-teal-600 font-semibold hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {queueItems.map(item => (
                <div key={item.name} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <item.icon size={15} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.detail}</div>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0', STATUS_STYLES[item.status])}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform health */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-[15px] mb-4">Platform Health</h3>
            <div className="space-y-4">
              {[
                { label: 'Provider verification rate', value: 98, color: 'bg-teal-500' },
                { label: 'Booking conversion',         value: 72, color: 'bg-blue-500' },
                { label: 'Session completion',          value: 94, color: 'bg-emerald-500' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="font-bold text-slate-900">{value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Admin Actions</div>
            <div className="space-y-1.5">
              {[
                { label: 'Review pending providers', href: '/admin/listings', icon: CheckCircle2 },
                { label: 'Manage users',             href: '/admin/users',    icon: Users },
                { label: 'View analytics report',   href: '/admin/analytics', icon: BarChart3 },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-[13px] font-medium text-slate-700">
                  <Icon size={15} className="text-slate-400" />
                  {label}
                  <ArrowRight size={13} className="ml-auto text-slate-200 group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}