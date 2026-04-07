/**
 * Pure utility functions for the provider dashboard.
 * Extracted so they can be unit-tested without mounting the full page.
 */

import { formatIndiaDateInput, formatIndiaTime, getIndiaWeekdayShort, parseIndiaDate } from '@/lib/india-date'

export interface ProviderAppointment {
  id: string
  patient_id?: string | null
  status: string
  visit_type: 'in_clinic' | 'home_visit' | string
  fee_inr: number
  notes?: string | null
  availabilities: { starts_at: string; ends_at?: string } | null
  patient?: { id?: string | null; full_name?: string | null } | null
  providers?: unknown
  locations?: { city: string } | null
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

const INDIA_WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
}

function toIndiaDay(value: Date | string): Date {
  return parseIndiaDate(formatIndiaDateInput(value))
}

/**
 * Returns appointments whose slot starts today in India time.
 */
export function filterToday(appointments: ProviderAppointment[]): ProviderAppointment[] {
  const todayStart = toIndiaDay(new Date())
  const todayEnd = new Date(todayStart.getTime() + DAY_IN_MS)

  return appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    if (!start) return false

    const day = toIndiaDay(start)
    return day >= todayStart && day < todayEnd && a.status !== 'cancelled'
  })
}

/**
 * Returns appointments within the current India week (Mon–Sun).
 */
export function filterThisWeek(appointments: ProviderAppointment[]): ProviderAppointment[] {
  const todayIndia = toIndiaDay(new Date())
  const weekday = getIndiaWeekdayShort(new Date())
  const diffToMon = INDIA_WEEKDAY_INDEX[weekday] ?? 0
  const weekStart = new Date(todayIndia.getTime() - diffToMon * DAY_IN_MS)
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_IN_MS)

  return appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    if (!start) return false

    const day = toIndiaDay(start)
    return day >= weekStart && day < weekEnd && a.status !== 'cancelled'
  })
}

/**
 * Returns the next upcoming appointment from a today-filtered list.
 */
export function getNextAppointment(todayAppts: ProviderAppointment[]): ProviderAppointment | null {
  const now = new Date()
  const future = todayAppts.filter((a) => {
    const start = a.availabilities?.starts_at
    return start && new Date(start) >= now
  })
  if (future.length === 0) return null
  return future.reduce((earliest, a) => {
    const ea = earliest.availabilities?.starts_at ?? ''
    const aa = a.availabilities?.starts_at ?? ''
    return aa < ea ? a : earliest
  })
}

/**
 * Formats an appointment count as a human-readable string.
 * e.g. 0 → "0 appointments", 1 → "1 appointment", 3 → "3 appointments"
 */
export function formatAppointmentCount(count: number): string {
  return count === 1 ? '1 appointment' : `${count} appointments`
}

/**
 * Formats a slot start time as HH:MM (12-hour, en-IN locale).
 */
export function formatSlotTime(iso: string): string {
  return formatIndiaTime(iso)
}

/**
 * Returns the patient display name from a provider appointment.
 * Falls back to "Patient" when name is unavailable.
 */
export function patientDisplayName(appt: ProviderAppointment): string {
  return appt.patient?.full_name ?? 'Patient'
}
