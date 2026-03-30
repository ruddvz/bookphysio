/**
 * Pure utility functions for the patient dashboard.
 * Extracted so they can be unit-tested without mounting the full page.
 */

interface AppointmentForUtils {
  availabilities?: { starts_at: string } | null
  providers?: {
    users?: { full_name: string } | null
  } | null
}

/**
 * Formats an ISO date string to "DD MMM YYYY, HH:MM" in en-IN locale.
 * Example: "2026-04-15T10:30:00.000Z" → "15 Apr 2026, 04:00 pm" (IST)
 */
export function formatApptDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns the provider's display name, prefixing "Dr." if not already present.
 * Falls back to "Doctor" when name is unavailable.
 */
export function providerDisplayName(appt: AppointmentForUtils): string {
  const name = appt.providers?.users?.full_name
  if (!name) return 'Doctor'
  return name.startsWith('Dr.') ? name : `Dr. ${name}`
}
