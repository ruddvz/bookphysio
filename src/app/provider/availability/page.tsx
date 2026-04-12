"use client"

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  Settings,
  CheckCircle2,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  cloneProviderMultiSlotSchedule,
  DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE,
  type DayName,
  deriveProviderMultiSlotScheduleFromSlots,
  getProviderAvailabilityWindow,
  PROVIDER_AVAILABILITY_DAYS,
  PROVIDER_SLOT_DURATIONS,
  type ProviderAvailabilitySlot,
  type ProviderMultiSlotSchedule,
  timeToMinutes,
  validateProviderSchedule,
} from '@/lib/provider-availability'
import {
  PageHeader,
  SectionCard,
  StatTile,
} from '@/components/dashboard/primitives'

const AVAILABILITY_WEEKS = 4

async function fetchExistingAvailability(startDateKey: string, endDateKey: string) {
  const response = await fetch(`/api/provider/availability?start=${startDateKey}&end=${endDateKey}`)
  if (!response.ok) throw new Error('Failed to load current availability')
  return response.json() as Promise<{ slots?: ProviderAvailabilitySlot[] }>
}

export default function ProviderAvailability() {
  const [schedule, setSchedule] = useState<ProviderMultiSlotSchedule>(() =>
    cloneProviderMultiSlotSchedule(DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE),
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
          if (cancelled) return

          const existingSlots = data.slots ?? []
          const derived = deriveProviderMultiSlotScheduleFromSlots(existingSlots)
          const ambiguousDays = derived.ambiguousDays
          setSchedule(derived.schedule)
          setDuration(derived.duration)
          setErrors({})
          setHasChanges(false)

        if (ambiguousDays.length > 0) {
          setInferenceError(
            `Ambiguity detected in recurring hours for ${ambiguousDays.join(', ')}. Monitoring locked slots only.`,
          )
        }
      } catch {
        if (!cancelled) setSaveError('Failed to synchronize availability registry.')
      } finally {
        if (!cancelled) setLoadingExistingAvailability(false)
      }
    }

    void loadExistingAvailability()
    return () => { cancelled = true }
  }, [])

  function toggleDay(day: DayName) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled && prev[day].slots.length === 0
          ? [{ start: '09:00', end: '18:00' }]
          : prev[day].slots,
      },
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[day]
      Object.keys(next).forEach((k) => { if (k.startsWith(`${day}-`)) delete next[k] })
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
      const existingSlots = prev[day].slots
      const lastSlot = existingSlots[existingSlots.length - 1] ?? { start: '09:00', end: '18:00' }
      const nextStart = lastSlot.end
      const nextEndMinutes = Math.min(timeToMinutes(nextStart) + 60, 23 * 60 + 30)
      return {
        ...prev,
        [day]: {
          ...prev[day],
          enabled: true,
          slots: [...existingSlots, { start: nextStart, end: `${String(Math.floor(nextEndMinutes / 60)).padStart(2, '0')}:${String(nextEndMinutes % 60).padStart(2, '0')}` }],
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
        slots: prev[day].slots.filter((_, index) => index !== slotIndex),
      },
    }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (key === day || key.startsWith(`${day}-`)) {
          delete next[key]
        }
      }
      return next
    })
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
        setSaveError('Failed to deploy availability registry.')
      } else {
        setSaved(true)
        setHasChanges(false)
      }
    } catch {
      setSaveError('Network failure during registry deployment.')
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = PROVIDER_AVAILABILITY_DAYS.filter((dayName) => schedule[dayName].enabled).length
  const disableEditing = loadingExistingAvailability || Boolean(inferenceError)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="CLINIC OPERATIONS"
        title="Availability registry"
        subtitle="Define your recurring operational windows and session distribution"
        action={{
          label: saving ? 'Deploying...' : 'Commit Changes',
          icon: saving ? Loader2 : Save,
          onClick: handleSave,
          disabled: !hasChanges || saving || disableEditing
        }}
      />

      {/* Registry KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
        <StatTile
          role="provider"
          tone={1}
          icon={Clock}
          label="Active Days"
          value={`${enabledCount} Active`}
          delta={{ value: 'Per week', positive: true }}
        />
        <StatTile
          role="provider"
          tone={2}
          icon={Settings}
          label="Session Unit"
          value={`${duration}m`}
          delta={{ value: 'Default length' }}
        />
        <StatTile
          role="provider"
          tone={3}
          icon={Calendar}
          label="Sync Horizon"
          value={`${AVAILABILITY_WEEKS}w`}
          delta={{ value: 'Future window' }}
        />
        <StatTile
          role="provider"
          tone={4}
          icon={CheckCircle2}
          label="Status"
          value={hasChanges ? 'Draft' : 'Synced'}
          delta={{ value: hasChanges ? 'Changes pending' : 'Registry active', positive: !hasChanges }}
        />
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {saved && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3 text-emerald-700">
            <CheckCircle2 size={18} />
            <p className="text-[13px] font-bold">Registry deployed successfully.</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl px-5 py-3 text-rose-700">
            <AlertCircle size={18} />
            <p className="text-[13px] font-bold">{saveError}</p>
          </div>
        )}
        {inferenceError && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 text-amber-700">
            <AlertCircle size={18} />
            <p className="text-[13px] font-bold">{inferenceError}</p>
          </div>
        )}
        {loadingExistingAvailability && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            <p className="text-[13px] font-bold">Synchronizing registry data...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-6">
          <SectionCard role="provider" title="Weekly Recurring Hours">
            <div className="space-y-4">
              {PROVIDER_AVAILABILITY_DAYS.map((day) => {
                const { enabled, slots } = schedule[day]
                const dayError = errors[day]
                return (
                  <div key={day} className="group">
                    <div className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all",
                      enabled ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50/50 border-slate-100 opacity-60"
                    )}>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            aria-label={day}
                            checked={enabled}
                            disabled={disableEditing}
                            onChange={() => toggleDay(day)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-pv-primary)]" />
                        </label>
                        <span className={cn(
                          "text-[14px] font-bold uppercase tracking-wider",
                          enabled ? "text-slate-900" : "text-slate-400"
                        )}>
                          {day}
                        </span>
                      </div>

                      {enabled && (
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                          {slots.map((slot, slotIndex) => (
                            <div key={`${day}-${slotIndex}`} className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                              <input
                                type="time"
                                value={slot.start}
                                disabled={disableEditing}
                                onChange={(e) => updateSlotTime(day, slotIndex, 'start', e.target.value)}
                                className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 w-20"
                              />
                              <span className="text-slate-300 font-bold">→</span>
                              <input
                                type="time"
                                value={slot.end}
                                disabled={disableEditing}
                                onChange={(e) => updateSlotTime(day, slotIndex, 'end', e.target.value)}
                                className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 w-20"
                              />
                              {slots.length > 1 ? (
                                <button
                                  type="button"
                                  disabled={disableEditing}
                                  onClick={() => removeSlot(day, slotIndex)}
                                  className="text-[12px] font-bold text-rose-600 disabled:text-slate-300"
                                >
                                  Remove
                                </button>
                              ) : null}
                            </div>
                          ))}
                          <button
                            type="button"
                            disabled={disableEditing}
                            onClick={() => addSlot(day)}
                            className="text-[12px] font-bold text-[var(--color-pv-primary)] disabled:text-slate-300"
                          >
                            + Add range
                          </button>
                        </div>
                      )}
                    </div>
                    {(dayError || slots.some((_, idx) => Boolean(errors[`${day}-${idx}`]))) && (
                      <div className="mt-2 ml-14 space-y-1">
                        {dayError ? <p className="text-[11px] text-rose-600 font-bold uppercase">{dayError}</p> : null}
                        {slots.map((_, idx) => errors[`${day}-${idx}`]).filter(Boolean).map((message, idx) => (
                          <p key={`${day}-error-${idx}`} className="text-[11px] text-rose-600 font-bold uppercase">
                            {message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="provider" title="Session Distribution">
            <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
              Standard clinical unit length for automatically generated appointment slots.
            </p>
            <div className="space-y-3">
              {PROVIDER_SLOT_DURATIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => { setDuration(mins); setHasChanges(true); setSaved(false) }}
                  disabled={disableEditing}
                  className={cn(
                    "flex items-center justify-between w-full p-4 rounded-xl border transition-all text-left",
                    duration === mins
                      ? "bg-[var(--color-pv-primary)] border-[var(--color-pv-primary)] text-white"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="text-[14px] font-bold">{mins} Minutes</span>
                  {duration === mins && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard role="provider" title="Audit Information">
             <div className="space-y-4">
                <div className="flex justify-between items-center text-[13px]">
                   <span className="text-slate-500">Registry status</span>
                   <span className={cn("font-bold uppercase tracking-widest text-[11px]", hasChanges ? "text-amber-600" : "text-emerald-600")}>
                      {hasChanges ? 'Draft' : 'Synchronized'}
                   </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                   <span className="text-slate-500">Auto-generation</span>
                   <span className="font-bold text-slate-900">Enabled</span>
                </div>
                <div className="h-[1px] bg-slate-50" />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                   Changes to availability will only affect new slots. Existing confirmed appointments remain locked.
                </p>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
