'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { CalendarDays, Users, Clock, AlertCircle, UserCircle, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  filterToday,
  filterThisWeek,
  getNextAppointment,
  formatAppointmentCount,
  formatSlotTime,
  patientDisplayName,
  type ProviderAppointment,
} from './provider-dashboard-utils'

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

function DashboardSkeleton() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12">
      <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-8" />
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      {/* Timeline */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-5" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-[#F5F5F5] last:border-0">
            <div className="h-4 w-14 bg-gray-200 rounded animate-pulse shrink-0" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProviderDashboardHome() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Doctor'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const fetchAppointments = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: ProviderAppointment[] }) =>
        setAppointments(data.appointments ?? [])
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  if (loading) return <DashboardSkeleton />

  const todayAppts = filterToday(appointments)
  const weekAppts = filterThisWeek(appointments)
  const nextAppt = getNextAppointment(todayAppts)

  // Unique patients this week by id (fall back to counting appointments)
  const weekPatientCount = weekAppts.length

  // Sort timeline chronologically
  const timeline = [...todayAppts].sort((a, b) => {
    const as = a.availabilities?.starts_at ?? ''
    const bs = b.availabilities?.starts_at ?? ''
    return as < bs ? -1 : 1
  })

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      {/* Greeting */}
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        {greeting}, {displayName} 👋
      </h1>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-5 py-3">
          <div className="flex items-center gap-2 text-[#DC2626] text-[14px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Could not load appointments
          </div>
          <button
            type="button"
            onClick={fetchAppointments}
            className="text-[13px] font-semibold text-[#DC2626] underline underline-offset-2 hover:text-[#B91C1C] transition-colors cursor-pointer outline-none"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Today's appointments */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-5">
          <p className="flex items-center gap-2 text-[13px] font-medium text-[#666666] mb-2">
            <CalendarDays className="w-4 h-4 text-[#00766C]" />
            Today
          </p>
          <p className="text-[28px] font-bold text-[#333333] leading-none">
            {todayAppts.length}
          </p>
          <p className="text-[13px] text-[#666666] mt-1">
            {formatAppointmentCount(todayAppts.length)}
          </p>
        </div>

        {/* Next appointment */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-5">
          <p className="flex items-center gap-2 text-[13px] font-medium text-[#666666] mb-2">
            <Clock className="w-4 h-4 text-[#00766C]" />
            Next Appointment
          </p>
          {nextAppt?.availabilities?.starts_at ? (
            <>
              <p className="text-[28px] font-bold text-[#333333] leading-none">
                {formatSlotTime(nextAppt.availabilities.starts_at)}
              </p>
              <p className="text-[13px] text-[#666666] mt-1 truncate">
                {patientDisplayName(nextAppt)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[20px] font-semibold text-[#9CA3AF] leading-none mt-1">—</p>
              <p className="text-[13px] text-[#666666] mt-1">None today</p>
            </>
          )}
        </div>

        {/* Patients this week */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-5">
          <p className="flex items-center gap-2 text-[13px] font-medium text-[#666666] mb-2">
            <Users className="w-4 h-4 text-[#00766C]" />
            This Week
          </p>
          <p className="text-[28px] font-bold text-[#333333] leading-none">
            {weekPatientCount}
          </p>
          <p className="text-[13px] text-[#666666] mt-1">
            {formatAppointmentCount(weekPatientCount)}
          </p>
        </div>
      </div>

      {/* Today's Schedule Timeline */}
      <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 mb-8">
        <h2 className="text-[18px] font-bold text-[#333333] mb-5 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#00766C]" />
          Today&apos;s Schedule
        </h2>

        {timeline.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
              <CalendarDays className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#333333] mb-1">No appointments today</p>
            <p className="text-[14px] text-[#666666]">Your schedule is clear for today.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {timeline.map((appt, idx) => (
              <div
                key={appt.id}
                className={`flex items-center gap-4 py-3 ${idx < timeline.length - 1 ? 'border-b border-[#F5F5F5]' : ''}`}
              >
                {/* Time */}
                <span className="text-[14px] font-semibold text-[#333333] w-16 shrink-0 tabular-nums">
                  {appt.availabilities?.starts_at
                    ? formatSlotTime(appt.availabilities.starts_at)
                    : '—'}
                </span>

                {/* Patient name */}
                <span className="text-[14px] text-[#333333] flex-1 truncate">
                  {patientDisplayName(appt)}
                </span>

                {/* Visit type badge */}
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                    VISIT_TYPE_COLORS[appt.visit_type] ?? 'bg-[#F5F5F5] text-[#555]'
                  }`}
                >
                  {VISIT_TYPE_LABELS[appt.visit_type] ?? appt.visit_type}
                </span>

                {/* Detail link */}
                <Link
                  href={`/provider/appointments`}
                  className="text-[12px] text-[#00766C] font-medium no-underline hover:text-[#005A52] shrink-0"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Setup Checklist (collapsible, for new providers) */}
      <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setChecklistOpen((v) => !v)}
          className="w-full px-6 py-4 flex justify-between items-center cursor-pointer bg-transparent border-none outline-none hover:bg-[#F9FAFB] transition-colors"
        >
          <span className="text-[16px] font-semibold text-[#333333]">Setup checklist</span>
          {checklistOpen
            ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
            : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
          }
        </button>

        {checklistOpen && (
          <div className="border-t border-[#E5E5E5] px-6 pb-6 pt-5 flex flex-col gap-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0">
                  <UserCircle className="w-4 h-4 text-[#00766C]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#333333]">Complete your profile</p>
                  <p className="text-[13px] text-[#666666]">Add qualifications and photo to attract patients.</p>
                </div>
              </div>
              <Link
                href="/provider/profile"
                className="shrink-0 px-4 py-2 border border-[#E5E5E5] rounded-lg bg-white text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors no-underline"
              >
                Go →
              </Link>
            </div>

            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 text-[#00766C]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#333333]">Set your availability</p>
                  <p className="text-[13px] text-[#666666]">Choose your working hours so patients can book you.</p>
                </div>
              </div>
              <Link
                href="/provider/availability"
                className="shrink-0 px-4 py-2 border border-[#E5E5E5] rounded-lg bg-white text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors no-underline"
              >
                Go →
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
