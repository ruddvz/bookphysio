"use client"

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Plus, X, Clock } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import type { ScheduleEntry, PatientRosterRow } from '@/lib/clinical/types'
import {
  HOURS,
  formatHour,
  getWeekDates,
  formatMonthRange,
  formatDay,
  isSameDay,
  dateKey,
  timeToHour,
} from './calendar-utils'
import {
  PageHeader,
  SectionCard,
} from '@/components/dashboard/primitives'

async function fetchSchedule(start: string, end: string): Promise<ScheduleEntry[]> {
  const res = await fetch(`/api/provider/schedule?start=${start}&end=${end}`)
  if (!res.ok) throw new Error('Failed to load schedule')
  const data = await res.json()
  return data.entries ?? []
}

async function fetchPatients(): Promise<PatientRosterRow[]> {
  const res = await fetch('/api/provider/patients')
  if (!res.ok) throw new Error('Failed to load patients')
  const data = await res.json()
  return data.patients ?? []
}

interface NewVisit {
  profile_id: string
  visit_date: string
  visit_time: string
  fee_inr: string
}

const EMPTY_NEW_VISIT: NewVisit = {
  profile_id: '',
  visit_date: '',
  visit_time: '',
  fee_inr: '',
}

const DEFAULT_BOOKING_HOUR = HOURS[1] ?? HOURS[0] ?? 9

export default function ProviderSchedule() {
  const queryClient = useQueryClient()
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<NewVisit>(EMPTY_NEW_VISIT)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const days = getWeekDates(anchor)
  const today = new Date()
  const startDate = dateKey(days[0])
  const endDate = dateKey(days[6])

  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['provider-schedule', startDate, endDate],
    queryFn: () => fetchSchedule(startDate, endDate),
  })

  const { data: patients } = useQuery({
    queryKey: ['provider-patients-roster'],
    queryFn: fetchPatients,
    staleTime: 30_000,
  })

  const grid = useMemo(() => {
    const g: Record<string, Record<number, ScheduleEntry[]>> = {}
    for (const e of entries ?? []) {
      const h = timeToHour(e.visit_time)
      if (h < HOURS[0] || h > HOURS[HOURS.length - 1]) continue
      g[e.visit_date] ??= {}
      g[e.visit_date][h] ??= []
      g[e.visit_date][h].push(e)
    }
    return g
  }, [entries])

  const weekTotalRupees = (entries ?? []).reduce((s, e) => s + (e.fee_inr ?? 0), 0)

  /* Mobile: track selected day index (0–6) for the day-list view */
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const todayIdx = days.findIndex((d) => isSameDay(d, new Date()))
    return todayIdx >= 0 ? todayIdx : 0
  })
  const mobileSelectedDay = days[mobileDayIndex] ?? days[0]
  const mobileSelectedKey = dateKey(mobileSelectedDay)
  const mobileDayEntries = (entries ?? [])
    .filter((e) => e.visit_date === mobileSelectedKey)
    .sort((a, b) => a.visit_time.localeCompare(b.visit_time))

  function prevWeek() {
    setAnchor((a) => { const d = new Date(a); d.setDate(d.getDate() - 7); return d })
  }
  function nextWeek() {
    setAnchor((a) => { const d = new Date(a); d.setDate(d.getDate() + 7); return d })
  }
  function goToday() {
    setAnchor(new Date())
  }

  function openModalForCell(date: string, hour: number) {
    setDraft({
      profile_id: '',
      visit_date: date,
      visit_time: `${String(hour).padStart(2, '0')}:00`,
      fee_inr: '',
    })
    setSaveError(null)
    setModalOpen(true)
  }

  function openBlankModal() {
    setDraft({
      ...EMPTY_NEW_VISIT,
      visit_date: dateKey(today),
      visit_time: '09:00',
    })
    setSaveError(null)
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/provider/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: draft.profile_id,
          visit_date: draft.visit_date,
          visit_time: draft.visit_time,
          fee_inr: draft.fee_inr ? parseInt(draft.fee_inr, 10) : null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? 'Failed to schedule visit')
      }
      await queryClient.invalidateQueries({ queryKey: ['provider-schedule'] })
      setModalOpen(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to schedule visit')
    } finally {
      setSaving(false)
    }
  }

  const canSave =
    draft.profile_id.length > 0 &&
    draft.visit_date.length > 0 &&
    draft.visit_time.length > 0

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="CLINICAL HOURS"
        title="Session schedule"
        subtitle="Manage your weekly visit volume and patient availability"
        action={{
          label: 'Book session',
          icon: Plus,
          onClick: openBlankModal
        }}
      />

      <SectionCard
        role="provider"
        title={formatMonthRange(days)}
        className="overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              aria-label="Previous week"
              className="p-2 rounded-[var(--sq-sm)] border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToday}
              className="px-4 py-2 rounded-[var(--sq-sm)] border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextWeek}
              aria-label="Next week"
              className="p-2 rounded-[var(--sq-sm)] border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-pv-primary)]" />
                Confirmed
             </div>
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-slate-100 border border-slate-200" />
               Open slot
             </div>
             <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-[var(--sq-xs)]">
               Expected revenue: <span className="text-[var(--color-pv-primary)]">₹{weekTotalRupees.toLocaleString('en-IN')}</span>
             </div>
          </div>
        </div>

        <div className="border border-slate-100 rounded-[var(--sq-lg)] overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-pv-primary)]" />
              <p className="mt-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest">Syncing calendar...</p>
            </div>
          ) : isError ? (
            <div className="py-24 text-center bg-slate-50/50">
              <p className="text-[15px] font-bold text-slate-900 mb-4">Calendar sync failed</p>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['provider-schedule'] })}
                className="px-6 py-2 bg-[var(--color-pv-primary)] text-white text-[13px] font-bold rounded-full"
              >
                Retry sync
              </button>
            </div>
          ) : (
            <>
              {/* ── Mobile day-list view (< lg) ── */}
              <div className="lg:hidden">
                {/* Day selector row */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
                  {days.map((d, idx) => {
                    const isToday = isSameDay(d, today)
                    const isSelected = idx === mobileDayIndex
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setMobileDayIndex(idx)}
                        className={cn(
                          "flex-1 min-w-[52px] flex flex-col items-center gap-1 py-3 transition-colors",
                          isSelected && "bg-white shadow-sm",
                          isToday && !isSelected && "bg-white/50"
                        )}
                      >
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          isSelected ? "text-[var(--color-pv-primary)]" : isToday ? "text-[var(--color-pv-primary)]" : "text-slate-400"
                        )}>
                          {formatDay(d)}
                        </span>
                        <span className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-bold",
                          isSelected ? "bg-[var(--color-pv-primary)] text-white" : isToday ? "text-slate-900" : "text-slate-500"
                        )}>
                          {d.getDate()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Day entries */}
                <div className="divide-y divide-slate-100 bg-white">
                  {mobileDayEntries.length === 0 ? (
                    <div className="py-16 text-center">
                      <Clock size={24} className="mx-auto mb-3 text-slate-200" />
                      <p className="text-[13px] font-bold text-slate-400">No sessions scheduled</p>
                      <button
                        type="button"
                        onClick={() => openModalForCell(mobileSelectedKey, DEFAULT_BOOKING_HOUR)}
                        className="mt-3 px-5 py-2 text-[12px] font-bold text-[var(--color-pv-primary)] border border-[var(--color-pv-primary)] rounded-full transition-colors hover:bg-[var(--color-pv-primary)] hover:text-white"
                      >
                        + Book session
                      </button>
                    </div>
                  ) : (
                    mobileDayEntries.map((e) => (
                      <div
                        key={e.visit_id}
                        className="flex items-center gap-4 px-4 py-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--sq-sm)] bg-[var(--color-pv-tile-1-bg)] text-[var(--color-pv-tile-1-fg)]">
                          <Clock size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 truncate">{e.patient_name}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {e.visit_time} · Visit #{e.visit_number}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold text-[var(--color-pv-primary)]">
                            ₹{e.fee_inr?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Desktop weekly grid (≥ lg) ── */}
              <div className="hidden lg:block overflow-x-auto overflow-y-hidden">
                <div className="min-w-[1000px]">
                  {/* Day Header Row */}
                  <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50/50 border-b border-slate-100">
                    <div className="border-r border-slate-100" />
                    {days.map((d) => {
                      const isToday = isSameDay(d, today)
                      return (
                        <div
                          key={d.toISOString()}
                          className={cn(
                            "py-4 text-center border-r border-slate-100 last:border-r-0",
                            isToday && "bg-white ring-1 ring-inset ring-[var(--color-pv-primary)]/10"
                          )}
                        >
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest mb-1",
                            isToday ? "text-[var(--color-pv-primary)]" : "text-slate-400"
                          )}>
                            {formatDay(d)}
                          </div>
                          <div className={cn(
                            "text-[20px] font-bold",
                            isToday ? "text-slate-900" : "text-slate-500"
                          )}>
                            {d.getDate()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Vertical Time Rows */}
                  <div className="divide-y divide-slate-100 bg-white">
                    {HOURS.map((h) => (
                      <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)] items-stretch divide-x divide-slate-100">
                        <div className="flex items-center justify-center py-8 bg-slate-50/30">
                          <span className="text-[12px] text-slate-400 font-bold uppercase tracking-tight">{formatHour(h)}</span>
                        </div>

                        {days.map((d) => {
                          const key = dateKey(d)
                          const cellEntries = grid[key]?.[h] ?? []
                          const isToday = isSameDay(d, today)
                          const hasEntries = cellEntries.length > 0

                          return (
                            <div
                              key={d.toISOString()}
                              className={cn(
                                "min-h-[120px] p-2 relative group/cell",
                                isToday && "bg-[var(--color-pv-surface)]/10"
                              )}
                            >
                              {hasEntries ? (
                                <div className="flex flex-col gap-2 h-full">
                                  {cellEntries.map((e) => (
                                    <div
                                      key={e.visit_id}
                                      className="bg-white border border-slate-200 border-l-4 border-l-[var(--color-pv-primary)] shadow-sm rounded-[var(--sq-sm)] p-3 flex flex-col justify-between h-full hover:shadow-md transition-all cursor-pointer"
                                      title={`${e.patient_name} — Visit ${e.visit_number}`}
                                    >
                                      <div>
                                         <p className="text-[13px] font-bold text-slate-900 leading-tight mb-1 truncate">{e.patient_name}</p>
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                           Visit #{e.visit_number}
                                         </span>
                                      </div>
                                      <div className="mt-2 text-[12px] font-bold text-[var(--color-pv-primary)]">
                                         ₹{e.fee_inr?.toLocaleString('en-IN')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openModalForCell(key, h)}
                                  aria-label={`Book session on ${formatDay(d)} at ${formatHour(h)}`}
                                  className="w-full h-full min-h-[100px] rounded-[var(--sq-sm)] border border-transparent hover:bg-slate-50/50 hover:border-slate-200 transition-all flex flex-col items-center justify-center gap-2 group/btn"
                                >
                                  <Plus size={16} className="text-slate-200 group-hover/btn:text-[var(--color-pv-primary)] transition-colors" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* Booking Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-[var(--sq-lg)] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-[18px] font-bold text-slate-900">New Booking</h3>
               <button
                 type="button"
                 onClick={() => setModalOpen(false)}
                 aria-label="Close booking modal"
                 className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label htmlFor="schedule-patient" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Select Patient</label>
                {patients && patients.length > 0 ? (
                  <select
                    id="schedule-patient"
                    value={draft.profile_id}
                    onChange={(e) => setDraft({ ...draft, profile_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none transition-all"
                  >
                    <option value="">Choose patient…</option>
                    {patients.map((p) => (
                      <option key={p.profile_id} value={p.profile_id}>{p.patient_name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-[var(--sq-sm)] bg-slate-50 text-center">
                    <p className="text-[13px] text-slate-500">Your patient directory is empty.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="schedule-date" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Date</label>
                  <input
                    id="schedule-date"
                    type="date"
                    value={draft.visit_date}
                    onChange={(e) => setDraft({ ...draft, visit_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="schedule-time" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Time</label>
                  <input
                    id="schedule-time"
                    type="time"
                    value={draft.visit_time}
                    onChange={(e) => setDraft({ ...draft, visit_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="schedule-fee" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Fee (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 font-bold">₹</span>
                  <input
                    id="schedule-fee"
                    type="number"
                    value={draft.fee_inr}
                    onChange={(e) => setDraft({ ...draft, fee_inr: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-[var(--color-pv-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none transition-all"
                    placeholder="500"
                  />
                </div>
              </div>

              {saveError && (
                <p className="text-[12px] text-rose-600 font-bold">{saveError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className="flex-[2] px-6 py-2.5 bg-[var(--color-pv-ink)] text-white rounded-full text-[13px] font-bold hover:bg-[var(--color-pv-primary)] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Confirm Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
