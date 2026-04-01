'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Calendar, Clock, MapPin, Home, ShieldCheck, Check, Sparkles, MoveRight, HelpCircle } from 'lucide-react'
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
  in_clinic: { label: 'In-clinic', icon: MapPin, iconColor: 'text-teal-600', bgColor: 'bg-teal-50' },
  home_visit: { label: 'Home Visit', icon: Home, iconColor: 'text-orange-600', bgColor: 'bg-orange-50' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface DayEntry { label: string; dayNum: number; iso: string; dayName: string }

function getNext7Days(): DayEntry[] {
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    return { 
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[d.getDay()], 
      dayNum: d.getDate(), 
      dayName: DAY_NAMES[d.getDay()],
      iso 
    }
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
    <div className="mb-8 last:mb-0">
      <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 pl-1">
        {heading}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot)}
              className={cn(
                "relative py-3.5 rounded-2xl text-[14px] font-black transition-all duration-300 border flex flex-col items-center justify-center gap-0.5 overflow-hidden active:scale-[0.97]",
                isSelected
                  ? "bg-[#00766C] text-white border-[#00766C] shadow-2xl shadow-teal-900/10 scale-[1.05] z-10"
                  : "bg-white text-[#333333] border-gray-100 hover:border-teal-100 hover:bg-teal-50/10 text-gray-500"
              )}
            >
              <div className="flex items-center gap-1">
                 {formatSlotTime(slot.starts_at).split(' ')[0]}
                 {isSelected && <Check size={12} strokeWidth={4} className="animate-in zoom-in-50 duration-300" />}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-teal-200" : "text-gray-300")}>
                 {formatSlotTime(slot.starts_at).split(' ')[1]}
              </span>
              
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
  const [packageSessions, setPackageSessions] = useState(1)

  useEffect(() => {
    let cancelled = false
    setTimeout(() => {
      setSlotsLoading(true)
      setSelectedSlot(null)
    }, 0)

    // Using a more reliable ISO string construction for India timezone
    const from = `${selectedDate}T00:00:00+05:30`
    const to = `${selectedDate}T23:59:59+05:30`
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
    <div className="bg-white rounded-[48px] border border-gray-100 p-8 shadow-[0_48px_80px_-32px_rgba(0,0,0,0.12)] sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar relative">
      
      {/* ── Background Glow ── */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-50 rounded-full blur-[100px] -z-0 opacity-40"></div>

      {/* ── Header ── */}
      <div className="flex flex-col gap-6 mb-8 relative z-10">
        <div className="flex items-center justify-between">
           <div className="px-4 py-1.5 bg-[#E6F4F3] text-[#00766C] text-[11px] font-black uppercase tracking-[0.15em] rounded-xl border border-teal-100">
              Direct Booking
           </div>
           <button className="text-gray-300 hover:text-gray-400 transition-colors">
              <HelpCircle size={20} />
           </button>
        </div>
        
        <div>
           <div className="flex items-baseline gap-2">
              <span className="text-[44px] font-black text-[#333333] tracking-tighter leading-none">₹{selectedFee}</span>
              <span className="text-[14px] text-gray-300 font-bold uppercase tracking-widest leading-none">Consult Fee</span>
           </div>
           <p className="text-[13px] font-medium text-gray-400 mt-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#059669]" />
              Secure Payment at Clinic
           </p>
        </div>
      </div>

      {/* ── Visit Type Interaction ── */}
      <div className="space-y-4 mb-10 relative z-10">
        {/* <label className="text-[11px] font-black text-gray-300 uppercase tracking-widest pl-1">Consultation Mode</label> */}
        <div className="flex bg-gray-50 p-2 rounded-[28px] border border-gray-100/50 shadow-inner">
          {(visitTypes as VisitType[]).map((type) => {
            const isActive = visitType === type
            const Icon = VISIT_TYPE_LABELS[type]?.icon || Globe
            return (
              <button
                key={type}
                onClick={() => { setVisitType(type); setSelectedSlot(null) }}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[22px] transition-all duration-500 active:scale-95",
                  isActive 
                    ? "bg-white text-[#00766C] shadow-2xl shadow-teal-900/5 font-black scale-[1.02]" 
                    : "text-gray-400 font-bold hover:text-gray-600"
                )}
              >
                <div className={cn("p-2 rounded-xl transition-colors", isActive ? "bg-[#E6F4F3] text-[#00766C]" : "bg-transparent text-gray-300")}>
                   <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className="text-[11px] uppercase tracking-widest font-black leading-none">{VISIT_TYPE_LABELS[type]?.label ?? type}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Horizontal Date Rail ── */}
      <div className="mb-10 relative z-10">
        <div className="flex items-center justify-between mb-4 px-1">
           <label className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Select Schedule</label>
           <span className="text-[11px] font-black text-[#00766C]/40 uppercase tracking-widest">Week View</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
          {days.map((day) => {
            const isSelected = selectedDate === day.iso
            return (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={cn(
                  "group flex flex-col items-center justify-center min-w-[72px] h-[80px] rounded-[24px] transition-all duration-500 border active:scale-95",
                  isSelected
                    ? "bg-[#333333] text-white border-[#333333] shadow-2xl scale-[1.05]"
                    : "bg-white text-[#333333] border-gray-100 hover:border-teal-100 hover:bg-teal-50/10"
                )}
              >
                <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", isSelected ? "text-gray-400" : "text-gray-300 transition-colors group-hover:text-teal-400")}>
                  {day.label}
                </span>
                <span className="text-[20px] font-black tracking-tighter">{day.dayNum}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Interactive Time Slots ── */}
      <div className="mb-10 relative z-10">
        <div className="bg-[#FCFDFD] rounded-[40px] p-6 lg:p-8 border border-gray-100/50 min-h-[300px]">
          {slotsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#00766C] animate-spin" />
              <div className="text-center">
                 <p className="text-[14px] font-black text-[#333333] uppercase tracking-widest">Scanning</p>
                 <p className="text-[11px] font-bold text-gray-300">Live Availability</p>
              </div>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-3xl border border-gray-50 shadow-sm flex items-center justify-center mb-4 text-gray-200">
                 <Calendar className="w-8 h-8" />
              </div>
              <p className="text-[15px] text-[#333333] font-black tracking-tight">Fully Booked</p>
              <p className="text-[13px] text-gray-400 font-bold mt-1">Try another date for availability</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TimeSlotGroup heading="Morning Insights" slots={grouped.morning} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
              <TimeSlotGroup heading="Afternoon Slots" slots={grouped.afternoon} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
              <TimeSlotGroup heading="Evening Sessions" slots={grouped.evening} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
            </div>
          )}
        </div>
      </div>

      {/* ── Treatment Estimator (Suggestion #8) ── */}
      <div className="mb-10 relative z-10 px-1">
         <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Treatment Estimator</label>
            {packageSessions > 1 && (
               <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-in fade-in zoom-in duration-500">
                  Expert Recommended - Save {packageSessions === 3 ? '12%' : '24%'}
               </div>
            )}
         </div>
         
         <div className="bg-gray-50 rounded-2xl p-1 border border-gray-100/50 shadow-inner flex h-14">
            {[1, 3, 5].map((n) => (
               <button
                  key={n}
                  onClick={() => setPackageSessions(n)}
                  className={cn(
                     "flex-1 flex flex-col items-center justify-center transition-all duration-500 rounded-xl active:scale-95",
                     packageSessions === n
                        ? "bg-white text-[#00766C] shadow-2xl shadow-teal-900/5 scale-[1.03] font-black"
                        : "text-gray-400 font-bold hover:text-gray-600"
                  )}
               >
                  <span className="text-[13px]">{n} {n === 1 ? 'Session' : 'Sessions'}</span>
                  {n > 1 && <span className={cn("text-[9px] uppercase tracking-widest -mt-0.5", packageSessions === n ? "text-[#00766C]/60" : "text-gray-300")}>{n === 3 ? 'Silver' : 'Gold'} Plan</span>}
               </button>
            ))}
         </div>

         <div className="mt-6 pt-4 border-t border-dashed border-gray-100 text-center animate-in fade-in duration-700">
            <div className="flex items-baseline justify-center gap-1.5">
               <span className="text-[32px] font-black text-[#333333] tracking-tighter">₹{selectedFee * packageSessions}</span>
               {packageSessions > 1 && (
                  <span className="text-[14px] text-gray-400 font-bold line-through opacity-40 ml-1">₹{selectedFee * packageSessions + (packageSessions === 3 ? 400 : 900)}</span>
               )}
               <span className="text-[13px] text-gray-400 font-bold ml-1 uppercase tracking-widest">Total Est.</span>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Based on {VISIT_TYPE_LABELS[visitType]?.label ?? visitType} selection</p>
         </div>
      </div>

      {/* ── High-Conversion CTA ── */}
      <div className="relative z-10 pt-2">
        <button
          type="button"
          onClick={handleBook}
          disabled={!canBook}
          className={cn(
            "group/cta w-full h-20 rounded-[28px] text-[18px] font-black transition-all duration-500 relative overflow-hidden flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]",
            canBook
              ? "bg-[#FF6B35] text-white shadow-orange-900/10 hover:shadow-orange-900/20"
              : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
          )}
        >
          <div className="relative z-10 flex items-center gap-3">
             {canBook ? 'Secure This Appointment' : 'Select a Time Slot'}
             <MoveRight size={22} strokeWidth={3} className="group-hover/cta:translate-x-2 transition-transform duration-500" />
          </div>
          
          {canBook && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cta:animate-shine transition-transform duration-1000"></div>
          )}
        </button>
        
        <div className="mt-6 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No Prepayment Required</span>
           </div>
        </div>
      </div>
    </div>
  )
}
