import { describe, expect, it } from 'vitest'
import {
  bucketVisitsByWeek,
  daysUntil,
  formatAppointmentDateTime,
  getNextAppointment,
  getPatientAppointmentProviderName,
  getPatientAppointmentVisitLabel,
} from './dashboard-utils'
import type { AppointmentItem } from '../appointments/appointments-utils'

const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
const tomorrow = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString()
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

describe('patient dashboard next appointment helpers', () => {
  it('selects the nearest upcoming appointment and ignores past visits', () => {
    const nextAppointment = getNextAppointment([
      {
        id: 'past-visit',
        status: 'completed',
        visit_type: 'in_clinic',
        fee_inr: 800,
        payment_status: null,
        availabilities: { starts_at: yesterday },
        providers: { users: { full_name: 'Dr. Meera Iyer' }, specialties: [] },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'tomorrow-visit',
        status: 'pending',
        visit_type: 'home_visit',
        fee_inr: 1100,
        payment_status: null,
        availabilities: { starts_at: tomorrow },
        providers: { users: { full_name: 'Dr. Meera Iyer' }, specialties: [] },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'soonest-visit',
        status: 'confirmed',
        visit_type: 'in_clinic',
        fee_inr: 950,
        payment_status: null,
        availabilities: { starts_at: inTwoHours },
        providers: { users: { full_name: 'Meera Iyer' }, specialties: [] },
        locations: { city: 'Mumbai' },
      },
    ])

    expect(nextAppointment?.id).toBe('soonest-visit')
  })

  it('returns null when there is no upcoming appointment', () => {
    expect(
      getNextAppointment([
        {
          id: 'past-only',
          status: 'completed',
          visit_type: 'in_clinic',
          fee_inr: 800,
          payment_status: null,
          availabilities: { starts_at: yesterday },
          providers: { users: { full_name: 'Dr. Meera Iyer' }, specialties: [] },
          locations: { city: 'Mumbai' },
        },
      ])
    ).toBeNull()
  })

  it('formats provider and visit details for the appointment card', () => {
    const appointment = {
      id: 'soonest-visit',
      status: 'confirmed',
      visit_type: 'home_visit',
      fee_inr: 900,
      payment_status: null as AppointmentItem['payment_status'],
      availabilities: { starts_at: inTwoHours },
      providers: { users: { full_name: 'Meera Iyer' }, specialties: [] },
      locations: { city: 'Mumbai' },
    }

    expect(getPatientAppointmentProviderName(appointment)).toBe('Dr. Meera Iyer')
    expect(getPatientAppointmentVisitLabel(appointment)).toBe('Home session')
    expect(formatAppointmentDateTime(inTwoHours)).toMatch(/\d{1,2} \w{3}/)
  })
})

describe('bucketVisitsByWeek', () => {
  const now = Date.parse('2026-04-15T12:00:00.000Z')
  const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString()

  it('returns an array of zeros when there are no visits', () => {
    expect(bucketVisitsByWeek([], 4, now)).toEqual([0, 0, 0, 0])
  })

  it('places this week visits in the last bucket', () => {
    const buckets = bucketVisitsByWeek([{ visit_date: daysAgo(0) }], 4, now)
    expect(buckets).toEqual([0, 0, 0, 1])
  })

  it('drops visits older than the requested window', () => {
    const buckets = bucketVisitsByWeek(
      [{ visit_date: daysAgo(60) }, { visit_date: daysAgo(2) }],
      4,
      now,
    )
    expect(buckets).toEqual([0, 0, 0, 1])
  })

  it('skips items with missing or unparseable dates', () => {
    const buckets = bucketVisitsByWeek(
      [{ visit_date: null }, { visit_date: 'not-a-date' }, { visit_date: daysAgo(1) }],
      2,
      now,
    )
    expect(buckets).toEqual([0, 1])
  })

  it('groups visits across multiple weeks', () => {
    // 4-week window — one visit per rolling-week slot, oldest → newest:
    //   24d ago (week 3 ago) → idx 0
    //   17d ago (week 2 ago) → idx 1
    //   10d ago (week 1 ago) → idx 2
    //   2d  ago (this week)  → idx 3
    const buckets = bucketVisitsByWeek(
      [
        { visit_date: daysAgo(24) },
        { visit_date: daysAgo(17) },
        { visit_date: daysAgo(10) },
        { visit_date: daysAgo(2) },
      ],
      4,
      now,
    )
    expect(buckets).toEqual([1, 1, 1, 1])
  })
})

describe('daysUntil', () => {
  const now = Date.parse('2026-04-15T12:00:00.000Z')

  it('returns null for missing input', () => {
    expect(daysUntil(undefined, now)).toBeNull()
    expect(daysUntil(null, now)).toBeNull()
  })

  it('returns null for unparseable input', () => {
    expect(daysUntil('not-a-date', now)).toBeNull()
  })

  it('returns null for past dates', () => {
    expect(daysUntil(new Date(now - 60 * 60 * 1000).toISOString(), now)).toBeNull()
  })

  it('returns 0 for an appointment later today', () => {
    expect(daysUntil(new Date(now + 4 * 60 * 60 * 1000).toISOString(), now)).toBe(0)
  })

  it('returns whole-day distance for future dates', () => {
    expect(daysUntil(new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(), now)).toBe(3)
  })
})