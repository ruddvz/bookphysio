'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Users, Loader2, AlertCircle, Phone, UserPlus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AddPatientModal } from '@/components/clinical/AddPatientModal'
import type { PatientRosterRow } from '@/lib/clinical/types'

async function fetchRoster(): Promise<{ patients: PatientRosterRow[] }> {
  const res = await fetch('/api/provider/patients')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
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
  const [showAdd, setShowAdd] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-patient-roster'],
    queryFn: fetchRoster,
  })

  const allPatients = data?.patients ?? []

  const patients = useMemo(() => {
    if (!search.trim()) return allPatients
    const q = search.toLowerCase()
    return allPatients.filter(
      (p) => p.patient_name.toLowerCase().includes(q) || (p.patient_phone ?? '').includes(q)
    )
  }, [allPatients, search])

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-1">Patient Records</h1>
          <p className="text-[15px] text-bp-body">
            {isLoading
              ? 'Loading…'
              : `${allPatients.length} patient${allPatients.length !== 1 ? 's' : ''} in your directory`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <input
              type="search"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[260px] pl-11 pr-4 py-2.5 rounded-full border border-bp-border bg-white text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-bp-accent outline-none transition-shadow"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-[14px] font-semibold hover:bg-emerald-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}

      {isError && (
        <div className="bg-[#FEF2F2] rounded-[12px] border border-[#FECACA] p-6 text-center">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto mb-3" />
          <p className="text-[15px] font-medium text-slate-900">Failed to load patient records</p>
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
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Chief Complaint</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Visits</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <tr key={p.profile_id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[14px] font-bold shrink-0">
                            {p.patient_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-slate-900">{p.patient_name}</p>
                            {p.patient_age && (
                              <p className="text-[12px] text-slate-500">Age {p.patient_age}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[14px] text-bp-body">
                          {p.patient_phone && <Phone className="w-3.5 h-3.5 text-bp-body/40" />}
                          {formatPhone(p.patient_phone)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-bp-body max-w-[240px] truncate">
                        {p.chief_complaint ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-bp-body">{formatDate(p.last_visit_date)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-600">
                          {p.visit_count} visit{p.visit_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/provider/patients/${p.profile_id}`}
                          className="text-[13px] font-semibold text-emerald-600 hover:text-slate-900 transition-colors"
                        >
                          Open chart →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-[#9CA3AF]" />
                        </div>
                        <p className="text-[15px] font-medium text-slate-900 mb-1">
                          {search ? 'No patients match your search' : 'No patients yet'}
                        </p>
                        <p className="text-[13px] text-[#9CA3AF]">
                          {search ? 'Try a different name or phone number.' : 'Add your first patient to get started.'}
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

      {showAdd && (
        <AddPatientModal
          onClose={() => setShowAdd(false)}
          onCreated={(profileId) => {
            setShowAdd(false)
            queryClient.invalidateQueries({ queryKey: ['provider-patient-roster'] })
            window.location.href = `/provider/patients/${profileId}`
          }}
        />
      )}
    </div>
  )
}
