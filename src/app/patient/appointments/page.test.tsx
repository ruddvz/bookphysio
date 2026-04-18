/**
 * 8.8 + 16.16 Patient Appointments utilities — Vitest unit tests
 * Tests: tab state init, filter logic, date formatting, v2 timeline grouping.
 */
import { describe, it, expect } from 'vitest'
import {
  filterByTab,
  parseTab,
  formatApptDate,
  formatApptTimeOnly,
  groupApptsByDay,
  providerDisplayName,
  statusBadgeVariant,
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

// ---------------------------------------------------------------------------
// 5. v2 timeline grouping (slice 16.16)
// ---------------------------------------------------------------------------

// Fixed "now" anchor — 2026-04-17 17:30 IST. Pure functions never call new
// Date() lazily so we can freeze tests without fake timers.
const NOW_IST = Date.parse('2026-04-17T12:00:00.000Z') // 17:30 IST

function makeAppt(overrides: Partial<AppointmentItem> & { id: string }): AppointmentItem {
  return {
    id: overrides.id,
    status: overrides.status ?? 'confirmed',
    visit_type: overrides.visit_type ?? 'in_clinic',
    fee_inr: overrides.fee_inr ?? 700,
    payment_status: overrides.payment_status ?? null,
    availabilities: overrides.availabilities ?? null,
    providers: overrides.providers ?? { users: { full_name: 'Priya Sharma' } },
    locations: overrides.locations ?? null,
  }
}

describe('groupApptsByDay', () => {
  it('returns an empty array when no appointments are supplied', () => {
    expect(groupApptsByDay([], 'upcoming', NOW_IST)).toEqual([])
  })

  it('labels the slot on the anchor day as "Today"', () => {
    const todayNoonIst = makeAppt({
      id: 'a1',
      availabilities: { starts_at: '2026-04-17T06:30:00.000Z' }, // 12:00 IST
    })
    const [day] = groupApptsByDay([todayNoonIst], 'upcoming', NOW_IST)
    expect(day.isToday).toBe(true)
    expect(day.label).toMatch(/^Today/)
  })

  it('sorts upcoming days ascending (soonest first)', () => {
    const todaySlot = makeAppt({
      id: 'a1',
      availabilities: { starts_at: '2026-04-17T06:30:00.000Z' },
    })
    const tomorrowSlot = makeAppt({
      id: 'a2',
      availabilities: { starts_at: '2026-04-18T06:30:00.000Z' },
    })
    const later = makeAppt({
      id: 'a3',
      availabilities: { starts_at: '2026-04-22T06:30:00.000Z' },
    })
    const days = groupApptsByDay([later, todaySlot, tomorrowSlot], 'upcoming', NOW_IST)
    expect(days.map((d) => d.key)).toEqual(['2026-04-17', '2026-04-18', '2026-04-22'])
  })

  it('sorts past days descending (most recent first)', () => {
    const yesterday = makeAppt({
      id: 'a1',
      status: 'completed',
      availabilities: { starts_at: '2026-04-16T06:30:00.000Z' },
    })
    const older = makeAppt({
      id: 'a2',
      status: 'completed',
      availabilities: { starts_at: '2026-04-05T06:30:00.000Z' },
    })
    const days = groupApptsByDay([older, yesterday], 'past', NOW_IST)
    expect(days.map((d) => d.key)).toEqual(['2026-04-16', '2026-04-05'])
  })

  it('groups multiple appointments that share a single India-local day', () => {
    const morning = makeAppt({
      id: 'a1',
      availabilities: { starts_at: '2026-04-18T03:30:00.000Z' }, // 09:00 IST
    })
    const evening = makeAppt({
      id: 'a2',
      availabilities: { starts_at: '2026-04-18T13:30:00.000Z' }, // 19:00 IST
    })
    const days = groupApptsByDay([evening, morning], 'upcoming', NOW_IST)
    expect(days).toHaveLength(1)
    expect(days[0].items.map((i) => i.id)).toEqual(['a1', 'a2'])
  })

  it('buckets slot-less appointments into "To be scheduled" at the end', () => {
    const withSlot = makeAppt({
      id: 'a1',
      availabilities: { starts_at: '2026-04-18T06:30:00.000Z' },
    })
    const tbd = makeAppt({ id: 'a2', availabilities: null })
    const days = groupApptsByDay([tbd, withSlot], 'upcoming', NOW_IST)
    expect(days[days.length - 1].key).toBe('pending')
    expect(days[days.length - 1].label).toBe('To be scheduled')
  })

  it('uses an India-local day key so UTC-midnight crossings do not split a single IST day', () => {
    // 2026-04-18T22:00Z = 2026-04-19 03:30 IST; should land on the 19th not the 18th.
    const lateNightUtc = makeAppt({
      id: 'a1',
      availabilities: { starts_at: '2026-04-18T22:00:00.000Z' },
    })
    const [day] = groupApptsByDay([lateNightUtc], 'upcoming', NOW_IST)
    expect(day.key).toBe('2026-04-19')
  })

  it('marks days strictly before the anchor as past', () => {
    const past = makeAppt({
      id: 'a1',
      status: 'completed',
      availabilities: { starts_at: '2026-04-16T06:30:00.000Z' },
    })
    const [day] = groupApptsByDay([past], 'past', NOW_IST)
    expect(day.isPast).toBe(true)
    expect(day.isToday).toBe(false)
  })
})

describe('statusBadgeVariant', () => {
  it('maps confirmed/completed → success', () => {
    expect(statusBadgeVariant('confirmed')).toBe('success')
    expect(statusBadgeVariant('completed')).toBe('success')
  })

  it('maps pending → warning', () => {
    expect(statusBadgeVariant('pending')).toBe('warning')
  })

  it('maps cancelled → danger', () => {
    expect(statusBadgeVariant('cancelled')).toBe('danger')
  })

  it('falls back to soft for unknown statuses', () => {
    expect(statusBadgeVariant('no_show')).toBe('soft')
    expect(statusBadgeVariant('whatever')).toBe('soft')
  })
})

describe('formatApptTimeOnly', () => {
  it('renders IST clock time only', () => {
    const result = formatApptTimeOnly('2026-04-17T06:30:00.000Z') // 12:00 IST
    expect(result).toMatch(/12:00/)
    // Must NOT leak the ISO year/month to the clock label.
    expect(result).not.toContain('2026')
  })
})
