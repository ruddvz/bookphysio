'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Users, TrendingUp, BarChart3, ShieldCheck, Clock,
  ArrowRight, ArrowUpRight, CheckCircle2, ListChecks, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminStats {
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
  gmvMtd: number
}

export default function AdminDashboardHome() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const r = await fetch('/api/admin/stats')
      if (!r.ok) throw new Error('admin-stats')
      return r.json() as Promise<AdminStats>
    },
  })

  const showLive = !isLoading && !isError && stats

  const kpis = [
    {
      label: 'Active Providers',
      value: showLive ? stats.activeProviders.toLocaleString() : '—',
      icon: ShieldCheck, iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
      href: '/admin/listings',
    },
    {
      label: 'Pending Approvals',
      value: showLive ? String(stats.pendingApprovals) : '—',
      icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
      href: '/admin/listings',
      urgent: showLive && stats.pendingApprovals > 0,
    },
    {
      label: 'Total Patients',
      value: showLive ? stats.totalPatients.toLocaleString() : '—',
      icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      href: '/admin/users',
    },
    {
      label: 'GMV (Lifetime)',
      value: showLive ? `₹${(stats.gmvMtd / 100_000).toFixed(1)}L` : '—',
      icon: BarChart3, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
      href: '/admin/analytics',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
              Admin Command Center
            </span>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 tracking-tight">
            Platform Overview
          </h1>
          <p className="text-slate-500 text-[14px] mt-0.5">Real-time snapshot of the BookPhysio platform.</p>
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

      {isError && (
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
              {card.urgent ? (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              ) : (
                <ArrowUpRight size={15} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
              )}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            {isLoading ? (
              <Loader2 size={18} className="text-slate-300 animate-spin mt-2" />
            ) : (
              <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
            )}
          </Link>
        ))}
      </div>

      {/* Main 2-col */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Left: Pending approvals callout */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Verification Queue</h2>
              <p className="text-[13px] text-slate-400">Providers awaiting approval</p>
            </div>
            <Link href="/admin/listings" className="text-[13px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 group">
              Open queue
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {showLive && stats.pendingApprovals > 0 ? (
            <div className="flex items-center gap-5 p-5 rounded-xl bg-amber-50 border border-amber-100">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Clock size={22} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-[22px] font-extrabold text-amber-900 leading-none">
                  {stats.pendingApprovals} provider{stats.pendingApprovals !== 1 ? 's' : ''}
                </div>
                <div className="text-[13px] text-amber-700 mt-1">Waiting for verification review</div>
              </div>
              <Link href="/admin/listings" className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-[13px] font-semibold hover:bg-amber-700 transition-colors">
                Review now
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-emerald-900">All caught up</div>
                <div className="text-[12px] text-emerald-700">No providers pending verification</div>
              </div>
            </div>
          )}

          {/* Mini stat row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Active</div>
              <div className="text-[20px] font-bold text-slate-900">{showLive ? stats.activeProviders : '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Patients</div>
              <div className="text-[20px] font-bold text-slate-900">{showLive ? stats.totalPatients : '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">GMV</div>
              <div className="text-[20px] font-bold text-slate-900">
                {showLive ? `₹${(stats.gmvMtd / 100_000).toFixed(1)}L` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Quick nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Admin Actions</div>
            <div className="space-y-1.5">
              {[
                { label: 'Review pending providers', href: '/admin/listings', icon: ListChecks },
                { label: 'Manage users',             href: '/admin/users',    icon: Users },
                { label: 'View analytics report',    href: '/admin/analytics', icon: BarChart3 },
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
