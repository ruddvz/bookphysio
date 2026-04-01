import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
}))

describe('GET /api/providers', () => {
  it('returns 200 with empty results', async () => {
    const { GET } = await import('../providers/route')
    const req = new Request('http://localhost/api/providers?city=Mumbai')
    const res = await GET(req as never)
    expect(res.status).toBe(200)
    const body = await res.json() as { providers: unknown[] }
    expect(body).toHaveProperty('providers')
    expect(Array.isArray(body.providers)).toBe(true)
  })
})
