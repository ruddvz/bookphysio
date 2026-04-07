'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, Clock, ArrowRight, ArrowUpRight, BarChart3, Users,
  MessageSquare, CalendarPlus, FileText, UserPlus, IndianRupee,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import { dateKey } from '@/app/provider/calendar/calendar-utils'
import type { ScheduleEntry } from '@/lib/clinical/types'

interface PatientRosterResponse {
  patients: Array<{ profile_id: string; patient_name: string; visit_count: number; last_visit_date: string | null }>
}

function fmtTime(t: string): string {
  const [hh, mm] = t.split(':')
  const h = parseInt(hh, 10)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${mm} ${ampm}`
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

export default function ProviderDashboardHome() {
  const { user } = useAuth()
  const first = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Doctor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Compute current week (Mon-Sun)
  const today = new Date()
  const todayKey = dateKey(today)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const startStr = dateKey(monday)
  const endStr = dateKey(sunday)

  const { data: scheduleData, isLoading: loadingSchedule } = useQuery({
    queryKey: ['provider-schedule', startStr, endStr],
    queryFn: async () => {
      const r = await fetch(`/api/provider/schedule?start=${startStr}&end=${endStr}`)
      if (!r.ok) throw new Error('schedule')
      return r.json() as Promise<{ entries: ScheduleEntry[] }>
    },
  })

  const { data: rosterData, isLoading: loadingRoster } = useQuery({
    queryKey: ['provider-roster-summary'],
    queryFn: async () => {
      const r = await fetch('/api/provider/patients')
      if (!r.ok) throw new Error('roster')
      return r.json() as Promise<PatientRosterResponse>
    },
  })

  if (loadingSchedule || loadingRoster) return <DashboardSkeleton />

  const entries = scheduleData?.entries ?? []
  const patients = rosterData?.patients ?? []

  const todaysEntries = entries
    .filter((e) => e.visit_date === todayKey)
    .sort((a, b) => a.visit_time.localeCompare(b.visit_time))

  const todayEarnings = todaysEntries.reduce((s, e) => s + (e.fee_inr ?? 0), 0)
  const weekEarnings = entries.reduce((s, e) => s + (e.fee_inr ?? 0), 0)
  const recentPatients = patients.slice(0, 5)

  const stats = [
    {
      label: "Today's visits",
      value: String(todaysEntries.length),
      sub: `₹${todayEarnings.toLocaleString('en-IN')} expected`,
      icon: Calendar, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
      href: '/provider/calendar',
    },
    {
      label: 'This week',
      value: String(entries.length),
      sub: `₹${weekEarnings.toLocaleString('en-IN')} scheduled`,
      icon: IndianRupee, iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
      href: '/provider/calendar',
    },
    {
      label: 'Total patients',
      value: String(patients.length),
      sub: 'In your roster',
      icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
      href: '/provider/patients',
    },
    {
      label: 'Earnings',
      value: 'View',
      sub: 'Reports & bills',
      icon: BarChart3, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      href: '/provider/earnings',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {greeting}, Dr. <span className="text-emerald-600">{first}</span>
          </h1>
          <p className="text-slate-500 text-[15px] mt-1">
            {todaysEntries.length > 0
              ? `You have ${todaysEntries.length} session${todaysEntries.length > 1 ? 's' : ''} scheduled today.`
              : 'No sessions scheduled today.'}
          </p>
        </div>
        <Link
          href="/provider/calendar"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-[14px] hover:bg-emerald-700 transition-colors shrink-0"
        >
          <CalendarPlus size={15} />
          Open Schedule
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              <ArrowUpRight size={15} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            <div className="text-[24px] font-bold text-slate-900 leading-none mb-1">{card.value}</div>
            <div className="text-[12px] text-slate-400">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Main 2-col */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Today's schedule */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Today&apos;s Schedule</h2>
              <p className="text-[12px] text-slate-400">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <Link href="/provider/calendar" className="text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              Full week
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {todaysEntries.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar size={28} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-[14px]">No sessions today.</p>
                <Link href="/provider/calendar" className="text-emerald-600 text-[13px] font-semibold hover:underline mt-1 inline-block">
                  Schedule a visit →
                </Link>
              </div>
            ) : (
              todaysEntries.map((e) => (
                <div key={e.visit_id} className="flex items-center gap-5 px-6 py-4">
                  <div className="shrink-0 text-center w-16">
                    <div className="text-[15px] font-bold text-slate-900">{fmtTime(e.visit_time)}</div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[13px] shrink-0">
                    {e.patient_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-[14px] truncate">{e.patient_name}</div>
                    <div className="text-[12px] text-slate-400">Visit #{e.visit_number}</div>
                  </div>
                  {e.fee_inr != null && (
                    <div className="text-[13px] font-bold text-slate-700 shrink-0">₹{e.fee_inr.toLocaleString('en-IN')}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-5">

          {/* Recent patients */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-[15px]">Recent Patients</h3>
              <Link href="/provider/patients" className="text-[12px] text-emerald-600 font-semibold hover:underline">View all</Link>
            </div>
            {recentPatients.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl">
                <UserPlus size={20} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[12px] text-slate-400">No patients yet</p>
                <Link href="/provider/patients" className="text-emerald-600 text-[12px] font-semibold hover:underline mt-1 inline-block">Add a patient →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPatients.map((p) => (
                  <Link
                    key={p.profile_id}
                    href={`/provider/patients/${p.profile_id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[12px] shrink-0">
                      {p.patient_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-slate-900 truncate">{p.patient_name}</div>
                      <div className="text-[11px] text-slate-400">{p.visit_count} visit{p.visit_count !== 1 ? 's' : ''}</div>
                    </div>
                    <ArrowRight size={13} className="text-slate-200 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label: 'New visit',         href: '/provider/visits/new',  icon: FileText,      color: 'text-emerald-600' },
                { label: 'Generate bill',     href: '/provider/bills/new',   icon: IndianRupee,   color: 'text-amber-600' },
                { label: 'Patients',          href: '/provider/patients',    icon: Users,         color: 'text-violet-600' },
                { label: 'Messages',          href: '/provider/messages',    icon: MessageSquare, color: 'text-blue-600' },
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

          {/* Mini earnings */}
          <Link href="/provider/earnings" className="block p-5 rounded-2xl bg-emerald-600 text-white relative overflow-hidden hover:bg-emerald-700 transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-100 mb-2">This Week</div>
            <div className="text-[28px] font-extrabold leading-none mb-1">₹{weekEarnings.toLocaleString('en-IN')}</div>
            <div className="text-[12px] text-emerald-100 flex items-center gap-1 mt-2">
              <Clock size={12} /> {entries.length} visit{entries.length !== 1 ? 's' : ''} scheduled
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
