'use client'

import { CalendarDays, Search, Filter, Clock, MapPin, Activity, MoreHorizontal, ArrowUpRight, Loader2, type LucideIcon } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-bp-accent/10 text-bp-accent border-bp-accent/20',
  cancelled: 'bg-bp-surface text-bp-body/40 border-bp-border',
  no_show: 'bg-red-50 text-red-600 border-red-100',
}

const VISIT_TYPE_ICONS: Record<string, LucideIcon> = {
  in_clinic: Activity,
  home_visit: MapPin,
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
    // Search filter
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-appointments'],
    queryFn: fetchAppointments,
  })

  const allAppointments = data?.appointments ?? []
  const filtered = filterAppointments(allAppointments, activeTab, search)

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-bp-border rounded-full text-[10px] font-bold uppercase text-bp-accent tracking-widest shadow-sm">
            <Activity size={12} strokeWidth={3} />
            Session Management Hub
          </div>
          <h1 className="text-[36px] md:text-[42px] font-bold text-bp-primary leading-none tracking-tighter">
            Patient <span className="text-bp-accent">Consultations</span>
          </h1>
          <p className="text-[15px] font-bold text-bp-body/40 max-w-[500px]">
            View and manage your practice sessions and patient follow-ups.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-bp-body/40 group-focus-within:text-bp-accent transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[280px] pl-12 pr-6 py-4 rounded-[22px] border border-bp-border bg-white font-bold text-[14px] text-bp-primary placeholder:text-bp-body/40 focus:border-bp-accent/20 focus:ring-4 focus:ring-bp-accent/5 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="h-[58px] px-8 bg-white border border-bp-border rounded-[22px] flex items-center gap-3 text-[14px] font-bold text-bp-primary hover:bg-bp-surface transition-all shadow-sm">
            <Filter size={18} />
            Insights
          </button>
        </div>
      </div>

      <div className="mb-10 p-1.5 bg-bp-surface rounded-[28px] inline-flex items-center gap-1 border border-bp-border shadow-sm">
        {(['upcoming', 'completed', 'cancelled'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "px-10 py-3.5 rounded-[24px] text-[14px] font-bold tracking-tight transition-all duration-300 capitalize",
              activeTab === t
                ? "bg-bp-primary text-white shadow-xl shadow-gray-900/10 ring-1 ring-black/5"
                : "text-bp-body/40 hover:text-bp-body font-bold"
            )}
          >
            {t} Flow
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[44px] border border-bp-border overflow-hidden shadow-[0_32px_80px_-24px_rgba(0,0,0,0.06)] relative px-0 md:px-6 py-6 transition-all duration-500">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
          </div>
        )}

        {isError && (
          <div className="py-24 text-center">
            <p className="text-[15px] font-bold text-red-500">Failed to load appointments. Please refresh.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-bp-body/30 uppercase text-[10px] font-bold tracking-[0.2em]">
                  <th className="px-6 pb-2">Patient Details</th>
                  <th className="px-6 pb-2">Schedule</th>
                  <th className="px-6 pb-2">Treatment Type</th>
                  <th className="px-6 pb-2">Fee</th>
                  <th className="px-6 pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-20">
                        <Activity size={64} strokeWidth={1} />
                        <p className="text-[20px] font-bold tracking-tight">No {activeTab} appointments</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt) => {
                    const patientName = appt.patient?.full_name || 'Unknown Patient'
                    const initial = patientName.charAt(0)
                    const startsAt = appt.availabilities?.starts_at
                    return (
                      <tr key={appt.id} className="group hover:scale-[1.005] transition-all duration-300">
                        <td className="px-6 py-5 bg-[#FCFCFC] border-y border-l border-bp-border rounded-l-[32px]">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-bp-accent/10 flex items-center justify-center text-bp-accent text-[18px] font-bold shadow-sm group-hover:scale-105 transition-transform">
                              {initial}
                            </div>
                            <div>
                              <p className="text-[17px] font-bold text-bp-primary tracking-tight leading-none mb-1.5">{patientName}</p>
                              <div className="flex items-center gap-2">
                                <div className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border shadow-sm", STATUS_STYLES[appt.status] || STATUS_STYLES.pending)}>
                                  {appt.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 bg-[#FCFCFC] border-y border-bp-border">
                          {startsAt ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[15px] font-bold text-bp-primary">
                                <CalendarDays size={16} className="text-bp-body/30" />
                                {formatDate(startsAt)}
                              </div>
                              <div className="flex items-center gap-2 text-[13px] font-bold text-bp-body/40">
                                <Clock size={14} className="text-bp-body/30" />
                                {formatTime(startsAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[13px] text-bp-body/40">No slot info</span>
                          )}
                        </td>
                        <td className="px-6 py-5 bg-[#FCFCFC] border-y border-bp-border">
                          <div className="flex items-center gap-3 py-2 px-4 bg-white border border-bp-border rounded-2xl w-fit shadow-sm">
                            {(() => {
                              const Icon = VISIT_TYPE_ICONS[appt.visit_type] || Activity
                              return <Icon size={16} className="text-bp-body/40" />
                            })()}
                            <span className="text-[12px] font-bold text-bp-primary uppercase tracking-widest">{appt.visit_type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 bg-[#FCFCFC] border-y border-bp-border">
                          <span className="text-[15px] font-bold text-bp-primary">₹{appt.fee_inr}</span>
                        </td>
                        <td className="px-6 py-5 bg-[#FCFCFC] border-y border-r border-bp-border rounded-r-[32px] text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-12 h-12 bg-white border border-bp-border rounded-2xl flex items-center justify-center text-bp-body/40 hover:text-bp-accent hover:border-bp-accent/20 transition-all shadow-sm">
                              <MoreHorizontal size={20} />
                            </button>
                            <Link href={`/provider/appointments/${appt.id}`} className="h-12 px-6 bg-bp-primary text-white rounded-2xl text-[13px] font-bold flex items-center gap-3 hover:bg-bp-accent transition-all shadow-lg active:scale-95 group/view">
                              View
                              <ArrowUpRight size={18} strokeWidth={3} className="text-bp-accent/70 group-hover/view:rotate-12 transition-transform" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProviderAppointments() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-bp-body/40">Loading appointments...</div>}>
      <ProviderAppointmentsContent />
    </Suspense>
  )
}
