import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDemoCookiePayload,
  DEMO_SESSION_COOKIE,
  encodeDemoCookie,
} from '@/lib/demo/session'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  })),
}))

async function buildDemoCookie(role: 'patient' | 'provider' | 'admin') {
  return encodeDemoCookie(createDemoCookiePayload(role))
}

describe('GET /api/conversations demo access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEMO', 'true')
  })

  it('returns demo conversations for the signed-in demo user', async () => {
    const { GET } = await import('../conversations/route')
    const demoCookie = await buildDemoCookie('patient')
    const request = new NextRequest('http://localhost/api/conversations?limit=20', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
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