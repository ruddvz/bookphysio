'use client'

import { CalendarDays, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
  online: 'Online',
}

export default function PatientAppointments() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: Appointment[] }) => setAppointments(data.appointments ?? []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const filtered = appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    if (tab === 'upcoming') {
      return a.status !== 'cancelled' && start && new Date(start) >= now
    }
    return a.status === 'completed' || a.status === 'cancelled' || (start && new Date(start) < now)
  })

  function providerName(appt: Appointment) {
    const name = appt.providers?.users?.full_name ?? 'Doctor'
    return name.startsWith('Dr.') ? name : `Dr. ${name}`
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">Appointments</h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-[#E5E5E5]">
        <nav className="flex gap-8" aria-label="Tabs">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`py-4 text-[15px] font-${tab === t ? 'semibold' : 'medium'} border-b-2 outline-none cursor-pointer transition-colors capitalize ${
                tab === t
                  ? 'text-[#00766C] border-[#00766C]'
                  : 'text-[#666666] border-transparent hover:text-[#333333] hover:border-[#E5E5E5]'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#666666]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-[15px]">Loading appointments…</span>
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
            {tab === 'upcoming' ? 'When you book an appointment, it will show up here.' : 'Completed appointments will appear here.'}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[15px] transition-colors"
          >
            Find a Physiotherapist
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((appt) => (
            <div key={appt.id} className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[16px] font-semibold text-[#333333]">{providerName(appt)}</p>
                <p className="text-[13px] text-[#666666] mt-0.5">
                  {appt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
                </p>
                {appt.availabilities?.starts_at && (
                  <p className="text-[13px] text-[#00766C] font-medium mt-1">
                    📅 {formatDate(appt.availabilities.starts_at)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] bg-[#F5F5F5] text-[#555] px-2 py-0.5 rounded-full">
                    {VISIT_TYPE_LABELS[appt.visit_type] ?? appt.visit_type}
                  </span>
                  <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {appt.status}
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
