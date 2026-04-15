'use client'

import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Clock, X, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatIndiaDateTime, formatIndiaDateInput } from '@/lib/india-date'

interface AvailabilitySlot {
  id: string
  starts_at: string
  ends_at: string
  slot_duration_mins: number
  location_id: string | null
}

interface RescheduleModalProps {
  appointmentId: string
  providerId: string
  providerName: string
  currentSlotDate: string
  onSuccess: () => void
  onClose: () => void
}

/**
 * Produces a UTC ISO date string offset by `days` from `base`.
 * Used for computing the display range; actual IST formatting is handled by formatIndiaDateTime.
 */
function indiaDateOffset(base: Date, days: number): string {
  const d = new Date(base.getTime() + days * 86_400_000)
  return d.toISOString()
}

function formatShortDate(iso: string): string {
  return formatIndiaDateTime(iso, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatSlotTime(iso: string): string {
  return formatIndiaDateTime(iso, { hour: '2-digit', minute: '2-digit' })
}

export default function RescheduleModal({
  appointmentId,
  providerId,
  providerName,
  currentSlotDate,
  onSuccess,
  onClose,
}: RescheduleModalProps) {
  const queryClient = useQueryClient()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'confirm'>('select')

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Reset selected slot when switching weeks
  useEffect(() => {
    setSelectedSlotId(null)
    setStep('select')
  }, [weekOffset])

  // Refresh `now` when step changes to avoid stale time after long modal sessions
  // eslint-disable-next-line react-hooks/exhaustive-deps -- step+weekOffset are intentional deps to refresh the timestamp
  const now = useMemo(() => new Date(), [step, weekOffset])
  const windowStart = useMemo(() => {
    const start = new Date(now.getTime() + weekOffset * 7 * 86_400_000)
    return start < now ? now : start
  }, [now, weekOffset])
  const windowEnd = useMemo(
    () => new Date(windowStart.getTime() + 7 * 86_400_000),
    [windowStart],
  )

  const { data: slotsData, isLoading: slotsLoading } = useQuery<{ slots: AvailabilitySlot[] }>({
    queryKey: ['reschedule-slots', providerId, weekOffset],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: windowStart.toISOString(),
        to: windowEnd.toISOString(),
      })
      const res = await fetch(`/api/providers/${providerId}/availability?${params}`)
      if (!res.ok) throw new Error('Failed to load slots')
      return res.json()
    },
  })

  const slots = useMemo(() => slotsData?.slots ?? [], [slotsData])

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>()
    for (const slot of slots) {
      const dateKey = formatIndiaDateInput(slot.starts_at)
      const existing = grouped.get(dateKey) ?? []
      existing.push(slot)
      grouped.set(dateKey, existing)
    }
    return grouped
  }, [slots])

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null

  const rescheduleMut = useMutation({
    mutationFn: async () => {
      if (!selectedSlotId) throw new Error('No slot selected')
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule', new_availability_id: selectedSlotId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Reschedule failed' }))
        throw new Error(typeof data.error === 'string' ? data.error : 'Reschedule failed')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
      onSuccess()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-[22px] font-bold text-bp-primary tracking-tight">
              {step === 'select' ? 'Reschedule Appointment' : 'Confirm New Time'}
            </h2>
            <p className="text-[14px] text-bp-body/60 font-medium mt-0.5">
              {step === 'select' ? `Pick a new slot with ${providerName}` : 'Review your new appointment time'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bp-surface transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-bp-body" />
          </button>
        </div>

        {step === 'select' && (
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {/* Current appointment info */}
            <div className="p-4 bg-red-50 border border-red-100 rounded-[var(--sq-lg)] mb-6">
              <p className="text-[12px] font-bold text-red-600/60 uppercase tracking-wider mb-1">Current Appointment</p>
              <p className="text-[15px] font-bold text-red-700 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {formatShortDate(currentSlotDate)} at {formatSlotTime(currentSlotDate)}
              </p>
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                disabled={weekOffset === 0}
                className="p-2 rounded-full hover:bg-bp-surface disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
              >
                <ChevronLeft className="w-5 h-5 text-bp-primary" />
              </button>
              <p className="text-[14px] font-bold text-bp-primary">
                {formatShortDate(windowStart.toISOString())} — {formatShortDate(indiaDateOffset(windowStart, 6))}
              </p>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                disabled={weekOffset >= 3}
                className="p-2 rounded-full hover:bg-bp-surface disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
              >
                <ChevronRight className="w-5 h-5 text-bp-primary" />
              </button>
            </div>

            {/* Slot grid */}
            {slotsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-bp-accent" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-10 h-10 text-bp-border mx-auto mb-3" />
                <p className="text-[15px] font-bold text-bp-body/50">No available slots this week</p>
                <p className="text-[13px] text-bp-body/40 mt-1">Try navigating to another week</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(slotsByDate.entries()).map(([dateKey, dateSlots]) => (
                  <div key={dateKey}>
                    <p className="text-[13px] font-bold text-bp-body/50 uppercase tracking-wider mb-2">
                      {formatShortDate(dateSlots[0].starts_at)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={cn(
                            'px-4 py-2.5 rounded-full text-[14px] font-bold border transition-all cursor-pointer',
                            selectedSlotId === slot.id
                              ? 'bg-bp-accent text-white border-bp-accent shadow-md'
                              : 'bg-white text-bp-primary border-bp-border hover:border-bp-accent/50 hover:bg-bp-accent/5',
                          )}
                        >
                          <Clock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                          {formatSlotTime(slot.starts_at)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Continue button */}
            {selectedSlot && (
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="w-full mt-6 px-8 py-4 bg-bp-accent hover:bg-bp-primary text-white rounded-full text-[15px] font-bold shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Continue with {selectedSlot ? formatSlotTime(selectedSlot.starts_at) : 'selected slot'}
              </button>
            )}
          </div>
        )}

        {step === 'confirm' && selectedSlot && (
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-red-50 border border-red-100 rounded-[var(--sq-lg)]">
                <p className="text-[12px] font-bold text-red-600/60 uppercase tracking-wider mb-1">Old Time</p>
                <p className="text-[15px] font-bold text-red-700 line-through">
                  {formatShortDate(currentSlotDate)} at {formatSlotTime(currentSlotDate)}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[var(--sq-lg)]">
                <p className="text-[12px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">New Time</p>
                <p className="text-[15px] font-bold text-emerald-700 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {formatShortDate(selectedSlot.starts_at)} at {formatSlotTime(selectedSlot.starts_at)}
                </p>
              </div>
            </div>

            {rescheduleMut.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-[var(--sq-lg)] mb-4">
                <p className="text-[14px] text-red-700 font-medium">{rescheduleMut.error.message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="flex-1 px-6 py-4 border-2 border-bp-border text-bp-body rounded-full text-[15px] font-bold hover:bg-bp-surface transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => rescheduleMut.mutate()}
                disabled={rescheduleMut.isPending}
                className="flex-[2] px-6 py-4 bg-bp-accent hover:bg-bp-primary text-white rounded-full text-[15px] font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {rescheduleMut.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Rescheduling…
                  </span>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
