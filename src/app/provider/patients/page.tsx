'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Phone, Search, UserPlus, Users, CalendarDays, ClipboardList } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AddPatientModal } from '@/components/clinical/AddPatientModal'
import type { PatientRosterRow } from '@/lib/clinical/types'
import {
  PageHeader,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'
import { useUiV2 } from '@/hooks/useUiV2'
import { ProviderPatientsRosterCardV2 } from '@/app/provider/patients/ProviderPatientsRosterCardV2'

async function fetchRoster(includeVisitSeries: boolean): Promise<{ patients: PatientRosterRow[] }> {
  const q = includeVisitSeries ? '?includeVisitSeries=1' : ''
  const res = await fetch(`/api/provider/patients${q}`)
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
  const uiV2 = useUiV2()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['provider-patient-roster', uiV2 ? 'v2' : 'v1'],
    queryFn: () => fetchRoster(uiV2),
  })

  const allPatients = useMemo(() => data?.patients ?? [], [data?.patients])

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return allPatients
    const q = search.toLowerCase()
    return allPatients.filter(
      (p) => p.patient_name.toLowerCase().includes(q) || (p.patient_phone ?? '').includes(q)
    )
  }, [allPatients, search])

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="DIRECTORY"
        title="Patient registry"
        subtitle={isLoading ? "Synchronizing clinical records..." : `Managing ${allPatients.length} active clinical profiles`}
        action={{
          label: 'Add patient',
          icon: UserPlus,
          onClick: () => setShowAdd(true)
        }}
      />

      {/* Roster Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative group w-full lg:max-w-md">
           <input
             type="text"
             placeholder="Search name or phone..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-[var(--color-pv-track-bg)] border-none rounded-[var(--sq-lg)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)]/20 transition-all outline-none"
           />
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pv-primary)] transition-colors" />
        </div>
      </div>

      <SectionCard role="provider" title="Active roster">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full animate-pulse bg-slate-50 rounded-[var(--sq-sm)]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            role="provider"
            icon={AlertCircle}
            title="Handshake failure"
            description="We encountered an error synchronizing the clinical roster."
            cta={{ label: 'Retry sync', onClick: refetch }}
          />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            role="provider"
            icon={Users}
            title={search ? "No matches found" : "Registry is vacant"}
            description={search ? `Your search for "${search}" returned no results.` : "This clinic has no registered patient profiles yet."}
            cta={!search ? { label: 'Register patient', onClick: () => setShowAdd(true) } : undefined}
          />
        ) : uiV2 ? (
          <div className="space-y-4">
            {filteredPatients.map((p) => (
              <ProviderPatientsRosterCardV2
                key={p.profile_id}
                patient={p}
                formatDate={formatDate}
                formatPhone={formatPhone}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100/50">
            {filteredPatients.map((p) => (
              <ListRow
                key={p.profile_id}
                role="provider"
                icon={
                  <div className="w-12 h-12 rounded-[var(--sq-sm)] bg-[var(--color-pv-tile-1-bg)] text-[var(--color-pv-primary)] flex items-center justify-center text-sm font-black border border-[var(--color-pv-tile-1-bg)]/20">
                    {p.patient_name.charAt(0).toUpperCase()}
                  </div>
                }
                primary={p.patient_name}
                secondary={
                   <div className="flex items-center gap-4">
                     <span className="flex items-center gap-1.5"><Phone size={12} /> {formatPhone(p.patient_phone)}</span>
                     {p.chief_complaint && (
                       <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                         <ClipboardList size={12} /> {p.chief_complaint}
                       </span>
                     )}
                   </div>
                }
                right={
                  <div className="flex items-center gap-8">
                     <div className="hidden lg:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Visit</span>
                        <span className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-slate-300" />
                          {formatDate(p.last_visit_date)}
                        </span>
                     </div>
                     <Link
                       href={`/provider/patients/${p.profile_id}`}
                       className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-500 hover:bg-[var(--color-pv-ink)] hover:text-white rounded-full text-[12px] font-bold transition-all group/btn"
                     >
                       Chart
                       <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                     </Link>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </SectionCard>

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

