'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Calendar, Clock, MapPin, Globe, Home, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const VISIT_TYPE_LABELS: Record<VisitType, { label: string; icon: any }> = {
  in_clinic: { label: 'In-clinic', icon: MapPin },
  home_visit: { label: 'Home Visit', icon: Home },
  online: { label: 'Online', icon: Globe },
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
    <div className="mb-6 last:mb-0">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
        {heading}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot)}
              className={cn(
                "py-2.5 rounded-xl text-[13px] font-bold transition-all border",
                isSelected
                  ? "bg-[#00766C] text-white border-[#00766C] shadow-lg shadow-teal-50"
                  : "bg-white text-[#00766C] border-[#E5E5E5] hover:border-[#00766C] hover:bg-teal-50/30"
              )}
            >
              {formatSlotTime(slot.starts_at).split(' ')[0]}
              <span className="text-[10px] ml-0.5 opacity-70">{formatSlotTime(slot.starts_at).split(' ')[1]}</span>
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
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
      {/* Pricing Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
           <span className="text-[32px] font-black text-[#333333]">₹{selectedFee}</span>
           <span className="text-[14px] text-gray-500 font-bold ml-1.5 uppercase">Per session</span>
        </div>
        <div className="bg-teal-50 text-[#00766C] px-2 py-1 rounded-md">
           <MapPin size={16} />
        </div>
      </div>

      {/* Visit type tabs */}
      <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
        {(visitTypes as VisitType[]).map((type) => {
          const isActive = visitType === type
          const Icon = VISIT_TYPE_LABELS[type]?.icon || Globe
          return (
            <button
              key={type}
              onClick={() => { setVisitType(type); setSelectedSlot(null) }}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all",
                isActive 
                  ? "bg-white text-[#00766C] shadow-md font-bold" 
                  : "text-gray-400 font-medium hover:text-gray-600"
              )}
            >
              <Icon size={14} className={isActive ? "text-[#00766C]" : "text-gray-300"} />
              <span className="text-[11px] uppercase tracking-tighter">{VISIT_TYPE_LABELS[type]?.label ?? type}</span>
            </button>
          )
        })}
      </div>

      {/* Date selector */}
      <div className="mb-6">
        <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
          Select Date
        </label>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {days.map((day) => {
            const isSelected = selectedDate === day.iso
            return (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[58px] aspect-square rounded-2xl transition-all border",
                  isSelected
                    ? "bg-[#00766C] text-white border-[#00766C] shadow-lg shadow-teal-50"
                    : "bg-white text-[#333333] border-[#E5E5E5] hover:border-[#00766C]"
                )}
              >
                <span className={cn("text-[10px] font-black uppercase", isSelected ? "text-teal-100" : "text-gray-400")}>
                  {day.label}
                </span>
                <span className="text-[18px] font-black">{day.dayNum}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-8">
        <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
          Select time
        </label>

        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          {slotsLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 italic">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#00766C]/30" />
              <span className="text-[13px] font-bold">Scanning availability...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-[13px] text-gray-400 font-bold">No slots found for this day</p>
            </div>
          ) : (
            <div className="space-y-6">
              <TimeSlotGroup heading="Morning" slots={grouped.morning} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
              <TimeSlotGroup heading="Afternoon" slots={grouped.afternoon} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
              <TimeSlotGroup heading="Evening" slots={grouped.evening} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
            </div>
          )}
        </div>
      </div>

      {/* CTA button */}
      <button
        type="button"
        onClick={handleBook}
        disabled={!canBook}
        className={cn(
          "w-full flex items-center justify-center gap-3 py-4 text-[16px] font-black text-white rounded-2xl transition-all shadow-xl shadow-teal-50",
          canBook
            ? "bg-[#FF6B35] hover:bg-[#E85D2A] hover:scale-[1.02] active:scale-[0.98]"
            : "bg-gray-200 cursor-not-allowed text-gray-400 shadow-none"
        )}
      >
        {canBook ? 'Book Now' : 'Choose a time'}
        <ArrowRight size={18} />
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
         <ShieldCheck size={14} className="text-[#059669]" />
         <span className="text-[12px] font-bold uppercase tracking-tight">No hidden charges · Pay at clinic</span>
      </div>
    </div>
  )
}
