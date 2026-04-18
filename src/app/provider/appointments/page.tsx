'use client'

import { CalendarDays, Search, Clock, MapPin, Activity, ArrowUpRight, AlertCircle, Calendar } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'
import Image from 'next/image'
import { useUiV2 } from '@/hooks/useUiV2'
import { mapProviderRowForTimeline } from './provider-appointments-utils'
import { ProviderAppointmentsTimelineV2 } from './ProviderAppointmentsTimelineV2'

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-600 bg-emerald-50' },
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50' },
  completed: { label: 'Completed', color: 'text-slate-500 bg-slate-50' },
  cancelled: { label: 'Cancelled', color: 'text-rose-600 bg-rose-50' },
  no_show: { label: 'No Show', color: 'text-rose-600 bg-rose-50' },
}

interface AppointmentRow {
  id: string
  patient_id: string
  visit_type: string
  status: string
  fee_inr: number
  notes: string | null
  created_at: string
  patient: { full_name: string; avatar_url: string | null } | null
  availabilities: { starts_at: string; ends_at: string } | null
  locations: { city: string; name: string } | null
}

async function fetchAppointments(): Promise<{ appointments: AppointmentRow[] }> {
  const res = await fetch('/api/appointments')
  if (!res.ok) throw new Error('Failed to fetch appointments')
  return res.json()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

type TabType = 'upcoming' | 'completed' | 'cancelled'

function filterAppointments(appointments: AppointmentRow[], tab: TabType, search: string) {
  const now = new Date().toISOString()
  return appointments.filter((a) => {
    if (search) {
      const q = search.toLowerCase()
      const name = a.patient?.full_name?.toLowerCase() || ''
      if (!name.includes(q)) return false
    }

    const startsAt = a.availabilities?.starts_at || ''

    switch (tab) {
      case 'upcoming':
        return ['confirmed', 'pending'].includes(a.status) && startsAt >= now
      case 'completed':
        return a.status === 'completed' || (a.status === 'confirmed' && startsAt < now)
      case 'cancelled':
        return ['cancelled', 'no_show'].includes(a.status)
      default:
        return true
    }
  })
}

function ProviderAppointmentsContent() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [search, setSearch] = useState('')
  const uiV2 = useUiV2()
  const [timelineNowMs] = useState(() => Date.now())

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['provider-appointments'],
    queryFn: fetchAppointments,
  })

  const allAppointments = data?.appointments ?? []
  const filtered = filterAppointments(allAppointments, activeTab, search)
  const timelineItems = filtered.map(mapProviderRowForTimeline)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="REGISTRY"
        title="Clinical schedule"
        subtitle="Manage patient sessions and upcoming treatments"
      />

      {/* Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="p-1 px-[5px] bg-[#E2E8F0] rounded-[22px] flex items-center justify-between gap-1 border border-slate-200 shadow-sm w-fit">
          {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-2.5 rounded-[18px] text-[12px] font-black tracking-widest transition-all duration-300 uppercase",
                activeTab === tab
                  ? "bg-white text-[var(--color-pv-primary)] shadow-sm active:scale-95"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative group w-full lg:max-w-sm">
          <input
            type="text"
            placeholder="Search roster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--color-pv-track-bg)] border-none rounded-[var(--sq-lg)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)]/20 transition-all outline-none"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pv-primary)] transition-colors" />
        </div>
      </div>

      <SectionCard role="provider" title={`${activeTab} Sessions`}>
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse bg-slate-50 rounded-[var(--sq-lg)]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            role="provider"
            icon={AlertCircle}
            title="Registry sync failure"
            description="We couldn't synchronize the clinical data."
            cta={{ label: 'Retry', onClick: refetch }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            role="provider"
            icon={Calendar}
            title={`No ${activeTab} sessions`}
            description={search ? "No results match your search query." : `You have no ${activeTab} appointments in the registry.`}
          />
        ) : uiV2 ? (
          <ProviderAppointmentsTimelineV2
            appointments={timelineItems}
            tab={activeTab}
            nowMs={timelineNowMs}
          />
        ) : (
          <div className="divide-y divide-slate-100/50">
            {filtered.map((appt) => {
              const patient = appt.patient
              const startsAt = appt.availabilities?.starts_at
              const statusStyle = STATUS_STYLES[appt.status] || STATUS_STYLES.pending

              return (
                <ListRow
                  key={appt.id}
                  role="provider"
                  icon={
                    <div className="w-12 h-12 rounded-[var(--sq-sm)] bg-slate-100 overflow-hidden flex items-center justify-center text-[var(--color-pv-primary)] text-sm font-black border border-slate-200/50">
                      {patient?.avatar_url ? (
                        <Image src={patient.avatar_url} width={48} height={48} alt="" />
                      ) : (
                        patient?.full_name?.charAt(0) || '?'
                      )}
                    </div>
                  }
                  primary={patient?.full_name || 'Anonymous Patient'}
                  secondary={
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 capitalize">
                        {appt.visit_type === 'home_visit' ? <MapPin size={12} /> : <Activity size={12} />}
                        {appt.visit_type.replace('_', ' ')}
                      </span>
                      {startsAt && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={12} />
                          {formatDate(startsAt)}
                        </span>
                      )}
                    </div>
                  }
                  right={
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="text-[13px] font-black text-slate-900 tracking-tight">₹{appt.fee_inr}</span>
                        {startsAt && (
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                            <Clock size={10} />
                            {formatTime(startsAt)}
                          </span>
                        )}
                      </div>
                      <div className={cn("px-3 py-1 rounded-[var(--sq-xs)] text-[10px] font-black uppercase tracking-widest border", statusStyle.color)}>
                        {statusStyle.label}
                      </div>
                      <Link
                        href={`/provider/appointments/${appt.id}`}
                        className="p-2.5 bg-slate-100 text-slate-400 hover:bg-[var(--color-pv-ink)] hover:text-white rounded-[var(--sq-sm)] transition-all"
                      >
                        <ArrowUpRight size={18} strokeWidth={3} />
                      </Link>
                    </div>
                  }
                />
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

export default function ProviderAppointments() {
  return (
    <Suspense fallback={
       <div className="flex flex-col items-center justify-center py-60">
          <div className="w-16 h-16 rounded-full border-4 border-[var(--color-pv-surface)] border-t-[var(--color-pv-primary)] animate-spin" />
          <p className="mt-8 text-[14px] font-black text-slate-300 uppercase tracking-[0.5em]">Synchronizing deck telemetry...</p>
       </div>
    }>
      <ProviderAppointmentsContent />
    </Suspense>
  )
}
