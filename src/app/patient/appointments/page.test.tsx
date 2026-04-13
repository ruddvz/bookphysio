/**
 * 8.8 Patient Appointments Polish — Vitest unit tests
 * Tests: tab state init, filter logic, date formatting
 */
import { describe, it, expect } from 'vitest'
import {
  filterByTab,
  parseTab,
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
} from './appointments-utils'

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const futureISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
const pastISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

const upcomingAppt: AppointmentItem = {
  id: 'appt-upcoming',
  status: 'confirmed',
  visit_type: 'in_clinic',
  fee_inr: 800,
  payment_status: null,
  availabilities: { starts_at: futureISO },
  providers: { users: { full_name: 'Priya Sharma' }, specialties: [{ name: 'Sports Physio' }] },
  locations: { city: 'Mumbai' },
}

const pastAppt: AppointmentItem = {
  id: 'appt-past',
  status: 'completed',
  visit_type: 'home_visit',
  fee_inr: 600,
  payment_status: null,
  availabilities: { starts_at: pastISO },
  providers: { users: { full_name: 'Anand Kumar' }, specialties: [{ name: 'Ortho Physio' }] },
  locations: { city: 'Delhi' },
}

const cancelledAppt: AppointmentItem = {
  id: 'appt-cancelled',
  status: 'cancelled',
  visit_type: 'home_visit',
  fee_inr: 500,
  payment_status: null,
  availabilities: { starts_at: futureISO },
  providers: { users: { full_name: 'Sunita Rao' }, specialties: [] },
  locations: null,
}

const allAppts = [upcomingAppt, pastAppt, cancelledAppt]

// ---------------------------------------------------------------------------
// 1. Tab state init from URL param
// ---------------------------------------------------------------------------
describe('parseTab', () => {
  it('defaults to "upcoming" when param is null', () => {
    expect(parseTab(null)).toBe('upcoming')
  })

  it('returns "past" when param is "past"', () => {
    expect(parseTab('past')).toBe('past')
  })

  it('defaults to "upcoming" for unknown values', () => {
    expect(parseTab('invalid')).toBe('upcoming')
    expect(parseTab('')).toBe('upcoming')
  })
})

// ---------------------------------------------------------------------------
// 2. Filter logic
// ---------------------------------------------------------------------------
describe('filterByTab', () => {
  it('upcoming tab shows confirmed future appointments', () => {
    const result = filterByTab(allAppts, 'upcoming')
    expect(result.map((a) => a.id)).toContain('appt-upcoming')
  })

  it('upcoming tab excludes cancelled appointments', () => {
    const result = filterByTab(allAppts, 'upcoming')
    expect(result.map((a) => a.id)).not.toContain('appt-cancelled')
  })

  it('past tab shows completed appointments', () => {
    const result = filterByTab(allAppts, 'past')
    expect(result.map((a) => a.id)).toContain('appt-past')
  })

  it('past tab shows cancelled appointments', () => {
    const result = filterByTab(allAppts, 'past')
    expect(result.map((a) => a.id)).toContain('appt-cancelled')
  })

  it('returns empty array when no appointments match tab', () => {
    const onlyUpcoming = [upcomingAppt]
    expect(filterByTab(onlyUpcoming, 'past')).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 3. Date formatting
// ---------------------------------------------------------------------------
describe('formatApptDate', () => {
  it('formats ISO string to DD MMM YYYY', () => {
    const result = formatApptDate('2026-04-15T10:30:00.000Z')
    expect(result).toMatch(/\d{1,2} \w{3} \d{4}/)
  })

  it('does not expose raw ISO string', () => {
    const result = formatApptDate('2026-04-15T10:30:00.000Z')
    expect(result).not.toContain('T')
    expect(result).not.toContain('Z')
  })
})

// ---------------------------------------------------------------------------
// 4. Provider display name
// ---------------------------------------------------------------------------
describe('providerDisplayName', () => {
  it('prepends Dr. when missing', () => {
    expect(providerDisplayName(upcomingAppt)).toBe('Dr. Priya Sharma')
  })

  it('does not double-prefix Dr.', () => {
    const appt = { ...upcomingAppt, providers: { users: { full_name: 'Dr. Anand Kumar' } } }
    expect(providerDisplayName(appt)).toBe('Dr. Anand Kumar')
  })

  it('falls back to "Doctor" when name is null', () => {
    const appt = { ...upcomingAppt, providers: { users: null } }
    expect(providerDisplayName(appt)).toBe('Doctor')
  })
})
