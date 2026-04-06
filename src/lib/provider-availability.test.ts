import { describe, expect, it } from 'vitest'
import {
  buildAvailabilitySlotsInIndia,
  cloneProviderSchedule,
  DEFAULT_PROVIDER_SCHEDULE,
  deriveProviderScheduleFromSlots,
} from './provider-availability'

describe('provider availability helpers', () => {
  it('derives a schedule and duration from persisted India-time slots', () => {
    const derived = deriveProviderScheduleFromSlots([
      {
        starts_at: '2026-04-06T03:30:00.000Z',
        ends_at: '2026-04-06T04:00:00.000Z',
        is_booked: false,
        is_blocked: false,
      },
      {
        starts_at: '2026-04-06T04:00:00.000Z',
        ends_at: '2026-04-06T04:30:00.000Z',
        is_booked: false,
        is_blocked: false,
      },
      {
        starts_at: '2026-04-07T10:30:00.000Z',
        ends_at: '2026-04-07T11:00:00.000Z',
        is_booked: true,
        is_blocked: false,
      },
    ])

    expect(derived.duration).toBe('30')
    expect(derived.schedule.Monday).toEqual({ enabled: true, start: '09:00', end: '10:00' })
    expect(derived.schedule.Tuesday.enabled).toBe(false)
    expect(derived.schedule.Sunday.enabled).toBe(false)
  })

  it('builds UTC slots from India-local schedule times', () => {
    const schedule = cloneProviderSchedule(DEFAULT_PROVIDER_SCHEDULE)
    schedule.Monday = { enabled: true, start: '09:00', end: '10:00' }
    schedule.Tuesday.enabled = false
    schedule.Wednesday.enabled = false
    schedule.Thursday.enabled = false
    schedule.Friday.enabled = false
    schedule.Saturday.enabled = false
    schedule.Sunday.enabled = false

    const [slot] = buildAvailabilitySlotsInIndia({
      schedule,
      durationMinutes: 30,
      weeks: 1,
      providerId: 'provider-1',
      locationId: 'location-1',
      bufferMins: 5,
      referenceDate: new Date('2026-04-05T12:00:00.000Z'),
    })

    expect(slot?.starts_at).toBe('2026-04-06T03:30:00.000Z')
    expect(slot?.ends_at).toBe('2026-04-06T04:00:00.000Z')
  })
})