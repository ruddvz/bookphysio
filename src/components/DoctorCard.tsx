'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Star, MapPin, ShieldCheck, Clock, Check, MoveRight, Calendar } from 'lucide-react'

export interface Doctor {
  id: string
  name: string
  credentials: string
  specialty: string
  rating: number
  reviewCount: number
  location: string
  distance: string
  nextSlot: string
  visitTypes: string[]
  fee: number
  icpVerified: boolean
  lat?: number | null
  lng?: number | null
}

interface DoctorCardProps {
  doctor: Doctor
  className?: string
  isHovered?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

// Deterministic slot generation based on doctor ID — avoids hydration mismatches
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateDeterministicSlots(id: string) {
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rand = seededRand(seed)
  const days = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const count = Math.floor(rand() * 5)
    const slots: string[] = []
    if (count > 0) {
      const startHour = 9 + Math.floor(rand() * 4)
      for (let s = 0; s < count; s++) {
        const hour = startHour + s
        const period = hour < 12 ? 'AM' : 'PM'
        const displayHour = hour > 12 ? hour - 12 : hour
        slots.push(`${displayHour}:00 ${period}`)
      }
    }

    days.push({
      date,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      iso: date.toISOString().split('T')[0],
      slots,
    })
  }
  return days
}

export default function DoctorCard({ doctor, className, isHovered, onMouseEnter, onMouseLeave }: DoctorCardProps) {
  const router = useRouter()
  const [startIndex, setStartIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; dayIso: string } | null>(null)

  const availability = useMemo(() => generateDeterministicSlots(doctor.id), [doctor.id])
  const visibleDays = availability.slice(startIndex, startIndex + 3)

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setStartIndex(Math.max(0, startIndex - 1))
  }
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setStartIndex(Math.min(availability.length - 3, startIndex + 1))
  }

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    const params = new URLSearchParams({ date: selectedSlot?.dayIso ?? '', time: selectedSlot?.time ?? '' })
    router.push(`/book/${doctor.id}?${params.toString()}`)
  }

  const initials = doctor.name.replace('Dr. ', '').split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group bg-white rounded-[32px] border transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:border-[#00766C] hover:-translate-y-1 relative overflow-hidden',
        isHovered ? 'border-[#00766C] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]' : 'border-gray-100',
        className
      )}
      aria-label={`${doctor.name} - ${doctor.specialty}`}
    >
      {/* Premium Backdrop Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-teal-50/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col xl:flex-row gap-8 lg:gap-10 relative z-10">

        {/* ── Left: Avatar + Info ── */}
        <div className="flex flex-1 gap-6 md:gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-[36px] bg-gradient-to-br from-[#F0F9F8] to-[#D1F1EF] text-[#00766C] flex items-center justify-center text-[28px] md:text-[32px] font-black select-none border-4 border-white shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-teal-900/5"
              aria-hidden="true"
            >
              {initials}
            </div>
            {doctor.icpVerified && (
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-2xl shadow-xl border border-gray-50">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <ShieldCheck size={16} strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col pt-1">
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-[20px] md:text-[24px] font-black text-[#333333] leading-none tracking-tight">
                  {doctor.name}
                </h3>
                <div className="flex items-center gap-1.5 bg-[#FFFBEB] px-3 py-1 rounded-full border border-[#FEF3C7] shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="text-[13px] font-black text-[#92400E]">{doctor.rating.toFixed(1)}</span>
                  {doctor.reviewCount > 0 && (
                    <span className="text-[11px] font-bold text-[#B45309]">({doctor.reviewCount})</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[13px] font-black text-[#00766C] tracking-tight">{doctor.specialty}</span>
                <span className="text-gray-200">·</span>
                <span className="text-[13px] font-bold text-gray-400 capitalize">{doctor.credentials}</span>
              </div>
            </div>

            {/* Location & Next Slot */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-[14px] font-bold text-gray-500">
                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                  <MapPin size={14} />
                </div>
                <span className="truncate">{doctor.location}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[14px] font-bold text-[#00766C]">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center text-[#00766C] shrink-0">
                  <Clock size={14} />
                </div>
                <span className="truncate">{doctor.nextSlot}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {doctor.visitTypes.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      'px-3 py-1 rounded-xl text-[11px] font-black tracking-tight uppercase border shadow-sm',
                      type === 'In-clinic' && 'bg-teal-50 text-teal-700 border-teal-100',
                      type === 'Home Visit' && 'bg-orange-50 text-orange-700 border-orange-100',
                      type === 'Online' && 'bg-blue-50 text-blue-700 border-blue-100',
                    )}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-5 flex items-baseline gap-2">
              <span className="text-[26px] font-black text-[#333333] tracking-tighter">₹{doctor.fee}</span>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Consult Fee</span>
            </div>
          </div>
        </div>

        {/* ── Right: Availability Grid ── */}
        <div className="w-full xl:w-[340px] shrink-0">
          <div className="bg-[#F9FBFC] rounded-[36px] p-5 lg:p-7 border border-gray-100 relative overflow-hidden shadow-inner shadow-gray-100/50">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h4 className="text-[13px] font-black text-[#333333] tracking-tight flex items-center gap-2">
                  <Calendar size={14} className="text-[#00766C]" />
                  Choose a Slot
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Available This Week</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                  aria-label="Previous days"
                  className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-gray-50 shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={startIndex >= availability.length - 3}
                  aria-label="Next days"
                  className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-gray-50 shadow-sm active:scale-90"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
              {visibleDays.map((day) => (
                <div key={day.iso} className="flex flex-col gap-3">
                  <div className="text-center">
                    <div className="text-[12px] font-black text-gray-800">{day.label}</div>
                    <div className="text-[10px] font-bold text-gray-300 tracking-tight">{day.dateLabel}</div>
                  </div>

                  <div className="flex flex-col gap-2 min-h-[120px]">
                    {day.slots.length > 0 ? (
                      <>
                        {day.slots.slice(0, 3).map((slot) => {
                          const isSelected = selectedSlot?.time === slot && selectedSlot?.dayIso === day.iso
                          return (
                            <button
                              key={slot}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedSlot(isSelected ? null : { time: slot, dayIso: day.iso })
                              }}
                              aria-pressed={isSelected}
                              className={cn(
                                'w-full py-2.5 rounded-xl text-[12px] font-black transition-all duration-300 border flex items-center justify-center gap-1',
                                isSelected
                                  ? 'bg-[#00766C] text-white border-[#00766C] shadow-lg shadow-teal-200 scale-[1.04]'
                                  : 'bg-white text-[#333333] border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 active:scale-95'
                              )}
                            >
                              {slot.split(' ')[0]}
                              {isSelected && <Check size={11} strokeWidth={4} className="animate-in zoom-in duration-200" />}
                            </button>
                          )
                        })}
                        {day.slots.length > 3 && (
                          <p className="text-center text-[10px] font-black text-gray-300 tracking-widest pt-1">
                            +{day.slots.length - 3}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-gray-100 opacity-40">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">N/A</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 relative z-10">
              <button
                onClick={handleBook}
                className={cn(
                  'w-full h-14 rounded-[20px] text-[15px] font-black transition-all duration-500 overflow-hidden relative group/book shadow-lg active:scale-[0.98]',
                  selectedSlot
                    ? 'bg-[#FF6B35] text-white shadow-orange-200/50'
                    : 'bg-[#333333] text-white hover:bg-[#00766C]'
                )}
              >
                <div className="flex items-center justify-center gap-3 relative z-10">
                  {selectedSlot ? 'Confirm This Slot' : 'View Full Schedule'}
                  <MoveRight size={18} strokeWidth={3} className="group-hover/book:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/book:animate-shine" />
              </button>

              {selectedSlot && (
                <p className="text-center text-[10px] font-black text-[#00766C] uppercase tracking-widest mt-3 animate-in slide-in-from-top-2">
                  ⚡ Instant Confirmation Guaranteed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
