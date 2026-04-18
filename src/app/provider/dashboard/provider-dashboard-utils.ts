/**
 * Pure utility functions for the provider dashboard.
 * Extracted so they can be unit-tested without mounting the full page.
 */

import type { ScheduleEntry } from '@/lib/clinical/types'
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

function parseScheduleEntryStart(entry: ScheduleEntry): Date | null {
  if (!entry.visit_date || !entry.visit_time) {
    return null
  }

  const [hourText, minuteText] = entry.visit_time.split(':')
  const hour = Number.parseInt(hourText ?? '', 10)
  const minute = Number.parseInt(minuteText ?? '', 10)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }

  const dayStart = parseIndiaDate(entry.visit_date)
  return new Date(dayStart.getTime() + ((hour * 60) + minute) * 60 * 1000)
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
 * Returns schedule entries within the current India week (Mon-Sun).
 */
export function filterScheduleEntriesThisWeek(entries: ScheduleEntry[], reference = new Date()): ScheduleEntry[] {
  const todayIndia = toIndiaDay(reference)
  const weekday = getIndiaWeekdayShort(reference)
  const diffToMon = INDIA_WEEKDAY_INDEX[weekday] ?? 0
  const weekStart = new Date(todayIndia.getTime() - diffToMon * DAY_IN_MS)
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_IN_MS)

  return entries.filter((entry) => {
    const day = parseIndiaDate(entry.visit_date)
    return day >= weekStart && day < weekEnd
  })
}

/**
 * Returns the next scheduled visit from the provided entries.
 */
export function getNextScheduledVisit(entries: ScheduleEntry[], reference = new Date()): ScheduleEntry | null {
  const futureEntries = entries.filter((entry) => {
    const start = parseScheduleEntryStart(entry)
    return start && start >= reference
  })

  if (futureEntries.length === 0) {
    return null
  }

  return futureEntries.reduce((earliest, entry) => {
    const earliestStart = parseScheduleEntryStart(earliest)?.getTime() ?? Number.POSITIVE_INFINITY
    const entryStart = parseScheduleEntryStart(entry)?.getTime() ?? Number.POSITIVE_INFINITY
    return entryStart < earliestStart ? entry : earliest
  })
}

/**
 * Counts the remaining visits scheduled for today in India time.
 */
export function countRemainingVisitsToday(entries: ScheduleEntry[], reference = new Date()): number {
  const todayKey = formatIndiaDateInput(reference)

  return entries.filter((entry) => {
    if (entry.visit_date !== todayKey) {
      return false
    }

    const start = parseScheduleEntryStart(entry)
    return Boolean(start && start >= reference)
  }).length
}

/**
 * Sums scheduled fees, ignoring missing values.
 */
export function sumScheduledFees(entries: ScheduleEntry[]): number {
  return entries.reduce((total, entry) => total + (entry.fee_inr ?? 0), 0)
}

/**
 * Returns the patient display name from a provider appointment.
 * Falls back to "Patient" when name is unavailable.
 */
export function patientDisplayName(appt: ProviderAppointment): string {
  return appt.patient?.full_name ?? 'Patient'
}

/**
 * Bucket forward-looking schedule entries into the next `weeks` weekly
 * windows starting from today India time. `reference` is snapped to
 * India-local midnight so bucket boundaries don't shift with the UTC
 * hour the page loads. Bucket 0 is the current week (days 0–6 ahead),
 * bucket 1 is +7–13d, and so on. Entries outside the window or
 * before today are dropped silently.
 */
export function bucketScheduleByWeek(
  entries: readonly ScheduleEntry[],
  weeks: number,
  reference: Date = new Date(),
): number[] {
  const todayIndia = parseIndiaDate(formatIndiaDateInput(reference))
  const buckets = new Array<number>(weeks).fill(0)
  for (const entry of entries) {
    if (!entry.visit_date) continue
    const day = parseIndiaDate(entry.visit_date)
    if (Number.isNaN(day.getTime())) continue
    const daysAhead = Math.floor((day.getTime() - todayIndia.getTime()) / DAY_IN_MS)
    if (daysAhead < 0 || daysAhead >= weeks * 7) continue
    buckets[Math.floor(daysAhead / 7)] += 1
  }
  return buckets
}

/**
 * Number of upcoming visits in the schedule whose `visit_number` is 1 —
 * i.e. first-time patients coming through the door. Surfaces as the
 * growth signal on the provider pulse card.
 */
export function countFirstVisitsInSchedule(entries: readonly ScheduleEntry[]): number {
  return entries.filter((entry) => entry.visit_number === 1).length
}
