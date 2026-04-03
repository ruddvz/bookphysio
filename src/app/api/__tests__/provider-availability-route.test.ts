import { beforeEach, describe, expect, it, vi } from 'vitest'

const locationsSelectMock = vi.fn()
const locationsEqMock = vi.fn()
const locationsContainsMock = vi.fn()
const availabilitiesSelectMock = vi.fn()
const availabilitiesEqMock = vi.fn()
const availabilitiesGteMock = vi.fn()
const availabilitiesLteMock = vi.fn()
const availabilitiesInMock = vi.fn()
const availabilitiesOrderMock = vi.fn()
const rateLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === 'locations') {
        return {
          select: locationsSelectMock.mockReturnThis(),
          eq: locationsEqMock.mockReturnThis(),
          contains: locationsContainsMock,
        }
      }

      return {
        select: availabilitiesSelectMock.mockReturnThis(),
        eq: availabilitiesEqMock.mockReturnThis(),
        gte: availabilitiesGteMock.mockReturnThis(),
        lte: availabilitiesLteMock.mockReturnThis(),
        in: availabilitiesInMock.mockReturnThis(),
        order: availabilitiesOrderMock,
      }
    },
  })),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: {
    limit: (...args: unknown[]) => rateLimitMock(...args),
  },
}))

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

describe('GET /api/providers/[id]/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.10')
    locationsContainsMock.mockResolvedValue({
      data: [{ id: 'location-home' }],
      error: null,
    })
    availabilitiesOrderMock.mockResolvedValue({
      data: [],
      error: null,
    })
  })

  it('filters slots to locations that support the requested visit type', async () => {
    const { GET } = await import('../providers/[id]/availability/route')
    const request = new Request(
      'http://localhost/api/providers/provider-1/availability?from=2026-04-15T00:00:00%2B05:30&to=2026-04-15T23:59:59%2B05:30&visit_type=home_visit',
    )

    const response = await GET(request as never, {
      params: Promise.resolve({ id: 'provider-1' }),
    })

    expect(response.status).toBe(200)
  expect(rateLimitMock).toHaveBeenCalledWith('provider-availability:203.0.113.10')
    expect(locationsSelectMock).toHaveBeenCalledWith('id')
    expect(locationsEqMock).toHaveBeenCalledWith('provider_id', 'provider-1')
    expect(locationsContainsMock).toHaveBeenCalledWith('visit_type', ['home_visit'])
    expect(availabilitiesInMock).toHaveBeenCalledWith('location_id', ['location-home'])
  })
})