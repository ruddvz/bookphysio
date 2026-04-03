import { describe, expect, it } from 'vitest'
import {
  buildIndiaCalendarEventRange,
  escapeIcsText,
  formatIndiaDateInput,
  formatIndiaTime,
  formatIndiaTimeRange,
} from './india-date'

describe('india-date helpers', () => {
  it('uses India date boundaries instead of UTC date boundaries', () => {
    expect(formatIndiaDateInput('2026-04-14T19:00:00.000Z')).toBe('2026-04-15')
    expect(formatIndiaDateInput('2026-04-14T18:00:00.000Z')).toBe('2026-04-14')
  })

  it('formats India times using the Kolkata timezone', () => {
    expect(formatIndiaTime('2026-04-15T20:00:00.000Z')).toMatch(/01:30\s*am/i)
    expect(formatIndiaTimeRange('2026-04-15T04:30:00.000Z', '2026-04-15T05:30:00.000Z')).toMatch(/10:00\s*am\s*-\s*11:00\s*am/i)
  })

  it('builds UTC ICS timestamps from India-local appointment inputs', () => {
    expect(buildIndiaCalendarEventRange({ date: '2026-04-15', time: '10:30 AM' })).toEqual({
      start: '20260415T050000Z',
      end: '20260415T060000Z',
    })
  })

  it('escapes reserved ICS characters', () => {
    expect(escapeIcsText('Clinic, Block A; Level 2\nBring reports')).toBe('Clinic\\, Block A\\; Level 2\\nBring reports')
  })
})