'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface FeeMap { in_clinic: number; home_visit: number; online: number }
interface BookingCardProps { doctorId: string; fee: FeeMap; visitTypes: readonly VisitType[] }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIME_SLOTS = {
  morning: ['9:00', '9:30', '10:00', '11:00', '11:30'],
  afternoon: ['2:00', '2:30', '3:00', '3:30', '4:00'],
  evening: ['5:30', '6:00', '6:30', '7:00'],
}

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
  online: 'Online',
}

// ---------------------------------------------------------------------------
// Helper: generate 7 days starting from today
// ---------------------------------------------------------------------------

interface DayEntry { label: string; dayNum: number; iso: string }

function getNext7Days(): DayEntry[] {
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    return { label: DAY_NAMES[d.getDay()], dayNum: d.getDate(), iso }
  })
}

// ---------------------------------------------------------------------------
// Sub-component: TimeSlotGroup
// ---------------------------------------------------------------------------

interface TimeSlotGroupProps {
  heading: string; slots: string[]; selectedTime: string | null; onSelect: (time: string) => void
}

function TimeSlotGroup({ heading, slots, selectedTime, onSelect }: TimeSlotGroupProps) {
  return (
    <div className="mb-4">
      <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider mb-2">
        {heading}
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot
          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all outline-none ${
                isSelected
                  ? 'border border-[#00766C] bg-[#00766C] text-white'
                  : 'border border-[#E5E5E5] bg-[#F5F5F5] text-[#333333] hover:border-[#00766C]'
              }`}
            >
              {slot}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BookingCard({ doctorId, fee, visitTypes }: BookingCardProps) {
  const router = useRouter()
  const days = useMemo(() => getNext7Days(), [])

  const [visitType, setVisitType] = useState<VisitType>('in_clinic')
  const [selectedDate, setSelectedDate] = useState<string>(days[0].iso)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const selectedFee = fee[visitType]
  const canBook = selectedDate && selectedTime

  function handleBook() {
    if (!canBook) return
    const params = new URLSearchParams({ date: selectedDate, time: selectedTime!, type: visitType })
    router.push(`/book/${doctorId}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-[8px] border border-[#E5E5E5] p-6 sticky top-24">
      {/* Fee */}
      <div className="mb-5">
        <span className="text-[24px] font-bold text-[#333333]">₹{selectedFee}</span>
        <span className="text-[14px] text-[#666666] ml-1">/ session</span>
      </div>

      {/* Visit type tabs */}
      <div className="flex border-b border-[#E5E5E5] mb-5">
        {visitTypes.map((type) => {
          const isActive = visitType === type
          return (
            <button
              key={type}
              onClick={() => setVisitType(type)}
              className={`flex-1 py-2.5 px-1 text-[13px] bg-transparent border-none cursor-pointer transition-all -mb-px whitespace-nowrap outline-none ${
                isActive
                  ? 'font-semibold text-[#00766C] border-b-2 border-[#00766C]'
                  : 'font-normal text-[#666666] border-b-2 border-transparent'
              }`}
            >
              {VISIT_TYPE_LABELS[type]}
            </button>
          )
        })}
      </div>

      {/* Date selector */}
      <p className="text-[13px] font-semibold text-[#333333] mb-2.5">Select Date</p>
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        {days.map((day) => {
          const isSelected = selectedDate === day.iso
          return (
            <button
              key={day.iso}
              onClick={() => { setSelectedDate(day.iso); setSelectedTime(null) }}
              className={`flex flex-col items-center px-3 py-2 rounded-[8px] cursor-pointer transition-all min-w-[52px] shrink-0 outline-none ${
                isSelected
                  ? 'border border-[#00766C] bg-[#00766C] text-white'
                  : 'border border-[#E5E5E5] bg-[#F5F5F5] text-[#333333] hover:border-[#00766C]'
              }`}
            >
              <span className="text-[11px] font-medium">{day.label}</span>
              <span className="text-[16px] font-bold">{day.dayNum}</span>
            </button>
          )
        })}
      </div>

      {/* Time slots */}
      <p className="text-[13px] font-semibold text-[#333333] mb-3">Select Time</p>
      <TimeSlotGroup heading="Morning" slots={TIME_SLOTS.morning} selectedTime={selectedTime} onSelect={setSelectedTime} />
      <TimeSlotGroup heading="Afternoon" slots={TIME_SLOTS.afternoon} selectedTime={selectedTime} onSelect={setSelectedTime} />
      <TimeSlotGroup heading="Evening" slots={TIME_SLOTS.evening} selectedTime={selectedTime} onSelect={setSelectedTime} />

      {/* CTA button */}
      <button
        onClick={handleBook}
        disabled={!canBook}
        className={`w-full flex items-center justify-center gap-2 py-3.5 text-[16px] font-semibold text-white rounded-full mt-2 mb-2 transition-colors outline-none ${
          canBook
            ? 'bg-[#00766C] hover:bg-[#005A52] cursor-pointer'
            : 'bg-[#A0CEC9] cursor-not-allowed'
        }`}
      >
        Book Session
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* No hidden charges */}
      <p className="text-[12px] text-[#666666] text-center">
        No hidden charges
      </p>
    </div>
  )
}
