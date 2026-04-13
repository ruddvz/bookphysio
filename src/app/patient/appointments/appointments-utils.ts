/**
 * Pure utility functions for the patient appointments page.
 * Extracted so they can be unit-tested without mounting the full page.
 */

import { formatIndiaDateTime } from '@/lib/india-date'

export type AppointmentTab = 'upcoming' | 'past'
export type VisitType = 'in_clinic' | 'home_visit'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface AppointmentItem {
  id: string
  status: AppointmentStatus | string
  visit_type: VisitType | string
  fee_inr: number
  payment_status: 'created' | 'paid' | 'failed' | 'refunded' | null
  availabilities: { starts_at: string } | null
  providers: {
    users: { full_name: string } | null
    specialties?: { name: string }[]
  } | null
  locations: { city: string } | null
}

/**
 * Formats an ISO date string to "DD MMM YYYY, HH:MM" in en-IN locale.
 * Reuses the same format as the dashboard for consistency.
 */
export function formatApptDate(iso: string): string {
  return formatIndiaDateTime(iso, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns the provider display name, prefixing "Dr." if not already present.
 */
export function providerDisplayName(appt: AppointmentItem): string {
  const name = appt.providers?.users?.full_name
  if (!name) return 'Doctor'
  return name.startsWith('Dr.') ? name : `Dr. ${name}`
}

/**
 * Filters appointments by tab.
 * upcoming: not cancelled, slot in the future
 * past: completed, cancelled, or slot in the past
 */
export function filterByTab(appointments: AppointmentItem[], tab: AppointmentTab): AppointmentItem[] {
  const now = new Date()
  if (tab === 'upcoming') {
    return appointments.filter((a) => {
      const start = a.availabilities?.starts_at
      return a.status !== 'cancelled' && start && new Date(start) >= now
    })
  }
  return appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    return (
      a.status === 'completed' ||
      a.status === 'cancelled' ||
      a.status === 'no_show' ||
      (start && new Date(start) < now)
    )
  })
}

/**
 * Parses the tab query param, defaulting to 'upcoming'.
 */
export function parseTab(raw: string | null): AppointmentTab {
  return raw === 'past' ? 'past' : 'upcoming'
}
