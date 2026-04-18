'use client'

import { useState } from 'react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { providerStatusBadgeVariant } from '../provider-appointments-v2-utils'

type VisitType = 'in_clinic' | 'home_visit'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface ProviderAppointmentDetailV2Props {
  appointment: {
    id: string
    status: AppointmentStatus
    visit_type: VisitType
    availabilities: { starts_at: string; ends_at: string; slot_duration_mins: number }
  }
}

function statusLabel(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No-show',
  }
  return map[status]
}

/**
 * v2 chrome strip for provider appointment detail — self-gates via `useUiV2()`.
 */
export function ProviderAppointmentDetailV2({ appointment }: ProviderAppointmentDetailV2Props) {
  const v2 = useUiV2()
  const [compareAt] = useState(() => Date.now())
  if (!v2) return null

  const variant = providerStatusBadgeVariant(appointment.status)
  const tone = variant === 'soft' ? 1 : undefined
  const startsAt = appointment.availabilities.starts_at
  const isPast = new Date(startsAt).getTime() < compareAt
  const upcomingEligible =
    (appointment.status === 'confirmed' || appointment.status === 'pending') && !isPast

  return (
    <div
      data-ui-version="v2"
      data-testid="provider-appt-detail-v2"
      className="mb-6 flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Session actions"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          role="provider"
          variant={variant}
          {...(tone ? { tone } : {})}
          aria-label={`Status ${statusLabel(appointment.status)}`}
        >
          {statusLabel(appointment.status)}
        </Badge>
        <span className="text-[13px] font-bold capitalize text-[var(--color-pv-muted)]">
          {appointment.visit_type.replace('_', ' ')}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!upcomingEligible}
          className="rounded-full bg-[var(--color-pv-primary)] px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => {}}
        >
          Mark Complete
        </button>
        <button
          type="button"
          disabled={!upcomingEligible}
          className="rounded-full border border-[var(--color-pv-border)] bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-[var(--color-pv-ink)] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => {}}
        >
          Mark No-show
        </button>
      </div>
    </div>
  )
}
