import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
          },
        },
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data:
          table === 'conversations'
            ? { id: 'conv-1', user_id_1: 'user-1', user_id_2: 'user-2' }
            : { id: 'msg-1', content: 'test', sender_id: 'user-1', receiver_id: 'user-2' },
        error: null,
      }),
    })),
  })),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
}))

describe('Messages API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST /api/messages sends a message and creates conversation if needed', async () => {
    const { POST } = await import('../messages/route')
    const req = new Request('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: 'user-2',
        content: 'Hello from test',
      }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(201)
    const body = (await res.json()) as { message: unknown }
    expect(body).toHaveProperty('message')
  })

  it('GET /api/conversations returns user conversations', async () => {
    const { GET } = await import('../conversations/route')
    const req = new Request('http://localhost/api/conversations?limit=20')
    const res = await GET(req as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { conversations: unknown[] }
    expect(body).toHaveProperty('conversations')
    expect(Array.isArray(body.conversations)).toBe(true)
  })

  it('returns 401 when user not authenticated', async () => {
    vi.resetModules()
    vi.mock('@/lib/supabase/server', () => ({
      createClient: vi.fn(() => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      })),
    }))

    const { POST } = await import('../messages/route')
    const req = new Request('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: 'user-2',
        content: 'test',
      }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })

  it('returns 400 with validation error for invalid payload', async () => {
    const { POST } = await import('../messages/route')
    const req = new Request('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: 'invalid-uuid',
        content: '', // Empty content
      }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })
})
