'use client'
import { useState, useMemo } from 'react'
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
}

// Helper to generate mock slots for the next 7 days
const generateMockSlots = () => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Randomize slot counts
    const count = Math.floor(Math.random() * 5)
    const slots = []
    if (count > 0) {
      const startHour = 9 + Math.floor(Math.random() * 4)
      for (let s = 0; s < count; s++) {
        const hour = startHour + s
        slots.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`)
      }
    }
    
    days.push({
      date,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      slots
    })
  }
  return days
}

export default function DoctorCard({ doctor, className }: DoctorCardProps) {
  const [startIndex, setStartIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  const availability = useMemo(() => generateMockSlots(), [])
  const visibleDays = availability.slice(startIndex, startIndex + 3)

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStartIndex(Math.max(0, startIndex - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStartIndex(Math.min(availability.length - 3, startIndex + 1))
  }

  const initials = doctor.name
    .replace('Dr. ', '')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <article
      className={cn(
        'group bg-white rounded-[32px] border border-gray-100 p-6 md:p-8 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:border-[#00766C]/10 hover:-translate-y-1 relative overflow-hidden',
        className
      )}
    >
      {/* Premium Backdrop Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-teal-50/20 rounded-full blur-[80px] group-hover:opacity-100 transition-opacity opacity-0"></div>
      
      <div className="flex flex-col xl:flex-row gap-8 lg:gap-10 relative z-10">
        
        {/* Left Section: Avatar and Info */}
        <div className="flex flex-1 gap-6 md:gap-8">
          {/* Avatar Stack */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-gradient-to-br from-[#F0F9F8] to-[#D1F1EF] text-[#00766C] flex items-center justify-center text-[28px] md:text-[36px] font-black select-none border-4 border-white shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-teal-900/5"
              aria-hidden="true"
            >
              {initials}
            </div>
            {doctor.icpVerified && (
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-2xl shadow-xl border border-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                   <ShieldCheck size={18} strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {/* Core Content */}
          <div className="flex-1 min-w-0 flex flex-col pt-1">
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-3">
                 <h3 className="text-[22px] md:text-[26px] font-black text-[#333333] leading-none tracking-tight">
                   {doctor.name}
                 </h3>
                 <div className="hidden sm:flex items-center gap-1.5 bg-[#FFFBEB] px-3 py-1 rounded-full border border-[#FEF3C7] shadow-sm">
                    <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="text-[14px] font-black text-[#92400E]">
                      {doctor.rating.toFixed(1)}
                    </span>
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                 <span className="text-[14px] font-black text-[#00766C] tracking-tight">{doctor.specialty}</span>
                 <span className="text-gray-200">·</span>
                 <span className="text-[14px] font-bold text-gray-400 capitalize">{doctor.credentials}</span>
              </div>
            </div>

            {/* Location & Visit Types */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[15px] font-bold text-gray-500">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
                <span className="truncate">{doctor.location}</span>
                {doctor.distance && <span className="text-gray-300">·</span>}
                {doctor.distance && <span className="text-gray-400 font-black">{doctor.distance}</span>}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {doctor.visitTypes.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[12px] font-black tracking-tight uppercase border shadow-sm transition-transform active:scale-95 cursor-default",
                      type === "In-clinic" && "bg-teal-50 text-teal-700 border-teal-100",
                      type === "Home Visit" && "bg-orange-50 text-orange-700 border-orange-100",
                      type === "Online" && "bg-blue-50 text-blue-700 border-blue-100",
                    )}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-auto pt-6 flex items-baseline gap-2">
              <span className="text-[28px] font-black text-[#333333] tracking-tighter">₹{doctor.fee}</span>
              <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Initial Consult</span>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive Availability Grid (High Fidelity) */}
        <div className="w-full xl:w-[360px] shrink-0">
          <div className="bg-[#F9FBFC] rounded-[40px] p-6 lg:p-8 border border-gray-100 relative overflow-hidden group/slots shadow-inner shadow-gray-100/50">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col">
                 <h4 className="text-[14px] font-black text-[#333333] tracking-tight flex items-center gap-2">
                   <Calendar size={16} className="text-[#00766C]" />
                   Choose a Slot
                 </h4>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Available This Week</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-gray-50 shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={startIndex >= availability.length - 3}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-20 transition-all hover:bg-gray-50 shadow-sm active:scale-90"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 relative z-10">
              {visibleDays.map((availabilityDay, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="text-center group/day">
                    <div className="text-[13px] font-black text-gray-800 transition-colors group-hover/day:text-[#00766C]">{availabilityDay.label}</div>
                    <div className="text-[11px] font-bold text-gray-300 tracking-tight">{availabilityDay.dateLabel}</div>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 min-h-[140px]">
                    {availabilityDay.slots.length > 0 ? (
                      <>
                        {availabilityDay.slots.slice(0, 3).map((slot, sIdx) => {
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={sIdx}
                              onClick={() => setSelectedSlot(isSelected ? null : slot)}
                              className={cn(
                                "w-full py-3 rounded-2xl text-[13px] font-black transition-all duration-300 border flex items-center justify-center gap-1.5",
                                isSelected
                                  ? "bg-[#00766C] text-white border-[#00766C] shadow-xl shadow-teal-100 scale-[1.05]"
                                  : "bg-white text-[#333333] border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 active:scale-95"
                              )}
                            >
                              {slot.split(' ')[0]}
                              {isSelected && <Check size={12} strokeWidth={4} className="animate-in zoom-in duration-300" />}
                            </button>
                          );
                        })}
                        {availabilityDay.slots.length > 3 && (
                          <button className="w-full py-2 text-[12px] font-black text-gray-300 hover:text-[#00766C] transition-colors tracking-tight">
                            +{availabilityDay.slots.length - 3} MORE
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-100 bg-gray-50/50 opacity-40">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">N/A</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 relative z-10 px-1">
               <button
                 className={cn(
                   "w-full h-16 rounded-[24px] text-[16px] font-black transition-all duration-500 overflow-hidden relative group/book shadow-xl active:scale-[0.98]",
                   selectedSlot 
                     ? "bg-[#FF6B35] text-white shadow-orange-200" 
                     : "bg-[#333333] text-white"
                 )}
               >
                 <div className="flex items-center justify-center gap-3 relative z-10">
                    {selectedSlot ? 'Confirm Booking' : 'View Full Schedule'}
                    <MoveRight size={20} strokeWidth={3} className="group-hover/book:translate-x-1 transition-transform" />
                 </div>
                 
                 {/* Premium Button Shine Animation */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/book:animate-shine transition-transform"></div>
               </button>
               
               {selectedSlot && (
                 <p className="text-center text-[11px] font-black text-[#00766C] uppercase tracking-widest mt-4 animate-in slide-in-from-top-2">
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
