import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpcMock = vi.fn()
const providerDetailsInMock = vi.fn()
const fallbackProvidersOrderMock = vi.fn()
const rateLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()
const redisGetMock = vi.fn()
const redisSetMock = vi.fn()

const fallbackProvidersBuilder = {
  eq: vi.fn(() => fallbackProvidersBuilder),
  order: vi.fn(() => fallbackProvidersBuilder),
  gte: vi.fn(() => fallbackProvidersBuilder),
  lte: vi.fn(() => fallbackProvidersBuilder),
  contains: vi.fn(() => fallbackProvidersBuilder),
  limit: vi.fn(() => fallbackProvidersOrderMock()),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === 'providers') {
        return {
          select: vi.fn((selection?: string) => {
            if (selection?.includes('users!inner')) {
              return fallbackProvidersBuilder
            }

            return {
              in: providerDetailsInMock,
            }
          }),
        }
      }

      throw new Error(`Unhandled table: ${table}`)
    },
    rpc: (...args: unknown[]) => rpcMock(...args),
  })),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: { limit: (...args: unknown[]) => rateLimitMock(...args) },
  redis: {
    get: (...args: unknown[]) => redisGetMock(...args),
    set: (...args: unknown[]) => redisSetMock(...args),
  },
}))

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

describe('GET /api/providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rateLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.10')
    redisGetMock.mockResolvedValue(null)
    redisSetMock.mockResolvedValue('OK')
    fallbackProvidersOrderMock.mockResolvedValue({ data: [], error: null })
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
      lat: null,
      lng: null,
    })
  })

  it('rejects deprecated insurance filters', async () => {
    const { GET } = await import('../providers/route')
    const res = await GET(new Request('http://localhost/api/providers?insurance_id=legacy-plan') as never)

    expect(res.status).toBe(400)
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('falls back to relational search when the RPC fails', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: 'rpc failed' },
    })
    fallbackProvidersOrderMock.mockResolvedValue({
      data: [
        {
          id: 'provider-1',
          slug: 'demo-provider',
          title: 'Dr.',
          rating_avg: 4.7,
          rating_count: 12,
          experience_years: 7,
          consultation_fee_inr: 900,
          specialty_ids: ['specialty-1'],
          users: { full_name: 'Dr. Demo Provider', avatar_url: null },
          locations: [
            {
              id: 'location-1',
              city: 'Mumbai',
              lat: 18.96789,
              lng: 72.83312,
              visit_type: ['in_clinic', 'home_visit'],
            },
          ],
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
        },
      ],
      error: null,
    })

    const { GET } = await import('../providers/route')
    const res = await GET(new Request('http://localhost/api/providers?city=Mumbai') as never)

    expect(res.status).toBe(200)

    const body = await res.json() as {
      total: number
      providers: Array<{ id: string; city: string | null; verified: boolean; lat: number | null; lng: number | null }>
    }

    expect(body.total).toBe(1)
    expect(body.providers).toHaveLength(1)
    expect(body.providers[0]).toMatchObject({
      id: 'provider-1',
      city: 'Mumbai',
      verified: true,
      lat: 19.076,
      lng: 72.8777,
    })
    expect(fallbackProvidersBuilder.eq).toHaveBeenCalledWith('verified', true)
    expect(fallbackProvidersBuilder.gte).toHaveBeenCalledWith('rating_avg', 0)
    expect(fallbackProvidersBuilder.lte).toHaveBeenCalledWith('consultation_fee_inr', 2000000)
    expect(fallbackProvidersBuilder.limit).toHaveBeenCalled()
    expect(fallbackProvidersOrderMock).toHaveBeenCalled()
  })
})
