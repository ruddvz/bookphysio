import { describe, it, expect } from 'vitest'
import {
  HOURS,
  dateKey,
  formatHour,
  getWeekDates,
  isSameDay,
  formatMonthRange,
  timeToHour,
} from '../calendar-utils'

describe('Provider Schedule Utils', () => {
  it('HOURS spans 8 AM to 8 PM inclusive', () => {
    expect(HOURS[0]).toBe(8)
    expect(HOURS[HOURS.length - 1]).toBe(20)
    expect(HOURS).toHaveLength(13)
  })

  it('formatHour formats correctly', () => {
    expect(formatHour(8)).toBe('8 AM')
    expect(formatHour(12)).toBe('12 PM')
    expect(formatHour(20)).toBe('8 PM')
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
    expect(week).toHaveLength(7)
    expect(week[0].getDay()).toBe(1) // Monday
    expect(week[0].getDate()).toBe(9)
    expect(week[6].getDay()).toBe(0) // Sunday
  })

  it('formatMonthRange handles single month', () => {
    const days = [new Date(2026, 2, 9), new Date(2026, 2, 15)]
    expect(formatMonthRange(days)).toContain('March')
  })

  it('formatMonthRange handles month spillover', () => {
    const days = [new Date(2026, 2, 30), new Date(2026, 3, 5)]
    const range = formatMonthRange(days)
    expect(range).toContain('Mar')
    expect(range).toContain('Apr')
  })

  it('dateKey produces YYYY-MM-DD format', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('timeToHour parses HH:MM strings', () => {
    expect(timeToHour('08:00')).toBe(8)
    expect(timeToHour('14:30')).toBe(14)
    expect(timeToHour('20:00')).toBe(20)
  })
})
