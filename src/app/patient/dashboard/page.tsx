'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  Calendar, Users, Activity, MessageSquare, ArrowRight, ArrowUpRight,
  CalendarPlus, Clock, CircleAlert, ShieldCheck, TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatApptDate, providerDisplayName } from './dashboard-utils'
import { DashboardSkeleton } from './DashboardSkeleton'
import { DASHBOARD_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'

type VisitType = 'in_clinic' | 'home_visit'
interface Appointment {
  id: string
  status: string
  visit_type: VisitType
  fee_inr: number
  availabilities: { starts_at: string } | null
  providers: { users: { full_name: string } | null; specialties?: { name: string }[] } | null
  locations: { city: string } | null
}
const VISIT_LABELS: Record<VisitType, string> = { in_clinic: 'In Clinic', home_visit: 'Home Visit' }

export default function PatientDashboardHome({ locale }: { locale?: StaticLocale } = {}) {
  const t = DASHBOARD_COPY[locale ?? 'en']
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)

  const first = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening

  const fetchAppts = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const r = await fetch('/api/appointments')
      if (!r.ok) throw new Error()
      const d: { appointments?: Appointment[] } = await r.json()
      setAppointments(d.appointments ?? [])
    } catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { void fetchAppts() }, [fetchAppts])

  const now = new Date()
  const upcoming = appointments.filter(a => a.status !== 'cancelled' && a.availabilities?.starts_at && new Date(a.availabilities.starts_at) >= now)
  const past = appointments.filter(a => a.status === 'completed' || (a.availabilities?.starts_at && new Date(a.availabilities.starts_at) < now))
  const next = upcoming[0] ?? null

  async function handleCopy() {
    const link = `${window.location.origin}/signup?ref=bp-${user?.id?.slice(-6) ?? 'demo'}`
    try {
      await navigator.clipboard.writeText(link)
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 2200)
    } catch { /* */ }
  }

  if (loading) return <DashboardSkeleton />
  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <EmptyState
        title={t.errorTitle}
        description={t.errorDesc}
        icon={CircleAlert}
        action={
          <button onClick={() => { void fetchAppts() }} className="bp-btn bp-btn-primary">
            {t.retrySync}
          </button>
        }
      />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={11} />
              {t.verifiedPatient}
            </span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {greeting}, <span className="text-blue-600">{first}</span> 👋
          </h1>
          <p className="text-slate-500 text-[15px] mt-1">
            {t.welcomeBack(upcoming.length)}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/search"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-[14px] hover:bg-blue-700 transition-colors group shadow-sm shadow-blue-600/20"
          >
            <CalendarPlus size={15} />
            {t.bookNewTherapy}
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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t.nextSession,
            value: next?.availabilities?.starts_at ? formatApptDate(next.availabilities.starts_at).split(',')[0] : '—',
            sub: next ? providerDisplayName(next) : t.findNextMatch,
            icon: Calendar, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
            href: '/patient/appointments',
          },
          {
            label: 'Sessions done',
            value: String(past.length),
            sub: t.previousSpecialists,
            icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
            href: '/patient/appointments',
          },
          {
            label: t.careTeam,
            value: String(new Set(past.map(a => providerDisplayName(a))).size),
            sub: 'Unique providers',
            icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
            href: '/search',
          },
          {
            label: 'Messages',
            value: 'Chat',
            sub: 'Talk to your care team',
            icon: MessageSquare, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
            href: '/patient/messages',
          },
        ].map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all"
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

      {/* ── Two-column main ── */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Left: Upcoming + Past */}
        <div className="space-y-6">

          {/* Next Appointment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-slate-900">Next Appointment</h2>
              <Link href="/patient/appointments" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                View all <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {next ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[16px]">
                    {providerDisplayName(next).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-[15px]">{providerDisplayName(next)}</div>
                    <div className="text-[12px] text-slate-400">{next.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                      <Calendar size={11} /> Date
                    </div>
                    <div className="text-[14px] font-semibold text-slate-900">
                      {formatApptDate(next.availabilities?.starts_at ?? '').split(',')[0]}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                      <Clock size={11} /> Time
                    </div>
                    <div className="text-[14px] font-semibold text-slate-900">
                      {new Date(next.availabilities?.starts_at ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/patient/appointments/${next.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold text-[14px] hover:bg-blue-700 transition-colors"
                  >
                    Manage booking
                  </Link>
                  <div className="flex items-center gap-1.5 text-[12px] px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {VISIT_LABELS[next.visit_type]}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-[14px] font-medium mb-4">{t.noPendingSessions}</p>
                <Link href="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-[13px] hover:bg-blue-700 transition-colors">
                  {t.startRecovery}
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Care Team */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-slate-900">My Care Team</h2>
              <span className="text-[12px] text-slate-400">{past.length} providers</span>
            </div>

            {past.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                <Users size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-[13px]">{t.buildTeam}</p>
                <Link href="/search" className="text-blue-600 text-[12px] font-semibold hover:underline mt-1 inline-block">{t.browseSpecialists}</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {past.slice(0, 4).map(a => (
                  <Link
                    key={a.id}
                    href={`/patient/appointments/${a.id}`}
                    className="group flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[13px] group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {providerDisplayName(a).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-slate-900 truncate">{providerDisplayName(a)}</div>
                      <div className="text-[11px] text-slate-400 truncate">{a.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}</div>
                    </div>
                    <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity + Referral */}
        <div className="space-y-5">

          {/* Activity widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-[15px] mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Recovery Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="text-slate-500 font-medium">Sessions completed</span>
                  <span className="font-bold text-slate-900">{past.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((past.length / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="text-slate-500 font-medium">Upcoming sessions</span>
                  <span className="font-bold text-slate-900">{upcoming.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((upcoming.length / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Need Help widget */}
          <Link
            href="/patient/messages"
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <MessageSquare size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-slate-900 mb-0.5">Need help?</div>
              <div className="text-[12px] text-slate-400">Message your care team</div>
            </div>
            <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </Link>

          {/* Referral widget */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-2">{t.referralBadge}</div>
              <h3 className="text-[18px] font-bold mb-2 leading-tight">{t.referralHeading}</h3>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-4">{t.referralBody}</p>
              <button
                onClick={() => { void handleCopy() }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[13px] font-semibold transition-colors"
              >
                {referralCopied ? '✓ Copied!' : t.copyReferralLink}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
