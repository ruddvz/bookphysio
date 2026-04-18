import { describe, expect, it } from 'vitest'
import { halfWindowDeltaPct, monthlyVisitCountSeries } from '@/lib/clinical/provider-patients-utils'

describe('monthlyVisitCountSeries', () => {
  it('buckets visit dates into India months', () => {
    const ref = new Date('2026-06-15T12:00:00+05:30').getTime()
    const dates = ['2026-04-10', '2026-04-20', '2026-05-01', '2026-06-01']
    const series = monthlyVisitCountSeries(dates, ref, 6)
    expect(series).toHaveLength(6)
    // Jan–Jun window: April index 3 has two visits; May and June one each
    expect(series.reduce((a, b) => a + b, 0)).toBe(4)
    expect(series[3]).toBe(2)
    expect(series[4]).toBe(1)
    expect(series[5]).toBe(1)
  })
})

describe('halfWindowDeltaPct', () => {
  it('returns 0 for short series', () => {
    expect(halfWindowDeltaPct([1])).toBe(0)
  })

  it('compares first vs second half averages', () => {
    const v = [1, 1, 1, 1, 4, 4, 4, 4]
    expect(halfWindowDeltaPct(v)).toBe(300)
  })
})
