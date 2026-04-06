'use client'

import { useEffect, useState } from 'react'
import { Clock, Check, Settings, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
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
  validateProviderSchedule,
} from '@/lib/provider-availability'

const AVAILABILITY_WEEKS = 4

async function fetchExistingAvailability(startDateKey: string, endDateKey: string) {
  const response = await fetch(`/api/provider/availability?start=${startDateKey}&end=${endDateKey}`)

  if (!response.ok) {
    throw new Error('Failed to load current availability')
  }

  return response.json() as Promise<{ slots?: ProviderAvailabilitySlot[] }>
}

export default function ProviderAvailability() {
  const [schedule, setSchedule] = useState<ProviderSchedule>(() => cloneProviderSchedule(DEFAULT_PROVIDER_SCHEDULE))
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
        setSchedule(derived.schedule)
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
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))
    setErrors((prev) => { const next = { ...prev }; delete next[day]; return next })
    setSaved(false)
    setHasChanges(true)
  }

  function updateTime(day: DayName, field: 'start' | 'end', value: string) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
    setErrors((prev) => { const next = { ...prev }; delete next[day]; return next })
    setSaved(false)
    setHasChanges(true)
  }

  async function handleSave() {
    const newErrors = validateProviderSchedule(schedule)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/provider/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule, duration: parseInt(duration, 10), weeks: AVAILABILITY_WEEKS }),
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
        <h1 className="text-[32px] font-bold text-bp-primary tracking-tight mb-2">
          Availability Settings
        </h1>
        <p className="text-[16px] text-bp-body">
          Set your recurring weekly working hours and session duration.
        </p>
      </div>

      {/* Save banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-bp-accent/10 border border-bp-accent/20 rounded-[12px] px-5 py-4 mb-6">
          <CheckCircle className="w-5 h-5 text-bp-accent shrink-0" />
          <p className="text-[15px] font-medium text-bp-accent">Availability saved — slots generated for the next 4 weeks.</p>
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
        <div className="flex items-center gap-3 bg-white border border-bp-border rounded-[12px] px-5 py-4 mb-6">
          <Loader2 className="w-5 h-5 text-bp-accent shrink-0 animate-spin" />
          <p className="text-[15px] font-medium text-bp-body">Loading your current schedule…</p>
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-8">

        {/* Weekly Schedule */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-bp-accent/10 text-bp-accent rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-[20px] font-semibold text-bp-primary">Weekly Schedule</h2>
        </div>
        <p className="text-[15px] text-bp-body mb-1 ml-[52px]">
          Toggle the days you are available and set your working hours.
        </p>
        <p className="text-[13px] text-bp-body/60 mb-8 ml-[52px]">
          {enabledCount} of 7 days active
        </p>

        <div className="flex flex-col gap-3 mb-10">
          {PROVIDER_AVAILABILITY_DAYS.map((day) => {
            const { enabled, start, end } = schedule[day]
            const error = errors[day]
            return (
              <div key={day}>
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border transition-colors ${
                    enabled ? 'bg-white border-bp-border' : 'bg-[#F9FAFB] border-[#F3F4F6]'
                  }`}
                >
                  {/* Toggle + day name */}
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
                      className={`relative w-10 h-6 rounded-full transition-colors outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-bp-accent ${
                        enabled ? 'bg-bp-accent' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </span>
                    <span className={`text-[15px] font-medium ${enabled ? 'text-bp-primary' : 'text-[#9CA3AF]'}`}>
                      {day}
                    </span>
                  </label>

                  {/* Time inputs */}
                  <div className={`flex items-center gap-3 transition-opacity ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <input
                      type="time"
                      value={start}
                      disabled={!enabled || disableEditing}
                      aria-label={`${day} start time`}
                      onChange={(e) => updateTime(day, 'start', e.target.value)}
                      className={`px-3 py-2 text-[14px] border rounded-lg outline-none w-[110px] transition-colors ${
                        error
                          ? 'border-[#CC3300] focus:border-[#CC3300]'
                          : 'border-bp-border focus:border-bp-accent'
                      } text-bp-primary bg-white disabled:bg-transparent disabled:text-[#9CA3AF]`}
                    />
                    <span className="text-bp-body/60 font-medium text-[14px]">to</span>
                    <input
                      type="time"
                      value={end}
                      disabled={!enabled || disableEditing}
                      aria-label={`${day} end time`}
                      onChange={(e) => updateTime(day, 'end', e.target.value)}
                      className={`px-3 py-2 text-[14px] border rounded-lg outline-none w-[110px] transition-colors ${
                        error
                          ? 'border-[#CC3300] focus:border-[#CC3300]'
                          : 'border-bp-border focus:border-bp-accent'
                      } text-bp-primary bg-white disabled:bg-transparent disabled:text-[#9CA3AF]`}
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-[12px] text-[#CC3300] mt-1 ml-1">{error}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Slot Duration */}
        <div className="pt-8 border-t border-bp-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-bp-accent/10 text-bp-accent rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-[20px] font-semibold text-bp-primary">Slot Duration</h2>
          </div>
          <p className="text-[15px] text-bp-body mb-6 ml-[52px]">
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
                    ? 'bg-bp-accent text-white border-bp-accent'
                    : 'bg-white text-bp-primary border-bp-border hover:border-bp-accent hover:text-bp-accent'
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
                ? 'bg-bp-accent hover:bg-bp-primary text-white cursor-pointer'
                : 'bg-[#F2F2F2] text-bp-body/60 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {saving ? 'Saving…' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  )
}
