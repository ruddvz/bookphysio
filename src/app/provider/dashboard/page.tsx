"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Users,
  TrendingUp,
  CalendarPlus,
  UserPlus,
  Receipt,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatIndiaDate, formatIndiaDateInput, parseIndiaDate } from '@/lib/india-date'
import { DashboardQueryError, isDashboardAccessError } from '@/lib/dashboard-query-error'
import type { ScheduleEntry } from '@/lib/clinical/types'
import {
  PageHeader,
  StatTile,
  SectionCard,
  ListRow,
  EmptyState,
  DashCard,
} from '@/components/dashboard/primitives'
import {
  countRemainingVisitsToday,
  filterScheduleEntriesThisWeek,
  getNextScheduledVisit,
  sumScheduledFees,
} from './provider-dashboard-utils'

interface PatientRosterResponse {
  patients: Array<{
    profile_id: string
    patient_name: string
    visit_count: number
    last_visit_date: string | null
  }>
}

function fmtTime(t: string): string {
  const [hh, mm] = t.split(':')
  const h = parseInt(hh, 10)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${mm} ${ampm}`
}

function fmtToday(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const SCHEDULE_LOOKAHEAD_DAYS = 30

function formatVisitDay(visitDate: string): string {
  return formatIndiaDate(visitDate, { day: 'numeric', month: 'short' })
}

function formatNextVisitLabel(entry: ScheduleEntry, todayKey: string): string {
  return entry.visit_date === todayKey
    ? `Today at ${fmtTime(entry.visit_time)}`
    : `${formatVisitDay(entry.visit_date)} at ${fmtTime(entry.visit_time)}`
}

function formatNextSlotValue(entry: ScheduleEntry, todayKey: string): string {
  return entry.visit_date === todayKey
    ? fmtTime(entry.visit_time)
    : `${formatVisitDay(entry.visit_date)} ${fmtTime(entry.visit_time)}`
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <Skeleton className="h-10 w-72 rounded-xl bg-slate-100" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl bg-slate-100" />
    </div>
  )
}

export default function ProviderDashboardHome() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? 'Practitioner'
  const last = fullName.split(' ').slice(-1)[0] ?? fullName

  const today = new Date()
  const todayKey = formatIndiaDateInput(today)
  const scheduleEnd = new Date(parseIndiaDate(todayKey).getTime() + (SCHEDULE_LOOKAHEAD_DAYS - 1) * DAY_IN_MS)
  const scheduleEndKey = formatIndiaDateInput(scheduleEnd)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const {
    data: scheduleData,
    isLoading: loadingSchedule,
    isError: hasScheduleError,
    error: scheduleError,
  } = useQuery({
    queryKey: ['provider-schedule', todayKey, scheduleEndKey],
    queryFn: async () => {
      const r = await fetch(`/api/provider/schedule?start=${todayKey}&end=${scheduleEndKey}`)
      if (!r.ok) throw new DashboardQueryError('provider-schedule', r.status)
      return r.json() as Promise<{ entries: ScheduleEntry[] }>
    },
  })

  const {
    data: rosterData,
    isLoading: loadingRoster,
    isError: hasRosterError,
    error: rosterError,
  } = useQuery({
    queryKey: ['provider-roster-summary'],
    queryFn: async () => {
      const r = await fetch('/api/provider/patients?view=dashboard')
      if (!r.ok) throw new DashboardQueryError('provider-roster-summary', r.status)
      return r.json() as Promise<PatientRosterResponse>
    },
  })

  const hasScheduleAccessError = isDashboardAccessError(scheduleError)
  const hasRosterAccessError = isDashboardAccessError(rosterError)

  useEffect(() => {
    if (hasScheduleAccessError) {
      queryClient.removeQueries({ queryKey: ['provider-schedule'] })
    }

    if (hasRosterAccessError) {
      queryClient.removeQueries({ queryKey: ['provider-roster-summary'], exact: true })
    }
  }, [hasRosterAccessError, hasScheduleAccessError, queryClient])

  if (hasScheduleError || hasRosterError) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        <PageHeader
          role="provider"
          kicker="VIRTUAL CLINIC"
          title={`${greeting}, Dr. ${last}`}
          subtitle="Your clinic dashboard is temporarily unavailable."
          action={{ label: 'Generate invoice', href: '/provider/bills/new', icon: Receipt }}
        />

        <SectionCard role="provider" title="Dashboard unavailable">
          <EmptyState
            role="provider"
            icon={CalendarPlus}
            title="We couldn't load your latest schedule"
            description="Schedule or roster data is temporarily unavailable. Please refresh in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  if (loadingSchedule || loadingRoster) return <DashboardSkeleton />

  const entries = scheduleData?.entries ?? []
  const patients = rosterData?.patients ?? []
  const thisWeekEntries = filterScheduleEntriesThisWeek(entries, today)
  const todaysEntries = entries.filter((e) => e.visit_date === todayKey).sort((a, b) => a.visit_time.localeCompare(b.visit_time))
  const nextVisit = getNextScheduledVisit(entries, today)
  const remainingToday = countRemainingVisitsToday(entries, today)
  const firstVisitPatients = patients.filter((patient) => patient.visit_count === 1).length
  const scheduledFeesThisWeek = sumScheduledFees(thisWeekEntries)
  const weekSessions = thisWeekEntries.length
  const recentPatients = [...patients]
    .sort((left, right) => {
      if (!left.last_visit_date && !right.last_visit_date) {
        return 0
      }

      if (!left.last_visit_date) {
        return 1
      }

      if (!right.last_visit_date) {
        return -1
      }

      return right.last_visit_date.localeCompare(left.last_visit_date)
    })
    .slice(0, 5)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="VIRTUAL CLINIC"
        title={`${greeting}, Dr. ${last}`}
        subtitle={fmtToday(today)}
        action={{ label: 'Generate invoice', href: '/provider/bills/new', icon: Receipt }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          role="provider"
          icon={Calendar}
          label="Today's visits"
          value={todaysEntries.length}
          tone={1}
        />
        <StatTile
          role="provider"
          icon={Clock}
          label="Next slot"
          value={nextVisit ? formatNextSlotValue(nextVisit, todayKey) : '—'}
          tone={2}
        />
        <StatTile
          role="provider"
          icon={TrendingUp}
          label="Scheduled fees"
          value={`₹${scheduledFeesThisWeek.toLocaleString('en-IN')}`}
          tone={3}
        />
        <StatTile
          role="provider"
          icon={UserPlus}
          label="First visits"
          value={firstVisitPatients}
          tone={4}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-6">
           <SectionCard role="provider" title="Next consult">
             {nextVisit ? (
               <div className="rounded-2xl border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-track-bg)]/70 p-5 sm:p-6">
                 <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                   <div className="space-y-4">
                     <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--color-pv-primary)] shadow-sm">
                       Up next
                     </div>

                     <div>
                       <h3 className="text-[24px] font-black tracking-tight text-[var(--color-pv-ink)]">
                         {nextVisit.patient_name}
                       </h3>
                       <p className="mt-2 text-[14px] font-medium text-slate-500">
                         {formatNextVisitLabel(nextVisit, todayKey)}
                       </p>
                     </div>

                     <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-500">
                       <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                         Visit #{nextVisit.visit_number}
                       </span>
                       <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                         ₹{(nextVisit.fee_inr ?? 0).toLocaleString('en-IN')}
                       </span>
                       <span className="rounded-full bg-[var(--color-pv-border-soft)] px-3 py-1 font-semibold text-[var(--color-pv-primary)]">
                         {nextVisit.visit_date === todayKey ? `${remainingToday} remaining today` : `${weekSessions} scheduled this week`}
                       </span>
                     </div>
                   </div>

                   <div className="flex flex-col gap-3 sm:min-w-[220px]">
                     <Link
                       href={`/provider/calendar?id=${nextVisit.visit_id}`}
                       className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-pv-primary)] px-5 py-3 text-[13px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
                     >
                       Open schedule
                       <ArrowRight size={14} />
                     </Link>
                     <Link
                       href="/provider/patients"
                       className="inline-flex items-center justify-center rounded-full border border-[var(--color-pv-border)] bg-white px-5 py-3 text-[13px] font-bold text-[var(--color-pv-ink)] transition-colors hover:bg-[var(--color-pv-track-bg)]"
                     >
                       Open patient registry
                     </Link>
                   </div>
                 </div>
               </div>
             ) : (
               <EmptyState
                 role="provider"
                 icon={CalendarPlus}
                 title="Clear schedule"
                 description={`No consultations booked in the next ${SCHEDULE_LOOKAHEAD_DAYS} days.`}
                 cta={{ label: 'Manage Availability', href: '/provider/availability' }}
               />
             )}
           </SectionCard>

           <SectionCard
             role="provider"
             title="Today's schedule"
             action={{ label: 'Full schedule', href: '/provider/calendar' }}
           >
             {todaysEntries.length === 0 ? (
               <EmptyState
                 role="provider"
                 icon={CalendarPlus}
                 title="Nothing on the board"
                 description="No consultations booked for today."
                 cta={{ label: 'Manage Availability', href: '/provider/availability' }}
               />
             ) : (
               <div>
                 {todaysEntries.map((e) => (
                   <ListRow
                     key={e.visit_id}
                     role="provider"
                     icon={Clock}
                     tone={1}
                     primary={e.patient_name}
                     secondary={`Visit #${e.visit_number} • ₹${(e.fee_inr ?? 0).toLocaleString('en-IN')}`}
                     right={
                        <div className="flex items-center gap-3">
                           <span className="text-[13px] font-bold text-slate-900">{fmtTime(e.visit_time)}</span>
                           {nextVisit?.visit_id === e.visit_id ? (
                             <span className="rounded-full bg-[var(--color-pv-border-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-pv-primary)]">
                               Next
                             </span>
                           ) : null}
                           <ArrowRight size={14} className="text-slate-300" />
                        </div>
                     }
                     href={`/provider/calendar?id=${e.visit_id}`}
                   />
                 ))}
               </div>
             )}
           </SectionCard>

           <SectionCard
             role="provider"
             title="Recent patients"
             action={{ label: 'Registry roster', href: '/provider/patients' }}
           >
             {recentPatients.length === 0 ? (
               <EmptyState
                 role="provider"
                 icon={Users}
                 title="Vacant registry"
                 description="Your patient list will grow as consultations are logged."
               />
             ) : (
               <div>
                 {recentPatients.map((p) => (
                   <ListRow
                     key={p.profile_id}
                     role="provider"
                     icon={Users}
                     tone={4}
                     primary={p.patient_name}
                     secondary={`${p.visit_count} visit${p.visit_count === 1 ? '' : 's'} recorded`}
                     right={
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                         {p.last_visit_date ? formatIndiaDate(p.last_visit_date, { day: 'numeric', month: 'short' }) : '—'}
                       </span>
                     }
                     href={`/provider/patients/${p.profile_id}`}
                   />
                 ))}
               </div>
             )}
           </SectionCard>
        </div>

        <aside className="space-y-6">
           <DashCard role="provider">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Quick actions
              </div>
              <div className="space-y-1">
                 {[
                   { label: 'New invoice', href: '/provider/bills/new', icon: Receipt },
                   { label: 'Block time', href: '/provider/availability', icon: Clock },
                   { label: 'Open roster', href: '/provider/patients', icon: UserPlus },
                   { label: 'AI Assistant', href: '/provider/ai-assistant', icon: Zap },
                 ].map(({ label, href, icon: Icon }) => (
                   <Link
                     key={href}
                     href={href}
                     className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-pv-border-soft)] transition-colors group"
                   >
                     <Icon size={16} className="text-[var(--color-pv-primary)]" />
                     <span className="flex-1 text-[13px] font-medium text-[var(--color-pv-ink)]">{label}</span>
                     <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                   </Link>
                 ))}
              </div>
           </DashCard>

              <SectionCard role="provider" title="Operational pulse">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">Patients tracked</span>
                    <span className="font-bold text-[var(--color-pv-ink)]">{patients.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">Week sessions</span>
                    <span className="font-bold text-[var(--color-pv-ink)]">{weekSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">Remaining today</span>
                    <span className="font-bold text-[var(--color-pv-ink)]">{remainingToday}</span>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-pv-track-bg)] p-4 text-[12px] font-bold text-slate-600">
                    Scheduled this week: ₹{scheduledFeesThisWeek.toLocaleString('en-IN')}
                  </div>
                  <Link
                    href="/provider/earnings"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-pv-primary)] px-5 py-3 text-[13px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
                  >
                    Earnings Hub
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </SectionCard>
        </aside>
      </div>
    </div>
  )
}
