'use client'

import { MouseEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
} from 'lucide-react'

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

type SlotDay = {
  label: string
  dateLabel: string
  iso: string
  slots: string[]
}

function seededRand(seed: number): () => number {
  let value = seed

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function generateDeterministicSlots(id: string): SlotDay[] {
  const seed = id.split('').reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
  const random = seededRand(seed)
  const days: SlotDay[] = []
  const today = new Date()

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    const slotCount = Math.floor(random() * 4) + 1
    const startHour = 9 + Math.floor(random() * 4)
    const slots: string[] = []

    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const hour = startHour + slotIndex
      const period = hour < 12 ? 'AM' : 'PM'
      const displayHour = hour > 12 ? hour - 12 : hour
      slots.push(`${displayHour}:00 ${period}`)
    }

    days.push({
      label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short' }),
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
  const firstSlot = availability.flatMap((day) => day.slots.map((slot) => ({ dayIso: day.iso, time: slot })))[0]

  const initials = doctor.name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const handlePrev = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setStartIndex(Math.max(0, startIndex - 1))
  }

  const handleNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setStartIndex(Math.min(availability.length - 3, startIndex + 1))
  }

  const handleBook = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    router.push(`/doctor/${doctor.id}`)
  }

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'bp-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#00766C]/20 hover:shadow-[0_22px_50px_-30px_rgba(15,23,42,0.22)]',
        isHovered && 'border-[#00766C]/20 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.22)]',
        className
      )}
      aria-label={`${doctor.name} - ${doctor.specialty}`}
    >
      <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex gap-5">
          <div className="relative shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-[#E6F4F3] text-[28px] font-semibold text-[#005A52] shadow-[0_18px_35px_-28px_rgba(15,23,42,0.28)]">
              {initials}
            </div>
            {doctor.icpVerified && (
              <div className="absolute -bottom-2 -right-2 rounded-full border border-white bg-white p-1.5 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.3)]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00766C] text-white">
                  <ShieldCheck size={16} strokeWidth={2.5} />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900 md:text-[24px]">
                  {doctor.name}
                </h3>
                <p className="mt-1 text-[14px] text-slate-500">{doctor.credentials}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E8EC] bg-[#FCFDFD] px-3 py-1.5 text-[13px] font-semibold text-slate-700">
                <Star size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                {doctor.rating.toFixed(1)}
                <span className="text-slate-400">({doctor.reviewCount})</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#E6F4F3] px-3 py-1 text-[12px] font-semibold text-[#005A52]">
                {doctor.specialty}
              </span>
              {doctor.visitTypes.map((visitType) => (
                <span
                  key={visitType}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[12px] font-semibold',
                    visitType === 'In-clinic' && 'border-[#DCE3E7] bg-white text-slate-600',
                    visitType === 'Home Visit' && 'border-[#E7D6C5] bg-[#FFF7F1] text-[#B45309]'
                  )}
                >
                  {visitType}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#E6E8EC] bg-[#FCFDFD] p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={14} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Location</span>
                </div>
                <p className="mt-2 text-[14px] font-medium text-slate-900">{doctor.location}</p>
                <p className="mt-1 text-[13px] text-slate-500">{doctor.distance}</p>
              </div>

              <div className="rounded-[18px] border border-[#E6E8EC] bg-[#FCFDFD] p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock3 size={14} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Next slot</span>
                </div>
                <p className="mt-2 text-[14px] font-medium text-slate-900">{doctor.nextSlot}</p>
                <p className="mt-1 text-[13px] text-slate-500">Book before it fills.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E8EC] pt-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Consult fee</p>
                <p className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">₹{doctor.fee}</p>
              </div>

              <button
                onClick={handleBook}
                className="inline-flex items-center gap-2 rounded-full bg-[#00766C] px-5 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#005A52] active:scale-[0.98]"
              >
                View profile
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="bp-card-soft p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.02em] text-slate-900">
                <CalendarDays size={14} className="text-[#00766C]" />
                Preview availability
              </h4>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Available this week</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                aria-label="Previous days"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E8EC] bg-white text-slate-500 transition-all hover:border-[#00766C]/30 hover:text-[#00766C] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                disabled={startIndex >= availability.length - 3}
                aria-label="Next days"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E8EC] bg-white text-slate-500 transition-all hover:border-[#00766C]/30 hover:text-[#00766C] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {visibleDays.map((day) => (
              <div key={day.iso} className="flex flex-col gap-2 rounded-[18px] border border-[#E6E8EC] bg-white p-3">
                <div className="text-center">
                  <p className="text-[12px] font-semibold text-slate-900">{day.label}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{day.dateLabel}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {day.slots.length > 0 ? (
                    day.slots.slice(0, 3).map((slot) => {
                      const isSelected = selectedSlot?.time === slot && selectedSlot?.dayIso === day.iso

                      return (
                        <button
                          key={slot}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setSelectedSlot(isSelected ? null : { time: slot, dayIso: day.iso })
                          }}
                          className={cn(
                            'inline-flex w-full items-center justify-center gap-1 rounded-full border px-3 py-2 text-[12px] font-semibold transition-all',
                            isSelected
                              ? 'border-[#00766C] bg-[#00766C] text-white shadow-[0_12px_20px_-16px_rgba(0,118,108,0.6)]'
                              : 'border-[#E6E8EC] bg-[#FCFDFD] text-slate-700 hover:border-[#00766C]/25 hover:text-[#005A52]'
                          )}
                        >
                          {slot}
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </button>
                      )
                    })
                  ) : (
                    <div className="rounded-[16px] border border-dashed border-[#E6E8EC] bg-[#FCFDFD] px-3 py-6 text-center text-[12px] text-slate-400">
                      No slots
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleBook}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#00766C] px-4 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#005A52] active:scale-[0.99]"
          >
            Open booking profile
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}