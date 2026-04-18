import { describe, expect, it } from 'vitest'
import {
  bucketScheduleByWeek,
  countFirstVisitsInSchedule,
} from './provider-dashboard-utils'
import type { ScheduleEntry } from '@/lib/clinical/types'

function entry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return {
    visit_id: overrides.visit_id ?? 'v1',
    profile_id: overrides.profile_id ?? 'p1',
    patient_name: overrides.patient_name ?? 'Patient',
    visit_date: overrides.visit_date ?? '2026-04-17',
    visit_time: overrides.visit_time ?? '09:00',
    fee_inr: overrides.fee_inr ?? 800,
    visit_number: overrides.visit_number ?? 2,
  }
}

describe('bucketScheduleByWeek', () => {
  // Reference is a point during the India day 2026-04-15 (Wed). All
  // entries use `YYYY-MM-DD` which `parseIndiaDate` reads as India-local
  // midnight — the bucketer must respect that to keep week boundaries
  // stable regardless of UTC hour.
  const reference = new Date('2026-04-15T06:30:00.000Z') // 12:00 noon IST

  it('returns an array of zeros when there are no entries', () => {
    expect(bucketScheduleByWeek([], 4, reference)).toEqual([0, 0, 0, 0])
  })

  it('places an entry dated today in bucket 0', () => {
    const buckets = bucketScheduleByWeek([entry({ visit_date: '2026-04-15' })], 4, reference)
    expect(buckets).toEqual([1, 0, 0, 0])
  })

  it('places an entry seven days out in bucket 1', () => {
    const buckets = bucketScheduleByWeek([entry({ visit_date: '2026-04-22' })], 4, reference)
    expect(buckets).toEqual([0, 1, 0, 0])
  })

  it('keeps the final-day-of-window entry inside the last bucket', () => {
    // days_ahead = 27 → floor(27/7) = 3 (last index for weeks=4)
    const buckets = bucketScheduleByWeek([entry({ visit_date: '2026-05-12' })], 4, reference)
    expect(buckets).toEqual([0, 0, 0, 1])
  })

  it('drops entries beyond the requested window', () => {
    // days_ahead = 28 → out of range for weeks=4
    const buckets = bucketScheduleByWeek([entry({ visit_date: '2026-05-13' })], 4, reference)
    expect(buckets).toEqual([0, 0, 0, 0])
  })

  it('drops entries dated before today in India time', () => {
    const buckets = bucketScheduleByWeek([entry({ visit_date: '2026-04-14' })], 4, reference)
    expect(buckets).toEqual([0, 0, 0, 0])
  })

  it('is stable across wall-clock hour of the reference instant', () => {
    // Same India day (2026-04-15), different UTC hours. The bucket must
    // not flip because India midnight hasn't moved.
    const earlyUtc = new Date('2026-04-14T19:00:00.000Z') // 00:30 IST on 15th
    const lateUtc = new Date('2026-04-15T18:00:00.000Z')  // 23:30 IST on 15th
    const items = [entry({ visit_date: '2026-04-15' }), entry({ visit_date: '2026-04-21' })]
    expect(bucketScheduleByWeek(items, 4, earlyUtc)).toEqual([2, 0, 0, 0])
    expect(bucketScheduleByWeek(items, 4, lateUtc)).toEqual([2, 0, 0, 0])
  })

  it('groups a spread of bookings across multiple weeks', () => {
    const buckets = bucketScheduleByWeek(
      [
        entry({ visit_id: 'a', visit_date: '2026-04-15' }), // today
        entry({ visit_id: 'b', visit_date: '2026-04-18' }), // +3d → wk 0
        entry({ visit_id: 'c', visit_date: '2026-04-24' }), // +9d → wk 1
        entry({ visit_id: 'd', visit_date: '2026-05-02' }), // +17d → wk 2
      ],
      4,
      reference,
    )
    expect(buckets).toEqual([2, 1, 1, 0])
  })
})

describe('countFirstVisitsInSchedule', () => {
  it('returns 0 for an empty schedule', () => {
    expect(countFirstVisitsInSchedule([])).toBe(0)
  })

  it('counts only entries with visit_number === 1', () => {
    expect(
      countFirstVisitsInSchedule([
        entry({ visit_id: 'a', visit_number: 1 }),
        entry({ visit_id: 'b', visit_number: 2 }),
        entry({ visit_id: 'c', visit_number: 1 }),
        entry({ visit_id: 'd', visit_number: 5 }),
      ]),
    ).toBe(2)
  })
})
