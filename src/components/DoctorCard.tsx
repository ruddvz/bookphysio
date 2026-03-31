'use client'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Star, MapPin, ShieldCheck, Clock } from 'lucide-react'

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
        'group bg-white rounded-xl border border-[#E5E5E5] p-5 md:p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#00766C]/20',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Section: Avatar and Info */}
        <div className="flex flex-1 gap-5">
          {/* Avatar Stack */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#E6F4F3] to-[#C7E9E6] text-[#00766C] flex items-center justify-center text-[24px] md:text-[28px] font-bold select-none border-2 border-white shadow-sm transition-transform group-hover:scale-105"
              aria-hidden="true"
            >
              {initials}
            </div>
            {doctor.icpVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#059669]" fill="#D1FAE5" />
              </div>
            )}
          </div>

          {/* Core Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <h3 className="text-[18px] md:text-[20px] font-bold text-[#333333] leading-tight flex items-center flex-wrap gap-x-2">
                {doctor.name}
                {doctor.credentials && (
                  <span className="text-[13px] font-medium text-gray-400">
                    {doctor.credentials}
                  </span>
                )}
              </h3>
              <p className="text-[15px] text-[#00766C] font-semibold flex items-center gap-1.5">
                {doctor.specialty}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="flex items-center gap-1 bg-[#FFFBEB] px-2 py-0.5 rounded-full border border-[#FEF3C7]">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-[14px] font-bold text-[#92400E]">
                  {doctor.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-[13px] text-gray-500 font-medium">
                ({doctor.reviewCount} reviews)
              </span>
            </div>

            {/* Location & Details */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-[14px] text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{doctor.location}</span>
                {doctor.distance && <span className="text-gray-300">·</span>}
                {doctor.distance && <span className="text-gray-400 font-medium">{doctor.distance}</span>}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {doctor.visitTypes.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight uppercase",
                      type === "In-clinic" && "bg-teal-50 text-teal-700 border border-teal-100",
                      type === "Home Visit" && "bg-orange-50 text-orange-700 border border-orange-100",
                      type === "Online" && "bg-blue-50 text-blue-700 border border-blue-100",
                      !["In-clinic", "Home Visit", "Online"].includes(type) && "bg-gray-50 text-gray-600 border border-gray-100"
                    )}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-[20px] font-extrabold text-[#333333]">₹{doctor.fee}</span>
              <span className="text-[12px] text-gray-500 font-medium">Consultation fee</span>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive Availability Grid */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#F3F4F6]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00766C]" />
                Availability
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                  className="p-1 rounded-full hover:bg-white disabled:opacity-30 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={startIndex >= availability.length - 3}
                  className="p-1 rounded-full hover:bg-white disabled:opacity-30 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {visibleDays.map((availabilityDay, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-gray-800">{availabilityDay.label}</div>
                    <div className="text-[10px] font-medium text-gray-400 leading-tight">{availabilityDay.dateLabel}</div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 min-h-[120px]">
                    {availabilityDay.slots.length > 0 ? (
                      <>
                        {availabilityDay.slots.slice(0, 3).map((slot, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "w-full py-2.5 rounded-lg text-[12px] font-bold transition-all border",
                              selectedSlot === slot
                                ? "bg-[#00766C] text-white border-[#00766C] shadow-md scale-[1.02]"
                                : "bg-white text-[#00766C] border-[#E5E5E5] hover:border-[#00766C] hover:bg-[#E6F4F3]/30"
                            )}
                          >
                            {slot.split(' ')[0]}
                          </button>
                        ))}
                        {availabilityDay.slots.length > 3 && (
                          <button className="w-full py-1.5 text-[11px] font-bold text-gray-400 hover:text-[#00766C] transition-colors">
                            +{availabilityDay.slots.length - 3} more
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50">
                        <span className="text-[10px] font-bold text-gray-300 uppercase">No slots</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`/doctor/${doctor.id}?slot=${selectedSlot || ''}`}
              className={cn(
                "mt-4 w-full py-3 rounded-full text-[15px] font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm",
                selectedSlot 
                  ? "bg-[#FF6B35] text-white hover:bg-[#E85D2A] hover:scale-[1.02] active:scale-[0.98]" 
                  : "bg-[#00766C] text-white hover:bg-[#005A52]"
              )}
            >
              {selectedSlot ? 'Confirm Booking' : 'Book Session'}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
