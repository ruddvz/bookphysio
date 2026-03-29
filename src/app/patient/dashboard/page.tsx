'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Search, Calendar, Users, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Appointment {
  id: string
  status: string
  visit_type: string
  fee_inr: number
  availabilities: { starts_at: string } | null
  providers: {
    users: { full_name: string } | null
    specialties?: { name: string }[]
  } | null
  locations: { city: string } | null
}

export default function PatientDashboardHome() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const displayName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: Appointment[] }) => setAppointments(data.appointments ?? []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
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

  function formatApptDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  function providerName(appt: Appointment) {
    const name = appt.providers?.users?.full_name ?? 'Doctor'
    return name.startsWith('Dr.') ? name : `Dr. ${name}`
  }

  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      {/* Greeting */}
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        {greeting}, {displayName} 👋
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">

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

          {/* Past Providers / Care Team */}
          <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
            <h2 className="text-[18px] font-bold text-[#333333] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00766C]" />
              Your Care Team
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-[#666666] text-[14px]">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
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
                      <p className="text-[14px] font-semibold text-[#333333]">{providerName(a)}</p>
                      <p className="text-[12px] text-[#666666]">
                        {a.availabilities?.starts_at ? formatApptDate(a.availabilities.starts_at) : 'Past'}
                      </p>
                    </div>
                    <Link href="/search" className="text-[13px] text-[#00766C] font-medium no-underline hover:text-[#005A52]">
                      Rebook
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/search"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[14px] transition-colors"
            >
              <Search className="w-4 h-4" />
              Find a Physiotherapist
            </Link>
          </section>
        </div>

        {/* Right Column: Upcoming */}
        <aside className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00766C]" />
              Upcoming
            </h2>
            {upcoming.length > 0 && (
              <Link href="/patient/appointments" className="text-[13px] text-[#00766C] font-medium no-underline hover:text-[#005A52]">
                View all
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#666666]">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-[14px]">Loading appointments…</span>
            </div>
          ) : nextAppt ? (
            <div className="rounded-[8px] border border-[#E5E5E5] p-4">
              <p className="text-[15px] font-semibold text-[#333333] mb-1">{providerName(nextAppt)}</p>
              <p className="text-[13px] text-[#666666] mb-1">
                {nextAppt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
              </p>
              {nextAppt.availabilities?.starts_at && (
                <p className="text-[13px] text-[#00766C] font-medium mb-3">
                  📅 {formatApptDate(nextAppt.availabilities.starts_at)}
                </p>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/patient/appointments/${nextAppt.id}`}
                  className="flex-1 text-center py-2 rounded-[24px] border border-[#00766C] text-[#00766C] text-[13px] font-medium no-underline hover:bg-[#E6F4F3] transition-colors"
                >
                  View Details
                </Link>
              </div>
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
