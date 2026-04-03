/**
 * 8.9 Provider Dashboard Polish — Vitest unit tests
 * Tests: filterToday, filterThisWeek, getNextAppointment, formatAppointmentCount
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  filterToday,
  filterThisWeek,
  getNextAppointment,
  formatAppointmentCount,
  formatSlotTime,
  patientDisplayName,
  type ProviderAppointment,
} from './provider-dashboard-utils'

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
// 4. formatAppointmentCount
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
// 5. formatSlotTime
// ---------------------------------------------------------------------------
describe('formatSlotTime', () => {
  it('returns a time string without date components', () => {
    const result = formatSlotTime('2026-04-15T09:30:00.000Z')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
    expect(result).not.toContain('2026')
  })
})

// ---------------------------------------------------------------------------
// 6. patientDisplayName
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
