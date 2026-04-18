import { describe, it, expect } from 'vitest'
import { monthlySettledNetSeries, halfWindowDeltaPct } from './provider-earnings-utils'

describe('provider-earnings-utils', () => {
  it('aggregates settled net by India month', () => {
    const ref = Date.parse('2026-06-15T12:00:00+05:30')
    const { values } = monthlySettledNetSeries(
      [
        { status: 'paid', net: 1000, visitIso: '2026-04-10T10:00:00+05:30' },
        { status: 'paid', net: 500, visitIso: '2026-04-20T10:00:00+05:30' },
        { status: 'pending', net: 999, visitIso: '2026-05-01T10:00:00+05:30' },
      ],
      ref,
      6,
    )
    expect(values.length).toBe(6)
    const aprilIdx = 3
    expect(values[aprilIdx]).toBe(1500)
  })

  it('computes half-window delta', () => {
    expect(halfWindowDeltaPct([7, 7, 7, 8, 8, 8])).toBe(14)
  })
})
