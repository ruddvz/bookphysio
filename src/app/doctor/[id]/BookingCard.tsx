'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface FeeMap { in_clinic: number; home_visit: number; online: number }
interface BookingCardProps {
  doctorId: string
  fee: FeeMap
  visitTypes: readonly VisitType[] | string[]
}

interface SlotEntry {
  id: string
  starts_at: string
  ends_at: string
  slot_duration_mins: number
  location_id: string | null
}

interface GroupedSlots {
  morning: SlotEntry[]
  afternoon: SlotEntry[]
  evening: SlotEntry[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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
    return { label: i === 0 ? 'Today' : DAY_NAMES[d.getDay()], dayNum: d.getDate(), iso }
  })
}

function groupSlots(slots: SlotEntry[]): GroupedSlots {
  const groups: GroupedSlots = { morning: [], afternoon: [], evening: [] }
  for (const slot of slots) {
    const hour = new Date(slot.starts_at).getHours()
    if (hour < 12) groups.morning.push(slot)
    else if (hour < 17) groups.afternoon.push(slot)
    else groups.evening.push(slot)
  }
  return groups
}

function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ---------------------------------------------------------------------------
// Sub-component: TimeSlotGroup
// ---------------------------------------------------------------------------

interface TimeSlotGroupProps {
  heading: string
  slots: SlotEntry[]
  selectedSlotId: string | null
  onSelect: (slot: SlotEntry) => void
}

function TimeSlotGroup({ heading, slots, selectedSlotId, onSelect }: TimeSlotGroupProps) {
  if (slots.length === 0) return null
  return (
    <div className="mb-4">
      <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider mb-2">
        {heading}
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all outline-none ${
                isSelected
                  ? 'border border-[#00766C] bg-[#00766C] text-white'
                  : 'border border-[#E5E5E5] bg-[#F5F5F5] text-[#333333] hover:border-[#00766C]'
              }`}
            >
              {formatSlotTime(slot.starts_at)}
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

  const [visitType, setVisitType] = useState<VisitType>((visitTypes[0] as VisitType) ?? 'in_clinic')
  const [selectedDate, setSelectedDate] = useState<string>(days[0].iso)
  const [selectedSlot, setSelectedSlot] = useState<SlotEntry | null>(null)
  const [slots, setSlots] = useState<SlotEntry[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Fetch slots whenever date changes
  useEffect(() => {
    let cancelled = false
    setSlotsLoading(true)
    setSelectedSlot(null)

    const from = new Date(selectedDate + 'T00:00:00+05:30').toISOString()
    const to = new Date(selectedDate + 'T23:59:59+05:30').toISOString()
    const qs = new URLSearchParams({ from, to }).toString()

    fetch(`/api/providers/${doctorId}/availability?${qs}`)
      .then((r) => r.json())
      .then((data: { slots?: SlotEntry[] }) => {
        if (!cancelled) setSlots(data.slots ?? [])
      })
      .catch(() => {
        if (!cancelled) setSlots([])
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => { cancelled = true }
  }, [doctorId, selectedDate])

  const grouped = useMemo(() => groupSlots(slots), [slots])

  const feeKey = visitType as VisitType
  const selectedFee = fee[feeKey] ?? fee.in_clinic

  function handleBook() {
    if (!selectedSlot) return
    const params = new URLSearchParams({
      date: selectedDate,
      time: formatSlotTime(selectedSlot.starts_at),
      type: visitType,
      slot_id: selectedSlot.id,
    })
    router.push(`/book/${doctorId}?${params.toString()}`)
  }

  const canBook = selectedSlot !== null

  return (
    <div className="bg-white rounded-[8px] border border-[#E5E5E5] p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Fee */}
      <div className="mb-5">
        <span className="text-[24px] font-bold text-[#333333]">₹{selectedFee}</span>
        <span className="text-[14px] text-[#666666] ml-1">/ session</span>
      </div>

      {/* Visit type tabs */}
      <div className="flex border-b border-[#E5E5E5] mb-5">
        {(visitTypes as VisitType[]).map((type) => {
          const isActive = visitType === type
          return (
            <button
              key={type}
              onClick={() => { setVisitType(type); setSelectedSlot(null) }}
              className={`flex-1 py-2.5 px-1 text-[13px] bg-transparent border-none cursor-pointer transition-all -mb-px whitespace-nowrap outline-none ${
                isActive
                  ? 'font-semibold text-[#00766C] border-b-2 border-[#00766C]'
                  : 'font-normal text-[#666666] border-b-2 border-transparent'
              }`}
            >
              {VISIT_TYPE_LABELS[type] ?? type}
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
              onClick={() => setSelectedDate(day.iso)}
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

      {slotsLoading ? (
        <div className="flex items-center justify-center py-6 text-[#666666]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-[13px]">Loading slots…</span>
        </div>
      ) : slots.length === 0 ? (
        <p className="text-[13px] text-[#999999] py-4 text-center">No slots available for this date.</p>
      ) : (
        <>
          <TimeSlotGroup heading="Morning" slots={grouped.morning} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
          <TimeSlotGroup heading="Afternoon" slots={grouped.afternoon} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
          <TimeSlotGroup heading="Evening" slots={grouped.evening} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
        </>
      )}

      {/* CTA button */}
      <button
        type="button"
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

      <p className="text-[12px] text-[#666666] text-center">
        No hidden charges
      </p>
    </div>
  )
}
