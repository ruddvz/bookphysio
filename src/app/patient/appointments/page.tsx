'use client'

import { CalendarDays, ArrowRight, CircleAlert, Calendar, Clock, MapPin, Activity, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import {
  filterByTab,
  parseTab,
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
  type AppointmentTab,
} from './appointments-utils'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
  cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
  no_show: 'bg-slate-50 text-slate-400 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Approval',
  confirmed: 'Confirmed',
  completed: 'Session Completed',
  cancelled: 'Cancelled',
  no_show: 'Missed Session',
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'Clinic Visit',
  home_visit: 'Home Session',
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-6 flex-1 w-full">
            <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1 pt-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-14 w-32 rounded-2xl shrink-0" />
        </div>
      ))}
    </div>
  )
}

function PatientAppointmentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

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

    async function loadInitialAppointments() {
      try {
        const response = await fetch('/api/appointments')
        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }
        const data: { appointments?: AppointmentItem[] } = await response.json()
        if (!isMounted) {
          return
        }
        setAppointments(data.appointments ?? [])
      } catch (err) {
        console.error('Fetch failed:', err)
        if (!isMounted) {
          return
        }
        setError(true)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadInitialAppointments()

    return () => {
      isMounted = false
    }
  }, [])

  function switchTab(next: AppointmentTab) {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filtered = filterByTab(appointments, tab)

  return (
    <div className="max-w-[1142px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
           <h1 className="text-[32px] md:text-[40px] font-bold text-slate-900 leading-none tracking-tight">
             My Appointments
           </h1>
           <p className="text-[15px] text-slate-500 max-w-[440px] leading-relaxed">
             View upcoming appointments and past session history.
           </p>
        </div>
        <Link href="/search" className="h-12 px-6 bg-blue-600 text-white rounded-full text-[14px] font-semibold flex items-center gap-3 hover:bg-blue-700 transition-colors active:scale-95">
           <CalendarPlus size={18} />
           Book New Session
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-8 p-1 bg-slate-100 rounded-full inline-flex items-center gap-1">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={cn(
              "px-8 py-3 rounded-full text-[14px] font-semibold tracking-tight transition-all capitalize",
              tab === t
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <span className="flex items-center gap-2">
               {t === 'upcoming' ? <CalendarDays size={16} /> : <Clock size={16} />}
               {t}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        {loading ? (
          <AppointmentsSkeleton />
        ) : error ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm py-16 px-10 text-center">
            <CircleAlert className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-[18px] font-bold text-slate-900 mb-2">Could not load appointments</h3>
            <p className="text-[14px] text-slate-500 mb-6">Something went wrong. Please try again.</p>
            <button
              type="button"
              onClick={fetchAppointments}
              className="px-8 py-3 bg-blue-600 text-white rounded-full text-[14px] font-semibold hover:bg-blue-700 transition-colors active:scale-95"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <EmptyState
              title={`No ${tab} appointments`}
              description={
                tab === 'upcoming'
                  ? 'No upcoming appointments scheduled. Ready to book?'
                  : 'Past appointments will appear here after your sessions.'
              }
              icon={Calendar}
              className="border-0 bg-transparent"
              action={
                tab === 'upcoming' && (
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-[14px] hover:bg-blue-700 transition-colors"
                  >
                    Browse Specialists
                    <ArrowRight size={18} />
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <div
                key={appt.id}
                className="group bg-white rounded-2xl border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-md hover:border-blue-100"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-5 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-[20px] font-bold shrink-0">
                     {providerDisplayName(appt).charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-[17px] font-bold text-slate-900 truncate leading-none">
                        {providerDisplayName(appt)}
                      </h3>
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border", STATUS_COLORS[appt.status])}>
                         {STATUS_LABELS[appt.status] || appt.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[13px] text-slate-500 flex-wrap">
                       <span className="flex items-center gap-1.5">
                          <Activity size={12} className="text-blue-500" />
                          {appt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
                       </span>
                       <span className="text-slate-300">·</span>
                       <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {VISIT_TYPE_LABELS[appt.visit_type] || appt.visit_type}
                       </span>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                       <span className="flex items-center gap-2 text-[14px] font-medium text-blue-600">
                          <Calendar size={14} />
                          {appt.availabilities?.starts_at ? formatApptDate(appt.availabilities.starts_at) : 'Pending'}
                       </span>
                       <span className="text-[15px] font-bold text-slate-900">₹{appt.fee_inr}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/patient/appointments/${appt.id}`}
                  className="h-10 px-6 rounded-full bg-blue-600 text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors active:scale-95 md:w-auto w-full"
                >
                  View
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default function PatientAppointments() {
  return (
    <Suspense fallback={<div className="max-w-[1142px] mx-auto px-6 md:px-10 py-16"><AppointmentsSkeleton /></div>}>
      <PatientAppointmentsContent />
    </Suspense>
  )
}
