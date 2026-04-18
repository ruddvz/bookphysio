'use client'

import { Calendar, ArrowRight, Video, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'
import {
  filterByTab,
  parseTab,
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
  type AppointmentTab,
} from './appointments-utils'
import { canPatientCancelAppointment } from '@/lib/appointments/cancellation'
import { useUiV2 } from '@/hooks/useUiV2'
import { PatientAppointmentsTimeline } from './PatientAppointmentsTimeline'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
  cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
  no_show: 'bg-slate-50 text-slate-400 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-[var(--sq-sm)] bg-slate-100" />
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-[var(--sq-lg)] bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

function PatientAppointmentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const uiV2 = useUiV2()

  const [tab, setTab] = useState<AppointmentTab>(() => parseTab(searchParams.get('tab')))
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function fetchAppointments() {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch('/api/appointments')
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      const data: { appointments?: AppointmentItem[] } = await response.json()
      setAppointments(data.appointments ?? [])
    } catch (err) {
      console.error('Fetch failed:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    void fetchAppointments().then(() => {
      if (!isMounted) return
    })
    return () => { isMounted = false }
  }, [])

  function switchTab(next: AppointmentTab) {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filtered = filterByTab(appointments, tab)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="patient"
        kicker="APPOINTMENTS"
        title="Your visits"
        subtitle="View upcoming visits and past session history"
        action={{ label: 'Book a visit', href: '/search' }}
      />

      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-full self-start">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={cn(
                "px-6 py-2 rounded-full text-[13px] font-semibold transition-all capitalize",
                tab === t
                  ? "bg-white text-[var(--color-pt-primary)] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <SectionCard role="patient" title={`${tab === 'upcoming' ? 'Upcoming' : 'Past'} visits`}>
          {loading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-[var(--sq-sm)] bg-slate-50" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              role="patient"
              icon={XCircle}
              title="Couldn't load visits"
              description="There was an error fetching your appointment history."
              cta={{ label: 'Retry', onClick: fetchAppointments }}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              role="patient"
              icon={Calendar}
              title={tab === 'upcoming' ? 'No upcoming visits' : 'No past visits yet'}
              description={tab === 'upcoming' ? 'Your upcoming appointments will appear here.' : 'Your session history will appear here after your first visit.'}
              cta={tab === 'upcoming' ? { label: 'Book a visit', href: '/search' } : undefined}
            />
          ) : uiV2 ? (
            <PatientAppointmentsTimeline appointments={filtered} tab={tab} />
          ) : (
            <div className="divide-y divide-[var(--color-pt-border-soft)]">
              {filtered.map((appt) => (
                <ListRow
                  key={appt.id}
                  role="patient"
                  tone={1}
                  icon={appt.visit_type === 'video' ? Video : Calendar}
                  primary={providerDisplayName(appt)}
                  secondary={`${appt.availabilities?.starts_at ? formatApptDate(appt.availabilities.starts_at) : 'Pending date'} · ${appt.visit_type === 'home_visit' ? 'Home session' : 'Clinic visit'}`}
                  right={
                    <div className="flex items-center gap-3">
                      {tab === 'upcoming' && appt.payment_status !== 'paid' && canPatientCancelAppointment(appt.status, appt.availabilities?.starts_at) && (
                        <Link
                          href={`/patient/appointments/${appt.id}?reschedule=true`}
                          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-bp-accent border border-bp-accent/20 rounded-full hover:bg-bp-accent/5 transition-colors"
                        >
                          <RefreshCw size={12} />
                          Reschedule
                        </Link>
                      )}
                      <div className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", STATUS_COLORS[appt.status])}>
                        {STATUS_LABELS[appt.status] || appt.status}
                      </div>
                      <Link
                        href={`/patient/appointments/${appt.id}`}
                        className="text-[var(--color-pt-primary)] hover:opacity-80 transition-opacity"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

export default function PatientAppointments() {
  return (
    <Suspense fallback={<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8"><AppointmentsSkeleton /></div>}>
      <PatientAppointmentsContent />
    </Suspense>
  )
}

