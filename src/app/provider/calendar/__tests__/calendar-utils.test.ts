import { describe, it, expect } from 'vitest'
import {
  buildGridFromData,
  dateKey,
  formatHour,
  getWeekDates,
  isSameDay,
  formatMonthRange
} from '../calendar-utils'

describe('Provider Calendar Utils', () => {
  it('formatHour formats correctly', () => {
    expect(formatHour(9)).toBe('9 AM')
    expect(formatHour(12)).toBe('12 PM')
    expect(formatHour(14)).toBe('2 PM')
  })

  it('isSameDay correctly identifies same days', () => {
    const d1 = new Date(2026, 2, 30)
    const d2 = new Date(2026, 2, 30, 10, 30)
    const d3 = new Date(2026, 2, 31)
    expect(isSameDay(d1, d2)).toBe(true)
    expect(isSameDay(d1, d3)).toBe(false)
  })

  it('getWeekDates returns 7 consecutive days starting from Monday', () => {
    const wednesday = new Date(2026, 2, 11) // March 11, 2026 is Wednesday
    const week = getWeekDates(wednesday)
    
    expect(week.length).toBe(7)
    // First day should be Monday (March 9, 2026)
    expect(week[0].getDay()).toBe(1)
    expect(week[0].getDate()).toBe(9)
    expect(week[6].getDay()).toBe(0) // Sunday
  })

  it('formatMonthRange handles single month', () => {
    const days = [
      new Date(2026, 2, 9),
      new Date(2026, 2, 15)
    ]
    expect(formatMonthRange(days)).toContain('March')
  })

  it('formatMonthRange handles month spillover', () => {
    const days = [
      new Date(2026, 2, 30), // March
      new Date(2026, 3, 5)   // April
    ]
    const range = formatMonthRange(days)
    expect(range).toContain('Mar')
    expect(range).toContain('Apr')
  })

  it('keeps booked slots visible when a later slot in the same hour is available', () => {
    const day = new Date(2026, 2, 30)
    const bookedStart = new Date(2026, 2, 30, 9, 0)
    const laterAvailableStart = new Date(2026, 2, 30, 9, 30)

    const grid = buildGridFromData(
      [day],
      [
        {
          starts_at: bookedStart.toISOString(),
          ends_at: new Date(2026, 2, 30, 9, 30).toISOString(),
          is_booked: true,
          is_blocked: false,
        },
        {
          starts_at: laterAvailableStart.toISOString(),
          ends_at: new Date(2026, 2, 30, 10, 0).toISOString(),
          is_booked: false,
          is_blocked: false,
        },
      ],
      [
        {
          visit_type: 'in_clinic',
          patient: { full_name: 'Booked Patient' },
          availabilities: { starts_at: bookedStart.toISOString() },
        },
      ],
    )

    expect(grid[dateKey(day)][9]).toMatchObject({
      status: 'booked',
      patientName: 'Booked Patient',
    })
  })

  it('keeps blocked slots visible when a later slot in the same hour is available', () => {
    const day = new Date(2026, 2, 30)

    const grid = buildGridFromData(
      [day],
      [
        {
          starts_at: new Date(2026, 2, 30, 10, 0).toISOString(),
          ends_at: new Date(2026, 2, 30, 10, 30).toISOString(),
          is_booked: false,
          is_blocked: true,
        },
        {
          starts_at: new Date(2026, 2, 30, 10, 30).toISOString(),
          ends_at: new Date(2026, 2, 30, 11, 0).toISOString(),
          is_booked: false,
          is_blocked: false,
        },
      ],
      [],
    )

    expect(grid[dateKey(day)][10]).toMatchObject({ status: 'blocked' })
  })
})
