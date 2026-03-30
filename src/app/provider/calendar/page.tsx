'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'

type SlotStatus = 'booked' | 'available' | 'blocked' | 'empty'

interface Slot {
  status: SlotStatus
  patientName?: string
  visitType?: 'in_clinic' | 'home_visit' | 'online'
}

type WeekGrid = Record<string, Record<number, Slot>>

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'In Clinic',
  home_visit: 'Home Visit',
  online: 'Online',
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

function formatHour(h: number): string {
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay() // 0 = Sunday
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatMonthRange(days: Date[]): string {
  const first = days[0]
  const last = days[6]
  const monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
  if (first.getMonth() === last.getMonth()) {
    return monthFmt.format(first)
  }
  return `${new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(first)} – ${monthFmt.format(last)}`
}

function formatDay(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(d)
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function buildMockGrid(days: Date[]): WeekGrid {
  const grid: WeekGrid = {}
  const today = new Date()

  days.forEach((d) => {
    const key = d.toISOString().slice(0, 10)
    grid[key] = {}
    const isToday = isSameDay(d, today)
    const isPast = d < today && !isToday
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    HOURS.forEach((h) => {
      if (isWeekend) {
        grid[key][h] = { status: 'blocked' }
        return
      }
      if (isPast) {
        if (h === 10 || h === 14) grid[key][h] = { status: 'booked', patientName: 'Patient', visitType: 'in_clinic' }
        else grid[key][h] = { status: 'empty' }
        return
      }
      if (isToday) {
        if (h === 9) grid[key][h] = { status: 'booked', patientName: 'Anil Kumar', visitType: 'in_clinic' }
        else if (h === 11) grid[key][h] = { status: 'booked', patientName: 'Priya Nair', visitType: 'home_visit' }
        else if (h === 14) grid[key][h] = { status: 'booked', patientName: 'Suresh Pillai', visitType: 'online' }
        else if (h === 13) grid[key][h] = { status: 'blocked' }
        else grid[key][h] = { status: 'available' }
        return
      }
      // Future days
      if (h === 10 || h === 15) grid[key][h] = { status: 'booked', patientName: 'Patient', visitType: 'in_clinic' }
      else if (h === 12) grid[key][h] = { status: 'blocked' }
      else grid[key][h] = { status: 'available' }
    })
  })

  return grid
}

const SLOT_STYLES: Record<SlotStatus, string> = {
  booked: 'bg-[#00766C] text-white',
  available: 'bg-[#E6F4F3] text-[#00766C] hover:bg-[#d0ece9] cursor-pointer',
  blocked: 'bg-[#F5F5F5] text-[#999999]',
  empty: 'bg-white',
}

function SlotCell({ slot, hour }: { slot: Slot; hour: number }) {
  if (slot.status === 'empty') {
    return <div className="h-14 border border-dashed border-[#E5E5E5] rounded-lg" />
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
        <h1 className="text-[32px] font-bold text-[#333333] tracking-tight">Calendar</h1>
        <Link
          href="/provider/availability"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline text-[14px] font-semibold transition-colors self-start sm:self-auto"
        >
          <Settings className="w-4 h-4" />
          Manage Availability
        </Link>
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevWeek}
              className="w-9 h-9 flex items-center justify-center border border-[#E5E5E5] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-[#333333]" />
            </button>
            <span className="text-[17px] font-semibold text-[#333333] min-w-[160px] text-center">
              {formatMonthRange(days)}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="w-9 h-9 flex items-center justify-center border border-[#E5E5E5] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-[#333333]" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 py-1.5 border border-[#E5E5E5] rounded-lg text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
            >
              Today
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[12px] text-[#666666]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#00766C] inline-block" />
              Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#E6F4F3] inline-block" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#F5F5F5] border border-[#E5E5E5] inline-block" />
              Blocked
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-[#E5E5E5]">
              <div />
              {days.map((d) => {
                const isToday = isSameDay(d, today)
                return (
                  <div
                    key={d.toISOString()}
                    className={`py-3 text-center ${isToday ? 'bg-[#E6F4F3]' : ''}`}
                  >
                    <div className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-[#00766C]' : 'text-[#999999]'}`}>
                      {formatDay(d)}
                    </div>
                    <div className={`text-[20px] font-bold mt-0.5 ${isToday ? 'text-[#00766C]' : 'text-[#333333]'}`}>
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
                    <span className="text-[11px] text-[#999999] font-medium">{formatHour(h)}</span>
                  </div>
                  {days.map((d) => {
                    const key = d.toISOString().slice(0, 10)
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
