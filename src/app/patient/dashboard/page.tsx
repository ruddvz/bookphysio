'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  CalendarPlus,
  Users,
  Activity,
  MessageSquare,
  Search,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  PageHeader,
  StatTile,
  SectionCard,
  ListRow,
  EmptyState,
  DashCard,
} from '@/components/dashboard/primitives'
import { formatIndiaDate } from '@/lib/india-date'
import { DashboardQueryError, isDashboardAccessError } from '@/lib/dashboard-query-error'
import type { PatientFacingRecord } from '@/lib/clinical/types'
import {
  formatAppointmentDateTime,
  getNextAppointment,
  getPatientAppointmentProviderName,
  getPatientAppointmentVisitLabel,
} from './dashboard-utils'
import type { AppointmentItem } from '../appointments/appointments-utils'

function fmtShortDate(iso: string): string {
  return formatIndiaDate(iso, { day: 'numeric', month: 'short' })
}

function getGreeting(): string {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

function isUpcomingAppointment(appointment: AppointmentItem): boolean {
  const startsAt = appointment.availabilities?.starts_at

  if (!startsAt) {
    return false
  }

  if (appointment.status === 'cancelled' || appointment.status === 'completed' || appointment.status === 'no_show') {
    return false
  }

  return Date.parse(startsAt) >= Date.now()
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

export default function PatientDashboardHome() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const first =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    'there'
  const greeting = getGreeting()

  const { data, isLoading, isError: hasRecordsError, error: recordsError } = useQuery({
    queryKey: ['patient-records'],
    queryFn: async () => {
      const r = await fetch('/api/patient/records?view=dashboard')
      if (!r.ok) throw new DashboardQueryError('patient-records', r.status)
      return r.json() as Promise<{ records: PatientFacingRecord[] }>
    },
  })

  const {
    data: appointmentData,
    isLoading: areAppointmentsLoading,
    isError: hasAppointmentsError,
    error: appointmentsError,
  } = useQuery({
    queryKey: ['patient-appointments-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/appointments?view=dashboard')
      if (!response.ok) throw new DashboardQueryError('patient-appointments-dashboard', response.status)
      return response.json() as Promise<{ appointments: AppointmentItem[] }>
    },
  })

  const hasRecordsAccessError = isDashboardAccessError(recordsError)
  const hasAppointmentsAccessError = isDashboardAccessError(appointmentsError)

  useEffect(() => {
    if (hasRecordsAccessError) {
      queryClient.removeQueries({ queryKey: ['patient-records'], exact: true })
    }

    if (hasAppointmentsAccessError) {
      queryClient.removeQueries({ queryKey: ['patient-appointments-dashboard'], exact: true })
    }
  }, [hasAppointmentsAccessError, hasRecordsAccessError, queryClient])

  if (hasRecordsError || hasAppointmentsError) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        <PageHeader
          role="patient"
          kicker="YOUR HEALTH"
          title={`${greeting}, ${first}`}
          subtitle="Your care dashboard is temporarily unavailable."
          action={{ label: 'Find a physio', href: '/search' }}
        />

        <SectionCard role="patient" title="Dashboard unavailable">
          <EmptyState
            role="patient"
            icon={Activity}
            title="We couldn't load your latest care updates"
            description="Appointments or visit summaries are temporarily unavailable. Please refresh in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  if (isLoading || areAppointmentsLoading) return <DashboardSkeleton />

  const records = data?.records ?? []
  const appointments = appointmentData?.appointments ?? []
  const recent = records.slice(0, 5)
  const uniqueProviders = new Set(records.map((r) => r.provider_name)).size
  const lastVisit = records[0] ?? null
  const upcomingAppointments = appointments.filter(isUpcomingAppointment)
  const upcomingCount = upcomingAppointments.length
  const nextAppointment = getNextAppointment(appointments)
  const latestSummaryCount = records.filter((record) => Boolean(record.patient_summary)).length
  const latestSpecialty = nextAppointment?.providers?.specialties?.[0]?.name ?? null

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="patient"
        kicker="YOUR HEALTH"
        title={`${greeting}, ${first}`}
        subtitle={nextAppointment ? 'Your next session is locked in and ready.' : "Here's your care at a glance"}
        action={{ label: 'Find a physio', href: '/search' }}
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          role="patient"
          icon={CalendarPlus}
          label="Upcoming visits"
          value={upcomingCount}
          tone={1}
        />
        <StatTile
          role="patient"
          icon={Users}
          label="Care team"
          value={uniqueProviders}
          tone={2}
        />
        <StatTile
          role="patient"
          icon={FileText}
          label="Visit summaries"
          value={latestSummaryCount}
          tone={3}
        />
        <StatTile
          role="patient"
          icon={Activity}
          label="Last visit"
          value={lastVisit ? fmtShortDate(lastVisit.visit_date) : '—'}
          tone={4}
        />
      </div>

      {/* Main + rail */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <SectionCard role="patient" title="Upcoming appointment">
            {nextAppointment ? (
              <div className="rounded-2xl border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-surface)]/70 p-5 sm:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--color-pt-primary)] shadow-sm">
                      {getPatientAppointmentVisitLabel(nextAppointment)}
                    </div>

                    <div>
                      <h3 className="text-[24px] font-black tracking-tight text-[var(--color-pt-ink)]">
                        {getPatientAppointmentProviderName(nextAppointment)}
                      </h3>
                      <p className="mt-2 text-[14px] font-medium text-slate-500">
                        {formatAppointmentDateTime(nextAppointment.availabilities?.starts_at ?? '')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                        {nextAppointment.locations?.city ?? 'Location to be confirmed'}
                      </span>
                      {latestSpecialty ? (
                        <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                          {latestSpecialty}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-[var(--color-pt-border-soft)] px-3 py-1 font-semibold capitalize text-[var(--color-pt-primary)]">
                        {nextAppointment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:min-w-[220px]">
                    <Link
                      href={`/patient/appointments/${nextAppointment.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-pt-primary)] px-5 py-3 text-[13px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
                    >
                      View details
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/search"
                      className="inline-flex items-center justify-center rounded-full border border-[var(--color-pt-border)] bg-white px-5 py-3 text-[13px] font-bold text-[var(--color-pt-ink)] transition-colors hover:bg-[var(--color-pt-border-soft)]"
                    >
                      Book follow-up
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                role="patient"
                icon={CalendarPlus}
                title="Nothing scheduled"
                description="Book your next session when you're ready."
                cta={{ label: 'Book a visit', href: '/search' }}
              />
            )}
          </SectionCard>

          <SectionCard
            role="patient"
            title="Recent visits"
            action={{ label: 'View all', href: '/patient/records' }}
          >
            {recent.length === 0 ? (
              <EmptyState
                role="patient"
                icon={Calendar}
                title="No visits yet"
                description="Your past and upcoming appointments will appear here."
                cta={{ label: 'Book a visit', href: '/search' }}
              />
            ) : (
              <div>
                {recent.map((r) => (
                  <ListRow
                    key={r.visit_id}
                    role="patient"
                    icon={FileText}
                    tone={1}
                    primary={r.provider_name}
                    secondary={`Visit #${r.visit_number}${
                      r.patient_summary ? ` · ${r.patient_summary}` : ''
                    }`}
                    right={fmtShortDate(r.visit_date)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right rail */}
        <div className="xl:w-[340px] xl:shrink-0 space-y-6">
          <DashCard role="patient">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Quick actions
            </div>
            <div className="space-y-1">
              {[
                { label: 'Find a physio', href: '/search', icon: Search },
                {
                  label: 'My records',
                  href: '/patient/records',
                  icon: FileText,
                },
                {
                  label: 'Messages',
                  href: '/patient/messages',
                  icon: MessageSquare,
                },
                {
                  label: 'Update profile',
                  href: '/patient/profile',
                  icon: User,
                },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-pt-border-soft)] transition-colors group"
                >
                  <Icon size={16} className="text-[var(--color-pt-primary)]" />
                  <span className="flex-1 text-[13px] font-medium text-[var(--color-pt-ink)]">
                    {label}
                  </span>
                  <ArrowRight
                    size={13}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </DashCard>

          <SectionCard role="patient" title="Care snapshot">
            <div className="space-y-4 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Published summaries</span>
                <span className="font-bold text-[var(--color-pt-ink)]">{latestSummaryCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Most recent provider</span>
                <span className="font-bold text-[var(--color-pt-ink)]">
                  {lastVisit?.provider_name ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Next booked city</span>
                <span className="font-bold text-[var(--color-pt-ink)]">
                  {nextAppointment?.locations?.city ?? 'Not booked'}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
