'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, Users, Activity, MessageSquare, ArrowRight, ArrowUpRight,
  CalendarPlus, Search, FileText, ShieldCheck, TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import type { PatientFacingRecord } from '@/lib/clinical/types'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <Skeleton className="h-10 w-72 rounded-xl bg-slate-100" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl bg-slate-100" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl bg-slate-100" />
    </div>
  )
}

export default function PatientDashboardHome() {
  const { user } = useAuth()
  const first = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const { data, isLoading } = useQuery({
    queryKey: ['patient-records'],
    queryFn: async () => {
      const r = await fetch('/api/patient/records')
      if (!r.ok) throw new Error('records')
      return r.json() as Promise<{ records: PatientFacingRecord[] }>
    },
  })

  if (isLoading) return <DashboardSkeleton />

  const records = data?.records ?? []
  const recent = records.slice(0, 5)
  const uniqueProviders = new Set(records.map((r) => r.provider_name)).size
  const lastVisit = records[0] ?? null

  const stats = [
    {
      label: 'Total visits',
      value: String(records.length),
      sub: 'Across all providers',
      icon: TrendingUp, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      href: '/patient/records',
    },
    {
      label: 'Care team',
      value: String(uniqueProviders),
      sub: uniqueProviders === 1 ? 'Provider' : 'Providers',
      icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
      href: '/patient/records',
    },
    {
      label: 'Last visit',
      value: lastVisit ? fmtDate(lastVisit.visit_date).split(',')[0] : '—',
      sub: lastVisit?.provider_name ?? 'No visits yet',
      icon: Calendar, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
      href: '/patient/records',
    },
    {
      label: 'Messages',
      value: 'Chat',
      sub: 'Talk to your care team',
      icon: MessageSquare, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      href: '/patient/messages',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={11} />
              Patient
            </span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {greeting}, <span className="text-blue-600">{first}</span>
          </h1>
          <p className="text-slate-500 text-[15px] mt-1">
            {records.length > 0
              ? `You have ${records.length} visit${records.length > 1 ? 's' : ''} on record.`
              : 'Welcome — book your first session to get started.'}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/search"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-[14px] hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <CalendarPlus size={15} />
            Find a physio
          </Link>
          <Link
            href="/patient/messages"
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-[14px] hover:border-blue-200 hover:text-blue-700 transition-colors"
          >
            <MessageSquare size={15} />
            Messages
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              <ArrowUpRight size={15} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            <div className="text-[22px] font-bold text-slate-900 leading-none mb-1">{card.value}</div>
            <div className="text-[12px] text-slate-400 truncate">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Main 2-col */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Recent visits */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-[17px] font-bold text-slate-900">Recent Visits</h2>
            <Link href="/patient/records" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              View all
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-[14px] font-medium mb-4">No visits yet</p>
              <Link href="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-[13px] hover:bg-blue-700 transition-colors">
                Find a physio
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((r) => (
                <div key={r.visit_id} className="flex items-center gap-5 px-6 py-4">
                  <div className="shrink-0 text-center w-16">
                    <div className="text-[15px] font-bold text-slate-900">{new Date(r.visit_date).toLocaleDateString('en-IN', { day: 'numeric' })}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{new Date(r.visit_date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[13px] shrink-0">
                    {r.provider_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-[14px] truncate">{r.provider_name}</div>
                    <div className="text-[12px] text-slate-400 truncate">
                      Visit #{r.visit_number}{r.patient_summary ? ` · ${r.patient_summary}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-5">

          {/* Health snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-[15px] mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Your progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="text-slate-500 font-medium">Sessions completed</span>
                  <span className="font-bold text-slate-900">{records.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((records.length / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="text-slate-500 font-medium">Providers seen</span>
                  <span className="font-bold text-slate-900">{uniqueProviders}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((uniqueProviders / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label: 'Find a physio',    href: '/search',           icon: Search,        color: 'text-blue-600' },
                { label: 'My records',       href: '/patient/records',  icon: FileText,      color: 'text-emerald-600' },
                { label: 'Messages',         href: '/patient/messages', icon: MessageSquare, color: 'text-violet-600' },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <Icon size={16} className={color} />
                  <span className="text-[13px] font-medium text-slate-700 flex-1">{label}</span>
                  <ArrowRight size={13} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
