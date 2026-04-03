'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  type SlotStatus,
  type Slot,
  type WeekGrid,
  HOURS,
  formatHour,
  getWeekDates,
  formatMonthRange,
  formatDay,
  isSameDay,
  buildMockGrid
} from './calendar-utils'

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'In Clinic',
  home_visit: 'Home Visit',
}

const SLOT_STYLES: Record<SlotStatus, string> = {
  booked: 'bg-bp-accent text-white',
  available: 'bg-bp-accent/10 text-bp-accent hover:bg-[#d0ece9] cursor-pointer',
  blocked: 'bg-bp-surface text-bp-body/60',
  empty: 'bg-white',
}

function SlotCell({ slot, hour }: { slot: Slot; hour: number }) {
  if (slot.status === 'empty') {
    return <div className="h-14 border border-dashed border-bp-border rounded-lg" />
  }

  return (
    <div
      className={`h-14 rounded-lg px-2 py-1.5 flex flex-col justify-center overflow-hidden text-[11px] font-medium transition-colors ${SLOT_STYLES[slot.status]}`}
      title={slot.status === 'booked' ? `${slot.patientName} — ${VISIT_TYPE_LABELS[slot.visitType ?? ''] ?? ''}` : slot.status}
    >
      {slot.status === 'booked' && (
        <>
          <span className="truncate font-semibold">{slot.patientName}</span>
          <span className="opacity-80 truncate">{VISIT_TYPE_LABELS[slot.visitType ?? ''] ?? ''}</span>
        </>
      )}
      {slot.status === 'available' && (
        <span className="text-center w-full">Available</span>
      )}
      {slot.status === 'blocked' && (
        <span className="text-center w-full">Blocked</span>
      )}
    </div>
  )
}

export default function ProviderCalendar() {
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const days = getWeekDates(anchor)
  const grid = buildMockGrid(days)
  const today = new Date()

  function prevWeek() {
    setAnchor((a) => { const d = new Date(a); d.setDate(d.getDate() - 7); return d })
  }
  function nextWeek() {
    setAnchor((a) => { const d = new Date(a); d.setDate(d.getDate() + 7); return d })
  }
  function goToday() {
    setAnchor(new Date())
  }

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-[32px] font-bold text-bp-primary tracking-tight">Calendar</h1>
        <Link
          href="/provider/availability"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-bp-accent hover:bg-bp-primary text-white rounded-full no-underline text-[14px] font-semibold transition-colors self-start sm:self-auto"
        >
          <Settings className="w-4 h-4" />
          Manage Availability
        </Link>
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-[12px] border border-bp-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-bp-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevWeek}
              className="w-9 h-9 flex items-center justify-center border border-bp-border rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-bp-primary" />
            </button>
            <span className="text-[17px] font-semibold text-bp-primary min-w-[160px] text-center">
              {formatMonthRange(days)}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="w-9 h-9 flex items-center justify-center border border-bp-border rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-bp-primary" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 py-1.5 border border-bp-border rounded-lg text-[13px] font-medium text-bp-primary hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
            >
              Today
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[12px] text-bp-body">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-bp-accent inline-block" />
              Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-bp-accent/10 inline-block" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-bp-surface border border-bp-border inline-block" />
              Blocked
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-bp-border">
              <div />
              {days.map((d) => {
                const isToday = isSameDay(d, today)
                return (
                  <div
                    key={d.toISOString()}
                    className={`py-3 text-center ${isToday ? 'bg-bp-accent/10' : ''}`}
                  >
                    <div className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-bp-accent' : 'text-bp-body/60'}`}>
                      {formatDay(d)}
                    </div>
                    <div className={`text-[20px] font-bold mt-0.5 ${isToday ? 'text-bp-accent' : 'text-bp-primary'}`}>
                      {d.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time rows */}
            <div className="divide-y divide-[#F5F5F5]">
              {HOURS.map((h) => (
                <div key={h} className="grid grid-cols-[64px_repeat(7,1fr)] items-start gap-x-1 px-1 py-1">
                  <div className="flex items-start justify-end pr-3 pt-1">
                    <span className="text-[11px] text-bp-body/60 font-medium">{formatHour(h)}</span>
                  </div>
                  {days.map((d) => {
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                    const slot = grid[key]?.[h] ?? { status: 'empty' as SlotStatus }
                    return (
                      <div key={d.toISOString()} className={isSameDay(d, today) ? 'bg-[#FAFFFE] rounded' : ''}>
                        <SlotCell slot={slot} hour={h} />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
