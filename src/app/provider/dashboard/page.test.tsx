/**
 * 8.9 Provider Dashboard Polish — Vitest unit tests
 * Tests: provider appointment helpers and provider schedule helpers
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  countRemainingVisitsToday,
  filterToday,
  filterScheduleEntriesThisWeek,
  filterThisWeek,
  getNextAppointment,
  getNextScheduledVisit,
  formatAppointmentCount,
  formatSlotTime,
  patientDisplayName,
  sumScheduledFees,
  type ProviderAppointment,
} from './provider-dashboard-utils'
import type { ScheduleEntry } from '@/lib/clinical/types'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Helpers to build appointments at relative times
// ---------------------------------------------------------------------------
function makeAppt(offsetHours: number, status = 'confirmed', id = 'appt-1'): ProviderAppointment {
  const d = new Date()
  d.setHours(d.getHours() + offsetHours, 0, 0, 0)
  return {
    id,
    status,
    visit_type: 'in_clinic',
    fee_inr: 800,
    availabilities: { starts_at: d.toISOString() },
    patient: { full_name: 'Rahul Test' },
    locations: { city: 'Mumbai' },
  }
}

function makeScheduleEntry(
  visitDate: string,
  visitTime: string,
  visitId: string,
  feeInr: number | null = 800,
): ScheduleEntry {
  return {
    visit_id: visitId,
    profile_id: 'profile-1',
    patient_name: 'Rahul Test',
    visit_date: visitDate,
    visit_time: visitTime,
    fee_inr: feeInr,
    visit_number: 1,
  }
}

// ---------------------------------------------------------------------------
// 1. filterToday
// ---------------------------------------------------------------------------
describe('filterToday', () => {
  it('includes appointments starting today', () => {
    const appt = makeAppt(1) // 1 hour from now = today
    expect(filterToday([appt])).toHaveLength(1)
  })

  it('excludes appointments starting tomorrow', () => {
    const appt = makeAppt(25) // 25 hours from now = tomorrow
    expect(filterToday([appt])).toHaveLength(0)
  })

  it('excludes appointments that started yesterday', () => {
    const appt = makeAppt(-25) // yesterday
    expect(filterToday([appt])).toHaveLength(0)
  })

  it('excludes cancelled appointments', () => {
    const appt = makeAppt(1, 'cancelled')
    expect(filterToday([appt])).toHaveLength(0)
  })

  it('handles empty array', () => {
    expect(filterToday([])).toHaveLength(0)
  })

  it('uses India time boundaries instead of the browser local day', () => {
    vi.setSystemTime(new Date('2026-04-15T14:00:00.000Z'))

    const todayIndia = {
      ...makeAppt(0),
      availabilities: { starts_at: '2026-04-15T12:00:00.000Z' },
    }
    const tomorrowIndia = {
      ...makeAppt(0, 'confirmed', 'appt-2'),
      availabilities: { starts_at: '2026-04-15T20:00:00.000Z' },
    }

    expect(filterToday([todayIndia, tomorrowIndia])).toEqual([todayIndia])
  })
})

// ---------------------------------------------------------------------------
// 2. filterThisWeek
// ---------------------------------------------------------------------------
describe('filterThisWeek', () => {
  it('includes appointments this week', () => {
    const appt = makeAppt(2) // a few hours from now = this week
    expect(filterThisWeek([appt]).length).toBeGreaterThanOrEqual(1)
  })

  it('excludes cancelled appointments', () => {
    const appt = makeAppt(2, 'cancelled')
    expect(filterThisWeek([appt])).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 3. getNextAppointment
// ---------------------------------------------------------------------------
describe('getNextAppointment', () => {
  it('returns the soonest future appointment', () => {
    const soon = makeAppt(1, 'confirmed', 'soon')
    const later = makeAppt(3, 'confirmed', 'later')
    const result = getNextAppointment([later, soon])
    expect(result?.id).toBe('soon')
  })

  it('returns null when all appointments are in the past', () => {
    const past = makeAppt(-2)
    expect(getNextAppointment([past])).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(getNextAppointment([])).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 4. provider schedule helpers
// ---------------------------------------------------------------------------
describe('provider schedule helpers', () => {
  it('returns the next scheduled visit even when it is tomorrow', () => {
    const result = getNextScheduledVisit([
      makeScheduleEntry('2026-04-15', '16:00', 'past-today'),
      makeScheduleEntry('2026-04-16', '09:00', 'tomorrow'),
    ])

    expect(result?.visit_id).toBe('tomorrow')
  })

  it('counts only future visits remaining today', () => {
    expect(countRemainingVisitsToday([
      makeScheduleEntry('2026-04-15', '17:00', 'past-slot'),
      makeScheduleEntry('2026-04-15', '18:00', 'next-slot'),
      makeScheduleEntry('2026-04-15', '19:30', 'late-slot'),
      makeScheduleEntry('2026-04-16', '09:00', 'tomorrow-slot'),
    ])).toBe(2)
  })

  it('filters schedule entries to the current India week', () => {
    expect(filterScheduleEntriesThisWeek([
      makeScheduleEntry('2026-04-13', '09:00', 'monday'),
      makeScheduleEntry('2026-04-19', '09:00', 'sunday'),
      makeScheduleEntry('2026-04-20', '09:00', 'next-week'),
    ]).map((entry) => entry.visit_id)).toEqual(['monday', 'sunday'])
  })

  it('sums scheduled fees while ignoring null values', () => {
    expect(sumScheduledFees([
      makeScheduleEntry('2026-04-15', '18:00', 'visit-1', 900),
      makeScheduleEntry('2026-04-16', '11:00', 'visit-2', null),
    ])).toBe(900)
  })
})

// ---------------------------------------------------------------------------
// 5. formatAppointmentCount
// ---------------------------------------------------------------------------
describe('formatAppointmentCount', () => {
  it('uses singular for 1', () => {
    expect(formatAppointmentCount(1)).toBe('1 appointment')
  })

  it('uses plural for 0', () => {
    expect(formatAppointmentCount(0)).toBe('0 appointments')
  })

  it('uses plural for 3', () => {
    expect(formatAppointmentCount(3)).toBe('3 appointments')
  })
})

// ---------------------------------------------------------------------------
// 6. formatSlotTime
// ---------------------------------------------------------------------------
describe('formatSlotTime', () => {
  it('returns a time string without date components', () => {
    const result = formatSlotTime('2026-04-15T09:30:00.000Z')
    expect(result).toMatch(/(?:03|3):00/i)
    expect(result).not.toContain('2026')
  })
})

// ---------------------------------------------------------------------------
// 7. patientDisplayName
// ---------------------------------------------------------------------------
describe('patientDisplayName', () => {
  it('returns patient full name when available', () => {
    const appt = makeAppt(1)
    expect(patientDisplayName(appt)).toBe('Rahul Test')
  })

  it('falls back to "Patient" when name is null', () => {
    const appt = { ...makeAppt(1), patient: { full_name: null } }
    expect(patientDisplayName(appt)).toBe('Patient')
  })

  it('falls back to "Patient" when patient is null', () => {
    const appt = { ...makeAppt(1), patient: null }
    expect(patientDisplayName(appt)).toBe('Patient')
  })
})
