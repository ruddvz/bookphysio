'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Plus, X, Users } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

  // Bucket entries by date → hour for quick lookup
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
  const weekVisitCount = entries?.length ?? 0

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
    <div className="max-w-[1200px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Schedule</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Your week at a glance — Mon to Sun, 8 AM to 8 PM.
          </p>
        </div>
        <button
          type="button"
          onClick={openBlankModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[14px] font-semibold transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule a Visit
        </button>
      </div>

      {/* Week summary strip */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-5">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">This week</p>
          <p className="text-[28px] font-bold text-slate-900 mt-1">{weekVisitCount} visits</p>
        </div>
        <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-5">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Expected earnings</p>
          <p className="text-[28px] font-bold text-emerald-600 mt-1">
            {'\u20B9'}{weekTotalRupees.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Week grid */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 justify-between flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevWeek}
              aria-label="Previous week"
              className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>
            <span className="text-[17px] font-semibold text-slate-900 min-w-[160px] text-center">
              {formatMonthRange(days)}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              aria-label="Next week"
              className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-900" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Today
            </button>
          </div>
          <p className="text-[12px] text-slate-500">Click an empty cell to schedule a visit.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : isError ? (
          <div className="py-24 text-center">
            <p className="text-[15px] font-bold text-red-500">Failed to load schedule. Please refresh.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              {/* Day headers */}
              <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200">
                <div />
                {days.map((d) => {
                  const isToday = isSameDay(d, today)
                  return (
                    <div
                      key={d.toISOString()}
                      className={`py-3 text-center ${isToday ? 'bg-emerald-50' : ''}`}
                    >
                      <div className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-emerald-600' : 'text-slate-500/70'}`}>
                        {formatDay(d)}
                      </div>
                      <div className={`text-[20px] font-bold mt-0.5 ${isToday ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time rows */}
              <div className="divide-y divide-slate-100">
                {HOURS.map((h) => (
                  <div key={h} className="grid grid-cols-[64px_repeat(7,1fr)] items-stretch gap-x-1 px-1 py-1">
                    <div className="flex items-start justify-end pr-3 pt-2">
                      <span className="text-[11px] text-slate-500/70 font-medium">{formatHour(h)}</span>
                    </div>
                    {days.map((d) => {
                      const key = dateKey(d)
                      const cellEntries = grid[key]?.[h] ?? []
                      const isToday = isSameDay(d, today)
                      const hasEntries = cellEntries.length > 0
                      return (
                        <div
                          key={d.toISOString()}
                          className={`min-h-[58px] rounded-lg p-1 ${isToday ? 'bg-[#FAFFFE]' : ''}`}
                        >
                          {hasEntries ? (
                            <div className="space-y-1">
                              {cellEntries.map((e) => (
                                <div
                                  key={e.visit_id}
                                  className="bg-emerald-600 text-white rounded-md px-2 py-1.5 overflow-hidden"
                                  title={`${e.patient_name} — Visit ${e.visit_number}${e.fee_inr ? ` — ₹${e.fee_inr}` : ''}`}
                                >
                                  <p className="text-[11px] font-semibold truncate leading-tight">{e.patient_name}</p>
                                  {e.fee_inr != null && (
                                    <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">
                                      {'\u20B9'}{e.fee_inr.toLocaleString('en-IN')}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openModalForCell(key, h)}
                              aria-label={`Schedule visit on ${key} at ${formatHour(h)}`}
                              className="w-full h-full min-h-[50px] border border-dashed border-slate-200 rounded-md hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-[16px] shadow-2xl w-full max-w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-[18px] font-bold text-slate-900">Schedule a Visit</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="sched-patient" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Patient *</label>
                {patients && patients.length > 0 ? (
                  <select
                    id="sched-patient"
                    value={draft.profile_id}
                    onChange={(e) => setDraft({ ...draft, profile_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all bg-white"
                  >
                    <option value="">Select a patient…</option>
                    {patients.map((p) => (
                      <option key={p.profile_id} value={p.profile_id}>{p.patient_name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 border border-dashed border-slate-200 rounded-lg text-[13px] text-slate-500">
                    <Users className="w-4 h-4" />
                    No patients yet. Add one from the Patients page first.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="sched-date" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Date *</label>
                  <input
                    id="sched-date"
                    type="date"
                    value={draft.visit_date}
                    onChange={(e) => setDraft({ ...draft, visit_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sched-time" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Time *</label>
                  <input
                    id="sched-time"
                    type="time"
                    value={draft.visit_time}
                    onChange={(e) => setDraft({ ...draft, visit_time: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sched-fee" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Fee ({'\u20B9'})</label>
                <input
                  id="sched-fee"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={draft.fee_inr}
                  onChange={(e) => setDraft({ ...draft, fee_inr: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all"
                  placeholder="Optional"
                />
              </div>

              {saveError && (
                <p className="text-[13px] text-red-600 font-medium">{saveError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-[14px] font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Scheduling…' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
