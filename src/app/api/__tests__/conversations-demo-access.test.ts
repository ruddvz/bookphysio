import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  })),
}))

function buildDemoCookie(role: 'patient' | 'provider' | 'admin') {
  const payload = {
    sessionId: `session-${role}`,
    userId: role === 'patient'
      ? '00000000-0000-4000-8000-000000000001'
      : role === 'provider'
        ? '00000000-0000-4000-8000-000000000002'
        : '00000000-0000-4000-8000-000000000003',
    role,
    fullName: role === 'provider' ? 'Dr. Meera Iyer' : role === 'admin' ? 'Ops Admin' : 'Aarav Kapoor',
    phone: '+919876543210',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  }

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

describe('GET /api/conversations demo access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns demo conversations for the signed-in demo user', async () => {
    const { GET } = await import('../conversations/route')
    const request = new NextRequest('http://localhost/api/conversations?limit=20', {
      headers: {
        cookie: `bp-demo-session=${buildDemoCookie('patient')}`,
      },
    })

    const response = await GET(request)
    const body = (await response.json()) as {
      conversations?: Array<{ other_user?: { role?: string } }>
    }

    expect(response.status).toBe(200)
    expect(body.conversations?.[0]?.other_user?.role).toBe('provider')
  })
})