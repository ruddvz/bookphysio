import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpcMock = vi.fn()
const providerDetailsInMock = vi.fn()
const rateLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === 'providers') {
        return {
          select: vi.fn(() => ({
            in: providerDetailsInMock,
          })),
        }
      }

      throw new Error(`Unhandled table: ${table}`)
    },
    rpc: (...args: unknown[]) => rpcMock(...args),
  })),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: { limit: (...args: unknown[]) => rateLimitMock(...args) },
}))

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

describe('GET /api/providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.10')
    providerDetailsInMock.mockResolvedValue({ data: [], error: null })
    rpcMock.mockResolvedValue({ data: [], error: null })
  })

  it('returns 200 with empty results', async () => {
    const { GET } = await import('../providers/route')
    const req = new Request('http://localhost/api/providers?city=Mumbai')
    const res = await GET(req as never)

    expect(res.status).toBe(200)
    const body = await res.json() as { providers: unknown[] }
    expect(body).toHaveProperty('providers')
    expect(Array.isArray(body.providers)).toBe(true)
  })

  it('coarsens public coordinates before returning provider cards', async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          id: 'provider-1',
          slug: 'demo-provider',
          full_name: 'Dr. Demo Provider',
          title: 'Dr.',
          avatar_url: null,
          rating_avg: 4.8,
          rating_count: 21,
          experience_years: 7,
          consultation_fee_inr: 1200,
          visit_types: ['in_clinic'],
          city: 'Testville',
          lat: 18.96789,
          lng: 72.83312,
          total_count: 1,
        },
      ],
      error: null,
    })
    providerDetailsInMock.mockResolvedValue({
      data: [
        {
          id: 'provider-1',
          verified: true,
          specialties: [],
          availabilities: [],
          provider_insurances: [],
        },
      ],
      error: null,
    })

    const { GET } = await import('../providers/route')
    const res = await GET(new Request('http://localhost/api/providers?city=Testville') as never)

    expect(res.status).toBe(200)
    const body = await res.json() as {
      providers: Array<{ verified: boolean; lat: number | null; lng: number | null }>
    }

    expect(rateLimitMock).toHaveBeenCalledWith('providers-search:203.0.113.10')
    expect(body.providers).toHaveLength(1)
    expect(body.providers[0]).toMatchObject({
      verified: true,
      lat: 19,
      lng: 72.8,
    })
  })
})
