'use client'

import { CalendarDays, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  filterByTab,
  parseTab,
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
  type AppointmentTab,
} from './appointments-utils'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-[#F5F5F5] text-[#999999]',
  no_show: 'bg-[#F5F5F5] text-[#999999]',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'In Clinic',
  home_visit: 'Home Visit',
  online: 'Online',
}

const VISIT_TYPE_COLORS: Record<string, string> = {
  in_clinic: 'bg-[#E6F4F3] text-[#00766C]',
  home_visit: 'bg-[#FFF3EE] text-[#FF6B35]',
  online: 'bg-[#EEF2FF] text-[#4F46E5]',
}

function AppointmentsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[12px] border border-[#E5E5E5] p-5 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-16 bg-gray-200 rounded-full animate-pulse shrink-0" />
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

  const fetchAppointments = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: AppointmentItem[] }) => setAppointments(data.appointments ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  function switchTab(next: AppointmentTab) {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filtered = filterByTab(appointments, tab)

  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">Appointments</h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-[#E5E5E5]">
        <nav className="flex gap-8" aria-label="Appointment tabs">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`py-4 text-[15px] border-b-2 outline-none cursor-pointer transition-colors capitalize ${
                tab === t
                  ? 'font-semibold text-[#00766C] border-[#00766C]'
                  : 'font-medium text-[#666666] border-transparent hover:text-[#333333] hover:border-[#E5E5E5]'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <AppointmentsSkeleton />
      ) : error ? (
        <div className="bg-white border border-[#E5E5E5] rounded-[12px] shadow-sm py-16 px-8 text-center">
          <AlertCircle className="w-10 h-10 text-[#CC3300] mx-auto mb-4" />
          <p className="text-[16px] font-semibold text-[#333333] mb-2">Could not load appointments</p>
          <button
            type="button"
            onClick={fetchAppointments}
            className="mt-2 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full text-[14px] font-semibold transition-colors cursor-pointer outline-none"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-[12px] shadow-sm py-16 px-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-5">
            <CalendarDays className="w-8 h-8 text-[#9CA3AF]" />
          </div>
          <h2 className="text-[20px] font-bold text-[#333333] mb-2">
            No {tab} appointments
          </h2>
          <p className="text-[15px] text-[#666666] mb-6">
            {tab === 'upcoming'
              ? 'When you book an appointment, it will show up here.'
              : 'Completed appointments will appear here.'}
          </p>
          {tab === 'upcoming' && (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[15px] transition-colors"
            >
              Find a Physiotherapist
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <p className="text-[16px] font-semibold text-[#333333]">{providerDisplayName(appt)}</p>
                <p className="text-[13px] text-[#666666] mt-0.5">
                  {appt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
                </p>
                {appt.availabilities?.starts_at && (
                  <p className="text-[13px] text-[#00766C] font-medium mt-1">
                    📅 {formatApptDate(appt.availabilities.starts_at)}
                  </p>
                )}
                <p className="text-[13px] text-[#666666] mt-0.5">₹{appt.fee_inr}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${VISIT_TYPE_COLORS[appt.visit_type] ?? 'bg-[#F5F5F5] text-[#555]'}`}>
                    {VISIT_TYPE_LABELS[appt.visit_type] ?? appt.visit_type}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[appt.status] ?? appt.status}
                  </span>
                </div>
              </div>
              <Link
                href={`/patient/appointments/${appt.id}`}
                className="px-4 py-2 rounded-[24px] border border-[#00766C] text-[#00766C] text-[13px] font-semibold no-underline hover:bg-[#E6F4F3] transition-colors shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PatientAppointments() {
  return (
    <Suspense fallback={<div className="max-w-[1142px] mx-auto px-6 py-12"><AppointmentsSkeleton /></div>}>
      <PatientAppointmentsContent />
    </Suspense>
  )
}
