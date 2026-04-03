import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatSlotTime, groupSlots } from './BookingCard'

describe('BookingCard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('groups and formats slots using India time instead of local Date methods', async () => {
    const getHoursSpy = vi.spyOn(Date.prototype, 'getHours').mockReturnValue(20)
    const toLocaleTimeStringSpy = vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('08:00 PM')
    const slot = {
      id: 'slot-1',
      starts_at: '2026-04-15T04:30:00.000Z',
      ends_at: '2026-04-15T05:00:00.000Z',
      slot_duration_mins: 30,
      location_id: 'location-1',
    }

    const grouped = groupSlots([slot])

    expect(grouped.morning).toEqual([slot])
    expect(grouped.afternoon).toEqual([])
    expect(grouped.evening).toEqual([])
    expect(formatSlotTime(slot.starts_at)).toMatch(/10:00\s*am/i)
    expect(getHoursSpy).not.toHaveBeenCalled()
    expect(toLocaleTimeStringSpy).not.toHaveBeenCalled()
  })
})