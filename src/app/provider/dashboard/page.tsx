'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  Calendar, Clock, CircleAlert, ArrowRight, ArrowUpRight,
  BarChart3, Users, MessageSquare, CheckCircle2, TrendingUp,
  CalendarCheck, AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { PROVIDER_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'
import {
  filterToday, filterThisWeek, getNextAppointment,
  formatSlotTime, patientDisplayName, type ProviderAppointment,
} from './provider-dashboard-utils'

const VISIT_LABELS: Record<string, { label: string; color: string }> = {
  in_clinic:  { label: 'Clinic',     color: 'bg-teal-50 text-teal-700 border-teal-100' },
  home_visit: { label: 'Home Visit', color: 'bg-violet-50 text-violet-700 border-violet-100' },
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending:    'bg-amber-50 text-amber-700 border-amber-100',
  cancelled:  'bg-red-50 text-red-600 border-red-100',
  completed:  'bg-slate-50 text-slate-500 border-slate-100',
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

export default function ProviderDashboardHome({ locale }: { locale?: StaticLocale } = {}) {
  const t = PROVIDER_COPY[locale ?? 'en']
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'today' | 'week'>('today')
  const [isOnline, setIsOnline] = useState(true)

  const first = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Doctor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const fetchAppts = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const r = await fetch('/api/provider/appointments')
      if (!r.ok) throw new Error()
      const d: { appointments?: ProviderAppointment[] } = await r.json()
      setAppointments(d.appointments ?? [])
    } catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { void fetchAppts() }, [fetchAppts])

  if (loading) return <DashboardSkeleton />

  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <EmptyState
        title="Couldn't load dashboard"
        description="There may be a connection issue. Please try again."
        icon={CircleAlert}
        action={
          <button onClick={() => { void fetchAppts() }} className="bp-btn bp-btn-primary">
            Retry
          </button>
        }
      />
    </div>
  )

  const todayAppts  = filterToday(appointments)
  const weekAppts   = filterThisWeek(appointments)
  const nextAppt    = getNextAppointment(appointments)
  const earned      = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + (a.fee_inr ?? 0), 0)
  const shownAppts  = tab === 'today' ? todayAppts : weekAppts

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {greeting}, Dr. <span className="text-teal-600">{first}</span>
          </h1>
          <p className="text-slate-500 text-[15px] mt-1">
            {todayAppts.length > 0
              ? `You have ${todayAppts.length} session${todayAppts.length > 1 ? 's' : ''} scheduled today.`
              : 'No sessions scheduled today. Your calendar is free.'}
          </p>
        </div>

        {/* Online toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-[13px] transition-all',
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300')} />
            {isOnline ? 'Accepting patients' : 'Paused'}
          </button>
          <Link
            href="/provider/availability"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-[14px] hover:bg-teal-700 transition-colors"
          >
            <CalendarCheck size={15} />
            Manage availability
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's sessions",
            value: String(todayAppts.length),
            sub: `${todayAppts.filter(a => a.status === 'confirmed').length} confirmed`,
            icon: Calendar, iconBg: 'bg-teal-50', iconColor: 'text-teal-600',
            href: '/provider/appointments',
          },
          {
            label: "This week",
            value: String(weekAppts.length),
            sub: 'Total appointments',
            icon: TrendingUp, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
            href: '/provider/calendar',
          },
          {
            label: 'Total patients',
            value: String(new Set(appointments.map(a => a.patient_id ?? '')).size),
            sub: 'Unique patients served',
            icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
            href: '/provider/patients',
          },
          {
            label: 'Total earned',
            value: `₹${(earned / 1000).toFixed(1)}k`,
            sub: 'From completed sessions',
            icon: BarChart3, iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
            href: '/provider/earnings',
          },
        ].map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-200 hover:shadow-md hover:shadow-teal-500/5 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              <ArrowUpRight size={15} className="text-slate-200 group-hover:text-teal-500 transition-colors" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</div>
            <div className="text-[24px] font-bold text-slate-900 leading-none mb-1">{card.value}</div>
            <div className="text-[12px] text-slate-400">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* ── Main 2-col ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left: Today's/Week's schedule */}
        <div className="bg-white rounded-2xl border border-slate-200">
          {/* Tab header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
              {(['today', 'week'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all',
                    tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {t === 'today' ? 'Today' : 'This Week'}
                </button>
              ))}
            </div>
            <Link href="/provider/calendar" className="text-[13px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
              Full calendar
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Appointment list */}
          <div className="divide-y divide-slate-50">
            {shownAppts.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar size={28} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-[14px]">
                  {tab === 'today' ? 'No sessions today.' : 'No sessions this week.'}
                </p>
                <Link href="/provider/availability" className="text-teal-600 text-[13px] font-semibold hover:underline mt-1 inline-block">
                  Update your availability →
                </Link>
              </div>
            ) : (
              shownAppts.map(appt => {
                const vt = VISIT_LABELS[appt.visit_type ?? 'in_clinic'] ?? VISIT_LABELS.in_clinic
                const sc = STATUS_COLORS[appt.status ?? 'pending'] ?? STATUS_COLORS.pending
                return (
                  <Link
                    key={appt.id}
                    href={`/provider/appointments/${appt.id}`}
                    className="flex items-center gap-5 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Time */}
                    <div className="shrink-0 text-center">
                      <div className="text-[15px] font-bold text-slate-900">
                        {appt.availabilities?.starts_at
                          ? new Date(appt.availabilities.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatSlotTime(appt)}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[13px] shrink-0">
                      {patientDisplayName(appt).charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-[14px]">{patientDisplayName(appt)}</div>
                      <div className="text-[12px] text-slate-400 truncate">
                        {appt.conditions?.join(', ') ?? 'Physiotherapy session'}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-lg border', vt.color)}>
                        {vt.label}
                      </span>
                      <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize', sc)}>
                        {appt.status ?? 'pending'}
                      </span>
                    </div>

                    <ArrowRight size={14} className="text-slate-200 group-hover:text-teal-500 transition-colors shrink-0" />
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Quick actions + Next appt */}
        <div className="space-y-5">

          {/* Next appointment */}
          {nextAppt && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-3">Next Session</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  {patientDisplayName(nextAppt).charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-[14px]">{patientDisplayName(nextAppt)}</div>
                  <div className="text-[12px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    {nextAppt.availabilities?.starts_at
                      ? new Date(nextAppt.availabilities.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'TBD'}
                  </div>
                </div>
              </div>
              <Link
                href={`/provider/appointments/${nextAppt.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl text-[13px] font-semibold hover:bg-teal-700 transition-colors"
              >
                View session details
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label: 'Update availability', href: '/provider/availability', icon: CheckCircle2, color: 'text-teal-600' },
                { label: 'View messages',        href: '/provider/messages',     icon: MessageSquare, color: 'text-blue-600' },
                { label: 'View all patients',    href: '/provider/patients',     icon: Users,         color: 'text-violet-600' },
                { label: 'Earnings report',      href: '/provider/earnings',     icon: BarChart3,     color: 'text-amber-600' },
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

          {/* Pending approvals alert */}
          {appointments.filter(a => a.status === 'pending').length > 0 && (
            <div className="flex items-start gap-3 p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-semibold text-amber-900 mb-1">
                  {appointments.filter(a => a.status === 'pending').length} pending confirmation{appointments.filter(a => a.status === 'pending').length > 1 ? 's' : ''}
                </div>
                <Link href="/provider/appointments" className="text-amber-700 text-[12px] font-medium hover:underline">
                  Review requests →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
