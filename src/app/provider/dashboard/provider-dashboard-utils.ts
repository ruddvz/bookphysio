/**
 * Pure utility functions for the provider dashboard.
 * Extracted so they can be unit-tested without mounting the full page.
 */

export interface ProviderAppointment {
  id: string
  status: string
  visit_type: 'in_clinic' | 'home_visit' | 'online' | string
  fee_inr: number
  availabilities: { starts_at: string; ends_at?: string } | null
  patient?: { full_name?: string | null } | null
  providers?: unknown
  locations?: { city: string } | null
}

/**
 * Returns appointments whose slot starts today (local time).
 */
export function filterToday(appointments: ProviderAppointment[]): ProviderAppointment[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  return appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    if (!start) return false
    const d = new Date(start)
    return d >= todayStart && d < todayEnd && a.status !== 'cancelled'
  })
}

/**
 * Returns appointments within the current ISO week (Mon–Sun).
 */
export function filterThisWeek(appointments: ProviderAppointment[]): ProviderAppointment[] {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const diffToMon = (day === 0 ? -6 : 1 - day)
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon)
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  return appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    if (!start) return false
    const d = new Date(start)
    return d >= weekStart && d < weekEnd && a.status !== 'cancelled'
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
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns the patient display name from a provider appointment.
 * Falls back to "Patient" when name is unavailable.
 */
export function patientDisplayName(appt: ProviderAppointment): string {
  return appt.patient?.full_name ?? 'Patient'
}
