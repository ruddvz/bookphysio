import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const otpRateLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/upstash', () => ({
  otpRatelimit: {
    limit: (...args: unknown[]) => otpRateLimitMock(...args),
  },
}))

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

function createProfileQuery(result: unknown) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue(result),
  }

  return chain
}

describe('Auth login and callback routes', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    otpRateLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.20')
  })

  it('returns 503 when password login cannot determine the user role', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn(() => createProfileQuery({ data: null, error: { message: 'users offline' } })),
    })

    const { POST } = await import('../auth/login/route')
    const response = await POST(new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul@example.com',
        password: 'SecurePass123',
      }),
    }))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Unable to determine account role. Please try again.',
    })
  })

  it('redirects the callback flow when the profile role cannot be loaded', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn(() => createProfileQuery({ data: null, error: { message: 'users offline' } })),
    })

    const { GET } = await import('../auth/callback/route')
    const response = await GET(new NextRequest('http://localhost/auth/callback?code=otp-code'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/login?error=profile_unavailable')
  })
})
