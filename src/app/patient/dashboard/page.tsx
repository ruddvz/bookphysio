'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Search, Calendar, Users, ArrowRight, AlertCircle, CalendarPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatApptDate, providerDisplayName } from './dashboard-utils'
import { DashboardSkeleton } from './DashboardSkeleton'

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface Appointment {
  id: string
  status: string
  visit_type: VisitType
  fee_inr: number
  availabilities: { starts_at: string } | null
  providers: {
    users: { full_name: string } | null
    specialties?: { name: string }[]
  } | null
  locations: { city: string } | null
}

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  in_clinic: 'In Clinic',
  home_visit: 'Home Visit',
  online: 'Online',
}

const VISIT_TYPE_COLORS: Record<VisitType, string> = {
  in_clinic: 'bg-[#E6F4F3] text-[#00766C]',
  home_visit: 'bg-[#FFF3EE] text-[#FF6B35]',
  online: 'bg-[#EEF2FF] text-[#4F46E5]',
}

export default function PatientDashboardHome() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const displayName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function fetchAppointments() {
    setLoading(true)
    setError(false)
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: Appointment[] }) => setAppointments(data.appointments ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const now = new Date()
  const upcoming = appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    return a.status !== 'cancelled' && start && new Date(start) >= now
  })
  const past = appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    return a.status === 'completed' || (start && new Date(start) < now)
  })
  const nextAppt = upcoming[0] ?? null

  if (loading) return <DashboardSkeleton />

  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      {/* Greeting */}
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        {greeting}, {displayName} 👋
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Care home banner */}
          <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
            <h2 className="text-[20px] font-bold text-[#333333] mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#00766C]" />
              Your Care Home
            </h2>
            <div className="bg-gradient-to-r from-[#E6F4F3] to-[#D5EFED] p-5 rounded-[10px] flex items-center gap-4">
              <div className="text-[32px] shrink-0">💪</div>
              <div>
                <p className="text-[16px] font-semibold text-[#005A52] mb-1">Keep moving forward</p>
                <p className="text-[14px] text-[#005A52]/80">
                  Book your next physiotherapy session to stay on track with your recovery goals.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
            <h2 className="text-[18px] font-bold text-[#333333] mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[14px] transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Book New Appointment
              </Link>
              <Link
                href="/patient/appointments"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#00766C] text-[#00766C] hover:bg-[#E6F4F3] rounded-full no-underline font-semibold text-[14px] transition-colors"
              >
                <Calendar className="w-4 h-4" />
                View All Appointments
              </Link>
            </div>
          </section>

          {/* Care Team / Past Providers */}
          <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
            <h2 className="text-[18px] font-bold text-[#333333] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00766C]" />
              Your Care Team
            </h2>

            {error ? (
              <div className="flex flex-col items-start gap-3 py-4">
                <div className="flex items-center gap-2 text-[#CC3300] text-[14px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Could not load appointments
                </div>
                <button
                  type="button"
                  onClick={fetchAppointments}
                  className="text-[13px] font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-2 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : past.length === 0 ? (
              <p className="text-[14px] text-[#666666] leading-relaxed">
                You don&apos;t have any past providers yet. Once you book a session, they will appear here for easy re-booking.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {past.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
                    <div>
                      <p className="text-[14px] font-semibold text-[#333333]">{providerDisplayName(a)}</p>
                      <p className="text-[12px] text-[#666666]">
                        {a.availabilities?.starts_at ? formatApptDate(a.availabilities.starts_at) : 'Past session'}
                      </p>
                    </div>
                    <Link href="/search" className="text-[13px] text-[#00766C] font-medium no-underline hover:text-[#005A52]">
                      Rebook
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {!error && (
              <Link
                href="/search"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[14px] transition-colors"
              >
                <Search className="w-4 h-4" />
                Find a Physiotherapist
              </Link>
            )}
          </section>
        </div>

        {/* Right Column: Upcoming */}
        <aside className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00766C]" />
              Upcoming
            </h2>
            {upcoming.length > 1 && (
              <Link href="/patient/appointments" className="text-[13px] text-[#00766C] font-medium no-underline hover:text-[#005A52]">
                View all
              </Link>
            )}
          </div>

          {nextAppt ? (
            <div className="rounded-[8px] border border-[#E5E5E5] p-4">
              <p className="text-[15px] font-semibold text-[#333333] mb-1">{providerDisplayName(nextAppt)}</p>
              <p className="text-[13px] text-[#666666] mb-2">
                {nextAppt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
              </p>

              {/* Visit type badge */}
              <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2 ${VISIT_TYPE_COLORS[nextAppt.visit_type]}`}>
                {VISIT_TYPE_LABELS[nextAppt.visit_type]}
              </span>

              {nextAppt.availabilities?.starts_at && (
                <p className="text-[13px] text-[#00766C] font-medium mb-1">
                  📅 {formatApptDate(nextAppt.availabilities.starts_at)}
                </p>
              )}

              <p className="text-[13px] text-[#666666] mb-3">₹{nextAppt.fee_inr}</p>

              <Link
                href={`/patient/appointments/${nextAppt.id}`}
                className="block text-center py-2 rounded-[24px] border border-[#00766C] text-[#00766C] text-[13px] font-medium no-underline hover:bg-[#E6F4F3] transition-colors"
              >
                View Details
              </Link>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-semibold text-[#333333] mb-1">No upcoming appointments</p>
              <p className="text-[14px] text-[#666666]">Need to see a physio?</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 mt-4 text-[14px] font-semibold text-[#00766C] hover:text-[#005A52] no-underline transition-colors"
              >
                Book a session
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
