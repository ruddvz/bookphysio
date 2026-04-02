import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const adminFromMock = vi.fn()
const otpRateLimitMock = vi.fn()
const apiRateLimitMock = vi.fn()
const sendOtpMock = vi.fn()
const verifyOtpMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => adminFromMock(...args),
  },
}))

vi.mock('@/lib/upstash', () => ({
  otpRatelimit: {
    limit: (...args: unknown[]) => otpRateLimitMock(...args),
  },
  apiRatelimit: {
    limit: (...args: unknown[]) => apiRateLimitMock(...args),
  },
}))

vi.mock('@/lib/msg91', () => ({
  sendOtp: (...args: unknown[]) => sendOtpMock(...args),
  verifyOtp: (...args: unknown[]) => verifyOtpMock(...args),
}))

function createSingleRowChain(result: unknown) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue(result),
  }

  return chain
}

describe('Auth and admin hardening routes', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    otpRateLimitMock.mockResolvedValue({ success: true })
    apiRateLimitMock.mockResolvedValue({ success: true })
    sendOtpMock.mockResolvedValue({ success: true })
    verifyOtpMock.mockResolvedValue({ success: true })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('continues through the normal OTP send flow even when DEV_ACCESS_CODE is present in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DEV_ACCESS_CODE', '2642')

    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith({ phone: '+919876543210' })
  })

  it('falls back to the patient role when OTP verification cannot resolve a stored profile role', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-1',
              user_metadata: { role: 'admin' },
            },
            session: { access_token: 'token' },
          },
          error: null,
        }),
      },
      from: vi.fn(() => createSingleRowChain({ data: null })),
    })

    const { POST } = await import('../auth/otp/verify/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', otp: '123456' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ role: 'patient' })
  })

  it('builds magic-link callbacks from configured site env only and strips hostile return targets', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://bookphysio.in')

    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/magic-link/route')
    const response = await POST(new Request('http://malicious.example/api/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({
        email: 'rahul@example.com',
        returnTo: 'https://evil.example/phish',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'rahul@example.com',
      options: expect.objectContaining({
        shouldCreateUser: true,
        emailRedirectTo: 'https://bookphysio.in/auth/callback',
      }),
    })
  })

  it('blocks non-admin callers before querying the admin users registry', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'user-1' },
          },
        }),
      },
      from: vi.fn(() => createSingleRowChain({ data: { role: 'patient' } })),
    })

    const { GET } = await import('../admin/users/route')
    const response = await GET(new Request('http://localhost/api/admin/users?page=1') as never)

    expect(response.status).toBe(403)
    expect(adminFromMock).not.toHaveBeenCalled()
  })
})