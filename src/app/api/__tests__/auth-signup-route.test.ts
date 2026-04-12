import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signUpMock = vi.fn()
const otpLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()
const usersUpdateEqMock = vi.fn()
const usersUpdateMock = vi.fn(() => ({
  eq: usersUpdateEqMock,
}))

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

vi.mock('@/lib/upstash', () => ({
  otpRatelimit: {
    limit: (...args: unknown[]) => otpLimitMock(...args),
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: (...args: unknown[]) => signUpMock(...args),
    },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table === 'users') {
        return {
          update: usersUpdateMock,
        }
      }

      throw new Error(`Unhandled table mock: ${table}`)
    },
  },
}))

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    otpLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.5')
    signUpMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'priya@example.com',
          identities: [{ id: 'identity-1' }],
        },
      },
      error: null,
    })
    usersUpdateEqMock.mockResolvedValue({ error: null })
  })

  it('maps already-registered auth errors to a 409 response', async () => {
    signUpMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'This email has already been registered' },
    })

    const { POST } = await import('../auth/signup/route')
    const response = await POST(new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'SecurePass123',
      }),
    }))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: 'An account with this email already exists. Please sign in instead.',
    })
  })

  it('skips the IP limiter when the request IP is unavailable', async () => {
    getRequestIpAddressMock.mockReturnValue(null)

    const { POST } = await import('../auth/signup/route')
    const response = await POST(new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'SecurePass123',
      }),
    }))

    expect(response.status).toBe(201)
    expect(otpLimitMock).toHaveBeenCalledTimes(1)
    expect(otpLimitMock).toHaveBeenCalledWith('signup:email:priya@example.com')
  })
}
