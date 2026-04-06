'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Users, Loader2, AlertCircle, Phone } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface AppointmentRow {
  id: string
  status: string
  visit_type: string
  created_at: string
  availabilities: { starts_at: string } | null
  patient: {
    id: string
    full_name: string
    phone: string | null
    avatar_url: string | null
  } | null
}

interface PatientRecord {
  id: string
  full_name: string
  phone: string | null
  lastVisit: string | null
  totalVisits: number
  lastAppointmentId: string
  latestAppointmentAt: string
}

async function fetchAppointments(): Promise<{ appointments: AppointmentRow[] }> {
  const res = await fetch('/api/appointments')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

function buildPatientRecords(appointments: AppointmentRow[]): PatientRecord[] {
  const map = new Map<string, PatientRecord>()
  const ignoredStatuses = new Set(['cancelled', 'no_show'])

  const sorted = [...appointments].sort((a, b) => {
    const dateA = a.availabilities?.starts_at ?? a.created_at
    const dateB = b.availabilities?.starts_at ?? b.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  for (const appt of sorted) {
    if (!appt.patient?.id || ignoredStatuses.has(appt.status)) continue

    const patientId = appt.patient.id
    const existing = map.get(patientId)
    const appointmentAt = appt.availabilities?.starts_at ?? appt.created_at
    const isCompletedVisit = appt.status === 'completed'

    if (!existing) {
      const patientName = appt.patient.full_name?.trim() || 'Unknown Patient'

      map.set(patientId, {
        id: patientId,
        full_name: patientName,
        phone: appt.patient.phone ?? null,
        lastVisit: isCompletedVisit ? appointmentAt : null,
        totalVisits: isCompletedVisit ? 1 : 0,
        lastAppointmentId: appt.id,
        latestAppointmentAt: appointmentAt,
      })
    } else {
      map.set(patientId, {
        ...existing,
        totalVisits: existing.totalVisits + (isCompletedVisit ? 1 : 0),
        lastVisit: existing.lastVisit ?? (isCompletedVisit ? appointmentAt : null),
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const leftSortValue = a.lastVisit ?? a.latestAppointmentAt
    const rightSortValue = b.lastVisit ?? b.latestAppointmentAt
    return new Date(rightSortValue).getTime() - new Date(leftSortValue).getTime()
  })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatPhone(phone: string | null) {
  if (!phone) return '—'
  // Ensure +91 prefix is shown
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  return phone
}

export default function ProviderPatients() {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-patients'],
    queryFn: fetchAppointments,
  })

  const allPatients = useMemo(
    () => buildPatientRecords(data?.appointments ?? []),
    [data]
  )

  const patients = useMemo(() => {
    if (!search.trim()) return allPatients
    const q = search.toLowerCase()
    return allPatients.filter(
      (p) => p.full_name.toLowerCase().includes(q) || (p.phone ?? '').includes(q)
    )
  }, [allPatients, search])

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-bp-primary tracking-tight mb-1">
            Patient Records
          </h1>
          <p className="text-[15px] text-bp-body">
            {isLoading ? 'Loading…' : `${allPatients.length} patient${allPatients.length !== 1 ? 's' : ''} in your directory`}
          </p>
        </div>
        <div className="relative shrink-0">
          <input
            type="search"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[280px] pl-11 pr-4 py-2.5 rounded-full border border-bp-border bg-white text-[14px] text-bp-primary focus:border-bp-accent focus:ring-1 focus:ring-bp-accent outline-none transition-shadow"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
        </div>
      )}

      {isError && (
        <div className="bg-[#FEF2F2] rounded-[12px] border border-[#FECACA] p-6 text-center">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto mb-3" />
          <p className="text-[15px] font-medium text-bp-primary">Failed to load patient records</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Please try refreshing the page.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white rounded-[12px] border border-bp-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-bp-border">
                <tr>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Phone (+91)</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Total Visits</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-bp-accent/10 text-bp-accent flex items-center justify-center text-[14px] font-bold shrink-0">
                            {p.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[14px] font-medium text-bp-primary">{p.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[14px] text-bp-body">
                          {p.phone && <Phone className="w-3.5 h-3.5 text-bp-body/40" />}
                          {formatPhone(p.phone)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-bp-body">{formatDate(p.lastVisit)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bp-accent/10 text-bp-accent">
                          {p.totalVisits} visit{p.totalVisits !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/provider/appointments/${p.lastAppointmentId}`}
                          className="text-[13px] font-semibold text-bp-accent hover:text-bp-primary transition-colors"
                        >
                          View last appointment
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-[#9CA3AF]" />
                        </div>
                        <p className="text-[15px] font-medium text-bp-primary mb-1">
                          {search ? 'No patients match your search' : 'No patients yet'}
                        </p>
                        <p className="text-[13px] text-[#9CA3AF]">
                          {search ? 'Try a different name or phone number.' : 'Patients appear here after their first appointment.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
