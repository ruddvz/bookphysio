import { describe, it, expect } from 'vitest'
import {
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
})
