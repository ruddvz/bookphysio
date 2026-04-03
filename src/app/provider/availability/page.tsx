'use client'

import { useState } from 'react'
import { Clock, Check, Settings, CheckCircle } from 'lucide-react'

type DayConfig = {
  enabled: boolean
  start: string
  end: string
}

type Schedule = Record<string, DayConfig>

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_SCHEDULE: Schedule = {
  Monday:    { enabled: true,  start: '09:00', end: '18:00' },
  Tuesday:   { enabled: true,  start: '09:00', end: '18:00' },
  Wednesday: { enabled: true,  start: '09:00', end: '18:00' },
  Thursday:  { enabled: true,  start: '09:00', end: '18:00' },
  Friday:    { enabled: true,  start: '09:00', end: '17:00' },
  Saturday:  { enabled: false, start: '10:00', end: '14:00' },
  Sunday:    { enabled: false, start: '10:00', end: '14:00' },
}

const DURATIONS = ['30', '45', '60']

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function validateSchedule(schedule: Schedule): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const day of DAYS) {
    const { enabled, start, end } = schedule[day]
    if (!enabled) continue
    if (timeToMinutes(end) <= timeToMinutes(start)) {
      errors[day] = 'End time must be after start time'
    }
  }
  return errors
}

export default function ProviderAvailability() {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE)
  const [duration, setDuration] = useState('30')
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  function toggleDay(day: string) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))
    setErrors((prev) => { const next = { ...prev }; delete next[day]; return next })
    setSaved(false)
    setHasChanges(true)
  }

  function updateTime(day: string, field: 'start' | 'end', value: string) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
    setErrors((prev) => { const next = { ...prev }; delete next[day]; return next })
    setSaved(false)
    setHasChanges(true)
  }

  function handleSave() {
    const newErrors = validateSchedule(schedule)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setSaved(true)
    setHasChanges(false)
  }

  const enabledCount = DAYS.filter((d) => schedule[d].enabled).length

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
          <p className="text-[15px] font-medium text-bp-accent">Availability saved successfully.</p>
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
          {DAYS.map((day) => {
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
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled ? 'true' : 'false'}
                      aria-label={`Toggle ${day}`}
                      onClick={() => toggleDay(day)}
                      className={`relative w-10 h-6 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00766C] cursor-pointer ${
                        enabled ? 'bg-bp-accent' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-[15px] font-medium ${enabled ? 'text-bp-primary' : 'text-[#9CA3AF]'}`}>
                      {day}
                    </span>
                  </label>

                  {/* Time inputs */}
                  <div className={`flex items-center gap-3 transition-opacity ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <input
                      type="time"
                      value={start}
                      disabled={!enabled}
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
                      disabled={!enabled}
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
            {DURATIONS.map((mins) => (
              <button
                key={mins}
                type="button"
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
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-8 py-3 rounded-[24px] text-[16px] font-semibold transition-all outline-none ${
              hasChanges 
                ? 'bg-bp-accent hover:bg-bp-primary text-white cursor-pointer' 
                : 'bg-[#F2F2F2] text-bp-body/60 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            Save Availability
          </button>
        </div>
      </div>
    </div>
  )
}
