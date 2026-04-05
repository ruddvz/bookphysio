'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Calendar, MapPin, Home, ShieldCheck, Lock } from 'lucide-react'
import { formatIndiaDateInput, formatIndiaTime, getIndiaDayNumber, getIndiaWeekdayShort } from '@/lib/india-date'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit'

interface FeeMap { in_clinic: number; home_visit: number }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VISIT_TYPE_LABELS: Record<VisitType, { label: string; icon: any; iconColor: string; bgColor: string }> = {
  in_clinic: { label: 'In-clinic', icon: MapPin, iconColor: 'text-bp-accent', bgColor: 'bg-bp-accent/10' },
  home_visit: { label: 'Home Visit', icon: Home, iconColor: 'text-bp-secondary', bgColor: 'bg-bp-secondary/10' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface DayEntry { label: string; dayNum: number; iso: string; dayName: string }

function getSlotHourInIndia(isoString: string): number {
  return Number.parseInt(formatIndiaTime(isoString, { hour: 'numeric', hour12: false }), 10)
}

function getNext7Days(): DayEntry[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = formatIndiaDateInput(d)
    const weekday = getIndiaWeekdayShort(d)
    return { 
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday,
      dayNum: getIndiaDayNumber(d),
      dayName: weekday,
      iso 
    }
  })
}

export function groupSlots(slots: SlotEntry[]): GroupedSlots {
  const groups: GroupedSlots = { morning: [], afternoon: [], evening: [] }
  for (const slot of slots) {
    const hour = getSlotHourInIndia(slot.starts_at)
    if (hour < 12) groups.morning.push(slot)
    else if (hour < 17) groups.afternoon.push(slot)
    else groups.evening.push(slot)
  }
  return groups
}

export function formatSlotTime(isoString: string): string {
  return formatIndiaTime(isoString, { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ---------------------------------------------------------------------------
// Sub-component: TimeSlotGroup (Ultra Premium)
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
      <p className="text-[10px] font-bold text-bp-body/40 uppercase tracking-[0.2em] mb-3 ml-1">
        {heading}
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot)}
              className={cn(
                "relative py-5 rounded-[22px] text-[15px] font-bold transition-all duration-500 border flex flex-col items-center justify-center gap-1 overflow-hidden active:scale-95 group",
                isSelected
                  ? "bg-[#111111] text-white border-[#111111] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] scale-[1.05] z-10"
                  : "bg-white text-bp-primary border-bp-border/40 hover:border-bp-primary/60 hover:shadow-[0_8px_16px_-4px_rgba(0,118,108,0.08)]"
              )}
            >
              <div className="flex items-center gap-1.5 transition-transform duration-500 group-hover:scale-110">
                 {formatSlotTime(slot.starts_at).split(' ')[0]}
                 {isSelected && <div className="w-1.5 h-1.5 bg-bp-accent rounded-full animate-pulse" />}
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.2em] transition-opacity duration-500", 
                isSelected ? "text-white/50" : "text-bp-body/30 group-hover:text-bp-primary/60"
              )}>
                 {formatSlotTime(slot.starts_at).split(' ')[1]}
              </span>
              {isSelected && (
                <div className="absolute top-0 right-0 p-1.5">
                   <div className="w-2 h-2 bg-bp-accent rounded-full blur-[4px] opacity-60" />
                </div>
              )}
              {isSelected && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine pointer-events-none"></div>
              )}
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
    setTimeout(() => {
      setSlotsLoading(true)
      setSelectedSlot(null)
    }, 0)

    // Using a more reliable ISO string construction for India timezone
    const from = `${selectedDate}T00:00:00+05:30`
    const to = `${selectedDate}T23:59:59+05:30`
    const qs = new URLSearchParams({ from, to, visit_type: visitType }).toString()

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
  }, [doctorId, selectedDate, visitType])

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

    if (selectedSlot.location_id) {
      params.set('location_id', selectedSlot.location_id)
    }

    router.push(`/book/${doctorId}?${params.toString()}`)
  }

  const canBook = selectedSlot !== null

  return (
    <div className="bg-white rounded-[40px] border border-bp-border/30 p-8 shadow-[0_32px_64px_-16px_rgba(var(--color-bp-primary-rgb),0.08)] sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar relative overflow-hidden">
      
      {/* ── Background Glow ── */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-bp-primary/10 rounded-full blur-[100px] -z-0 opacity-60"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-bp-accent/20/20 rounded-full blur-[100px] -z-0 opacity-50"></div>

      {/* ── Header ── */}
      <div className="flex flex-col gap-5 mb-10 relative z-10">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 px-3 py-1 bg-bp-accent/10 border border-bp-accent/20/50 rounded-lg text-[10px] font-bold text-bp-accent uppercase tracking-widest leading-none">
              Secured Session
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">
              Available <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
           </div>
        </div>
        
        <div className="flex items-end justify-between pt-2">
           <div>
              <div className="flex items-baseline gap-2 mb-1">
                 <span className="text-[48px] font-bold text-bp-primary tracking-tighter leading-none">₹{selectedFee.toLocaleString('en-IN')}</span>
                 <span className="text-[14px] font-bold text-bp-body/40 uppercase tracking-widest mb-1">/ Session</span>
              </div>
              <p className="text-[13px] font-bold text-bp-body/40 flex items-center gap-2 mt-3">
                 <ShieldCheck size={16} className="text-bp-accent" />
                 Inc. of all medical documentation
              </p>
           </div>
        </div>
      </div>

      {/* ── Visit Type Interaction ── */}
      <div className="mb-10 relative z-10">
        <div className="grid grid-cols-2 gap-2 bg-bp-surface p-1.5 rounded-[28px] border border-bp-border/40 backdrop-blur-sm">
          {(visitTypes as VisitType[]).map((type) => {
            const isActive = visitType === type
            const Icon = VISIT_TYPE_LABELS[type]?.icon
            return (
              <button
                key={type}
                onClick={() => { setVisitType(type); setSelectedSlot(null) }}
                className={cn(
                  "flex items-center justify-center gap-2.5 py-4 rounded-[22px] transition-all duration-500 active:scale-95 group",
                  isActive 
                    ? "bg-white text-bp-primary shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05)] font-bold border border-bp-border/10 ring-1 ring-black/[0.02]" 
                    : "text-bp-body/40 font-bold hover:text-bp-primary/60"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-500", 
                  isActive ? "bg-bp-primary/5 text-bp-primary scale-110" : "text-bp-body/20 group-hover:scale-110"
                )}>
                   <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                </div>
                <div className="flex flex-col items-start leading-none gap-1">
                   <span className="text-[11px] uppercase tracking-widest font-bold">{VISIT_TYPE_LABELS[type]?.label ?? type}</span>
                   {isActive && <div className="h-0.5 w-4 bg-bp-primary/30 rounded-full animate-in slide-in-from-left-2 duration-700" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Horizontal Date Rail ── */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4 px-1">
           <label className="text-[10px] font-bold text-bp-body/40 uppercase tracking-widest">Available Calendar</label>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {days.map((day) => {
            const isSelected = selectedDate === day.iso
            return (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={cn(
                  "group flex flex-col items-center justify-center min-w-[72px] h-[84px] rounded-[24px] transition-all duration-500 border active:scale-95",
                  isSelected
                    ? "bg-[#111111] text-white border-[#111111] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] scale-[1.05]"
                    : "bg-white text-bp-body border-bp-border/40 hover:border-bp-primary/40 hover:shadow-[0_8px_16px_-4px_rgba(0,118,108,0.08)]"
                )}
              >
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 transition-colors duration-500", 
                  isSelected ? "text-white/40" : "text-bp-body/30 group-hover:text-bp-primary"
                )}>
                  {day.label}
                </span>
                <span className="text-[20px] font-bold tracking-tighter leading-none">{day.dayNum}</span>
                {isSelected && (
                   <div className="w-1 h-1 bg-bp-accent rounded-full mt-2 animate-in zoom-in duration-500 shadow-[0_0_8px_rgba(255,107,53,0.5)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Interactive Time Slots ── */}
      <div className="mb-10 relative z-10">
        <div className="bg-bp-surface/30 rounded-[32px] p-6 border border-bp-border/20 min-h-[280px]">
          {slotsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-bp-body/40 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-bp-border/20 border-t-bp-primary animate-spin" />
              <div className="text-center">
                 <p className="text-[12px] font-bold text-bp-primary uppercase tracking-widest">Checking</p>
                 <p className="text-[10px] font-bold text-bp-body/40">Real-time Sync</p>
              </div>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded-2xl border border-bp-border/40 shadow-sm flex items-center justify-center mb-4 text-bp-border">
                 <Calendar className="w-7 h-7" />
              </div>
              <p className="text-[14px] text-bp-primary font-bold tracking-tight">No Slots Available</p>
              <p className="text-[12px] text-bp-body/40 font-bold mt-1">Try another medical date</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <TimeSlotGroup heading="Morning Focus" slots={grouped.morning} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
              <TimeSlotGroup heading="Afternoon Rehab" slots={grouped.afternoon} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
              <TimeSlotGroup heading="Evening Care" slots={grouped.evening} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
            </div>
          )}
        </div>
      </div>

      {/* ── Action Button ── */}
      <div className="relative z-10 space-y-4 pt-4">
        <button
          onClick={handleBook}
          disabled={!canBook}
          className={cn(
            "w-full py-6 rounded-[32px] text-[18px] font-bold tracking-tight transition-all duration-700 flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_24px_48px_-12px_rgba(var(--color-bp-primary-rgb),0.2)]",
            canBook 
              ? "bg-[#111111] text-white hover:scale-[1.03] active:scale-95" 
              : "bg-bp-surface/80 text-bp-body/20 cursor-not-allowed border border-bp-border/40 shadow-none grayscale"
          )}
        >
          {canBook ? (
            <>
              Confirm Selection
              <ArrowRight size={22} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform duration-500" />
            </>
          ) : (
             "Select Preferred Slot"
          )}
          
          {canBook && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
          )}
        </button>
        
        <div className="flex flex-col gap-4 pt-2">
           <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-[24px] backdrop-blur-sm">
              <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center rounded-2xl text-emerald-600 shadow-sm shadow-emerald-200/50">
                 <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-emerald-700 uppercase tracking-widest leading-none">Transparent Pricing</p>
                <p className="text-[11px] font-medium text-emerald-600/60 mt-1">Consultation fee is shown before you confirm the booking</p>
              </div>
           </div>

           <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-bp-body/30 uppercase tracking-[0.2em] mt-2">
              <Lock size={12} className="opacity-50" />
              Secure Booking Flow
           </div>
        </div>
      </div>
    </div>
  )
}

