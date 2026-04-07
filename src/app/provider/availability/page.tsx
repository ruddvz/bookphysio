'use client'

import { useEffect, useState } from 'react'
import { Clock, Check, Settings, CheckCircle, Loader2, AlertCircle, Plus, X } from 'lucide-react'
import {
  cloneProviderSchedule,
  DEFAULT_PROVIDER_SCHEDULE,
  type DayName,
  deriveProviderScheduleFromSlots,
  getAmbiguousProviderScheduleDays,
  getProviderAvailabilityWindow,
  PROVIDER_AVAILABILITY_DAYS,
  PROVIDER_SLOT_DURATIONS,
  type ProviderAvailabilitySlot,
  type ProviderSchedule,
  timeToMinutes,
} from '@/lib/provider-availability'

const AVAILABILITY_WEEKS = 4

interface TimeSlot {
  start: string
  end: string
}

type MultiSlotSchedule = Record<DayName, { enabled: boolean; slots: TimeSlot[] }>

function scheduleToMultiSlot(schedule: ProviderSchedule): MultiSlotSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((acc, day) => {
    const config = schedule[day]
    return {
      ...acc,
      [day]: {
        enabled: config.enabled,
        slots: [{ start: config.start, end: config.end }],
      },
    }
  }, {} as MultiSlotSchedule)
}

function multiSlotToSchedule(multi: MultiSlotSchedule): ProviderSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((acc, day) => {
    const config = multi[day]
    const firstSlot = config.slots[0] ?? { start: '09:00', end: '18:00' }
    const allStart = config.slots.reduce(
      (min, s) => (timeToMinutes(s.start) < timeToMinutes(min) ? s.start : min),
      firstSlot.start,
    )
    const allEnd = config.slots.reduce(
      (max, s) => (timeToMinutes(s.end) > timeToMinutes(max) ? s.end : max),
      firstSlot.end,
    )
    return {
      ...acc,
      [day]: { enabled: config.enabled, start: allStart, end: allEnd },
    }
  }, {} as ProviderSchedule)
}

function validateMultiSlotSchedule(schedule: MultiSlotSchedule): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const day of PROVIDER_AVAILABILITY_DAYS) {
    const config = schedule[day]
    if (!config.enabled) continue

    for (let i = 0; i < config.slots.length; i++) {
      const slot = config.slots[i]
      if (timeToMinutes(slot.end) <= timeToMinutes(slot.start)) {
        errors[`${day}-${i}`] = 'End time must be after start time'
      }
    }

    const sorted = [...config.slots].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    )
    for (let i = 1; i < sorted.length; i++) {
      if (timeToMinutes(sorted[i].start) < timeToMinutes(sorted[i - 1].end)) {
        errors[day] = 'Time slots must not overlap'
        break
      }
    }
  }

  return errors
}

async function fetchExistingAvailability(startDateKey: string, endDateKey: string) {
  const response = await fetch(`/api/provider/availability?start=${startDateKey}&end=${endDateKey}`)

  if (!response.ok) {
    throw new Error('Failed to load current availability')
  }

  return response.json() as Promise<{ slots?: ProviderAvailabilitySlot[] }>
}

export default function ProviderAvailability() {
  const [schedule, setSchedule] = useState<MultiSlotSchedule>(() =>
    scheduleToMultiSlot(cloneProviderSchedule(DEFAULT_PROVIDER_SCHEDULE)),
  )
  const [duration, setDuration] = useState('30')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [inferenceError, setInferenceError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [loadingExistingAvailability, setLoadingExistingAvailability] = useState(true)

  useEffect(() => {
    let cancelled = false
    const { startDateKey, endDateKey } = getProviderAvailabilityWindow(AVAILABILITY_WEEKS)

    async function loadExistingAvailability() {
      setLoadingExistingAvailability(true)
      setSaveError(null)
      setInferenceError(null)

      try {
        const data = await fetchExistingAvailability(startDateKey, endDateKey)

        if (cancelled) {
          return
        }

        const existingSlots = data.slots ?? []
        const derived = deriveProviderScheduleFromSlots(existingSlots)
        const ambiguousDays = getAmbiguousProviderScheduleDays(existingSlots)
        setSchedule(scheduleToMultiSlot(derived.schedule))
        setDuration(derived.duration)
        setErrors({})
        setHasChanges(false)

        if (ambiguousDays.length > 0) {
          setInferenceError(
            `We cannot safely infer recurring hours for ${ambiguousDays.join(', ')} because only booked or blocked slots remain in the next 4 weeks. Wait for an open slot or contact support before editing.`,
          )
        }
      } catch {
        if (!cancelled) {
          setInferenceError(null)
          setSaveError('Failed to load your current availability. Refresh before editing to avoid overwriting active slots.')
        }
      } finally {
        if (!cancelled) {
          setLoadingExistingAvailability(false)
        }
      }
    }

    void loadExistingAvailability()

    return () => {
      cancelled = true
    }
  }, [])

  function toggleDay(day: DayName) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[day]
      // Also remove slot-specific errors for this day
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${day}-`)) delete next[k]
      })
      return next
    })
    setSaved(false)
    setHasChanges(true)
  }

  function updateSlotTime(day: DayName, slotIndex: number, field: 'start' | 'end', value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((s, i) =>
          i === slotIndex ? { ...s, [field]: value } : s,
        ),
      },
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[day]
      delete next[`${day}-${slotIndex}`]
      return next
    })
    setSaved(false)
    setHasChanges(true)
  }

  function addSlot(day: DayName) {
    setSchedule((prev) => {
      const existing = prev[day].slots
      const lastSlot = existing[existing.length - 1]
      const lastEndMins = timeToMinutes(lastSlot?.end ?? '18:00')
      const newStartMins = Math.min(lastEndMins + 60, 22 * 60)
      const newEndMins = Math.min(newStartMins + 180, 23 * 60)
      const pad = (n: number) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0')

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: [...existing, { start: pad(newStartMins), end: pad(newEndMins) }],
        },
      }
    })
    setSaved(false)
    setHasChanges(true)
  }

  function removeSlot(day: DayName, slotIndex: number) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== slotIndex),
      },
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`${day}-${slotIndex}`]
      return next
    })
    setSaved(false)
    setHasChanges(true)
  }

  async function handleSave() {
    const newErrors = validateMultiSlotSchedule(schedule)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    try {
      // Convert multi-slot to the flat ProviderSchedule the API expects
      const flatSchedule = multiSlotToSchedule(schedule)
      const res = await fetch('/api/provider/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: flatSchedule, duration: parseInt(duration, 10), weeks: AVAILABILITY_WEEKS }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveError((data as { error?: string }).error ?? 'Failed to save. Please try again.')
      } else {
        setSaved(true)
        setHasChanges(false)
      }
    } catch {
      setSaveError('Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = PROVIDER_AVAILABILITY_DAYS.filter((dayName) => schedule[dayName].enabled).length
  const disableEditing = loadingExistingAvailability || Boolean(inferenceError) || Boolean(saveError && !saved && !hasChanges)

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">
          Availability Settings
        </h1>
        <p className="text-[16px] text-slate-500">
          Set your recurring weekly working hours and session duration.
        </p>
      </div>

      {/* Save banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-[12px] px-5 py-4 mb-6">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-[15px] font-medium text-emerald-600">Availability saved — slots generated for the next 4 weeks.</p>
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-[12px] px-5 py-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-[15px] font-medium text-red-600">{saveError}</p>
        </div>
      )}
      {inferenceError && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-[12px] px-5 py-4 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[15px] font-medium text-amber-700">{inferenceError}</p>
        </div>
      )}

      {loadingExistingAvailability && (
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[12px] px-5 py-4 mb-6">
          <Loader2 className="w-5 h-5 text-emerald-600 shrink-0 animate-spin" />
          <p className="text-[15px] font-medium text-slate-500">Loading your current schedule...</p>
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-8">

        {/* Weekly Schedule */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-[20px] font-semibold text-slate-900">Weekly Schedule</h2>
        </div>
        <p className="text-[15px] text-slate-500 mb-1 ml-[52px]">
          Toggle the days you are available and set your working hours. Add multiple time slots per day.
        </p>
        <p className="text-[13px] text-slate-500/60 mb-8 ml-[52px]">
          {enabledCount} of 7 days active
        </p>

        <div className="flex flex-col gap-3 mb-10">
          {PROVIDER_AVAILABILITY_DAYS.map((day) => {
            const { enabled, slots } = schedule[day]
            const dayError = errors[day]
            return (
              <div key={day}>
                <div
                  className={`flex flex-col gap-3 p-4 rounded-lg border transition-colors ${
                    enabled ? 'bg-white border-slate-200' : 'bg-[#F9FAFB] border-[#F3F4F6]'
                  }`}
                >
                  {/* Toggle + day name */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none min-w-[140px]">
                      <input
                        type="checkbox"
                        checked={enabled}
                        aria-label={`Toggle ${day}`}
                        disabled={disableEditing}
                        onChange={() => toggleDay(day)}
                        className="sr-only peer"
                      />
                      <span
                        aria-hidden="true"
                        className={`relative w-10 h-6 rounded-full transition-colors outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 ${
                          enabled ? 'bg-emerald-600' : 'bg-[#D1D5DB]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </span>
                      <span className={`text-[15px] font-medium ${enabled ? 'text-slate-900' : 'text-[#9CA3AF]'}`}>
                        {day}
                      </span>
                    </label>

                    {enabled && (
                      <button
                        type="button"
                        onClick={() => addSlot(day)}
                        disabled={disableEditing || slots.length >= 4}
                        className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Add time slot"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Slot
                      </button>
                    )}
                  </div>

                  {/* Time slots */}
                  <div className={`flex flex-col gap-2 transition-opacity ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    {slots.map((slot, slotIdx) => {
                      const slotError = errors[`${day}-${slotIdx}`]
                      return (
                        <div key={slotIdx} className="flex items-center gap-3">
                          <input
                            type="time"
                            value={slot.start}
                            disabled={!enabled || disableEditing}
                            aria-label={`${day} slot ${slotIdx + 1} start time`}
                            onChange={(e) => updateSlotTime(day, slotIdx, 'start', e.target.value)}
                            className={`px-3 py-2 text-[14px] border rounded-lg outline-none w-[110px] transition-colors ${
                              slotError
                                ? 'border-[#CC3300] focus:border-[#CC3300]'
                                : 'border-slate-200 focus:border-emerald-600'
                            } text-slate-900 bg-white disabled:bg-transparent disabled:text-[#9CA3AF]`}
                          />
                          <span className="text-slate-500/60 font-medium text-[14px]">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            disabled={!enabled || disableEditing}
                            aria-label={`${day} slot ${slotIdx + 1} end time`}
                            onChange={(e) => updateSlotTime(day, slotIdx, 'end', e.target.value)}
                            className={`px-3 py-2 text-[14px] border rounded-lg outline-none w-[110px] transition-colors ${
                              slotError
                                ? 'border-[#CC3300] focus:border-[#CC3300]'
                                : 'border-slate-200 focus:border-emerald-600'
                            } text-slate-900 bg-white disabled:bg-transparent disabled:text-[#9CA3AF]`}
                          />
                          {slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(day, slotIdx)}
                              disabled={disableEditing}
                              aria-label={`Remove ${day} slot ${slotIdx + 1}`}
                              title={`Remove slot ${slotIdx + 1}`}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {slotError && (
                            <span className="text-[12px] text-[#CC3300]">{slotError}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                {dayError && (
                  <p className="text-[12px] text-[#CC3300] mt-1 ml-1">{dayError}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Slot Duration */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-[20px] font-semibold text-slate-900">Slot Duration</h2>
          </div>
          <p className="text-[15px] text-slate-500 mb-6 ml-[52px]">
            How long is each appointment slot?
          </p>

          <div className="flex gap-3 ml-[52px] mb-8">
            {PROVIDER_SLOT_DURATIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={disableEditing}
                onClick={() => { setDuration(mins); setSaved(false); setHasChanges(true) }}
                className={`px-5 py-2.5 rounded-full text-[14px] font-semibold border transition-colors cursor-pointer outline-none ${
                  duration === mins
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-600 hover:text-emerald-600'
                }`}
              >
                {mins} mins
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => { void handleSave() }}
            disabled={!hasChanges || saving || disableEditing}
            className={`flex items-center gap-2 px-8 py-3 rounded-[24px] text-[16px] font-semibold transition-all outline-none ${
              hasChanges && !saving && !disableEditing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-[#F2F2F2] text-slate-500/60 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  )
}
