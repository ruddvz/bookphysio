import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPendingOtpCookieValue, OTP_PENDING_COOKIE_NAME } from '@/lib/auth/pending-otp-cookie'
import { buildPhoneRateLimitKey } from '@/lib/auth/otp-rate-limit'

const createClientMock = vi.fn()
const adminFromMock = vi.fn()
const adminUpdateUserByIdMock = vi.fn()
const otpRateLimitMock = vi.fn()
const apiRateLimitMock = vi.fn()
const previewRateLimitMock = vi.fn()
const sendOtpMock = vi.fn()
const verifyOtpMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        updateUserById: (...args: unknown[]) => adminUpdateUserByIdMock(...args),
      },
    },
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
  previewRatelimit: {
    limit: (...args: unknown[]) => previewRateLimitMock(...args),
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

function createUpdateChain(result: unknown) {
  const chain = {
    update: vi.fn(() => chain),
    eq: vi.fn().mockResolvedValue(result),
  }

  return chain
}

describe('Auth and admin hardening routes', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    otpRateLimitMock.mockResolvedValue({ success: true })
    apiRateLimitMock.mockResolvedValue({ success: true })
    previewRateLimitMock.mockResolvedValue({ success: true })
    sendOtpMock.mockResolvedValue({ success: true })
    verifyOtpMock.mockResolvedValue({ success: true })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('continues through the normal OTP send flow even when DEV_ACCESS_CODE is present in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DEV_ACCESS_CODE', '2642')
    vi.stubEnv('OTP_PENDING_COOKIE_SECRET', 'otp-cookie-secret')

    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', flow: 'login' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+919876543210',
      options: { shouldCreateUser: false },
    })
    await expect(response.json()).resolves.toMatchObject({
      message: 'If an account exists, an OTP has been sent.',
      flowId: expect.any(String),
    })
  })

  it('does not bypass the normal OTP send flow for legacy demo phone numbers', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919000000000', flow: 'login' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+919000000000',
      options: { shouldCreateUser: false },
    })
  })

  it('returns a uniform success response when a login OTP send targets a missing account', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({
      error: { message: 'Signups not allowed for otp' },
    })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', flow: 'login' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      message: 'If an account exists, an OTP has been sent.',
      flowId: expect.any(String),
    })
  })

  it('extracts auth rate-limit IPs from forwarded headers when request.ip is unavailable', async () => {
    vi.stubEnv('VERCEL', '1')

    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', flow: 'login' }),
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '203.0.113.7',
      },
    }) as never)

    expect(response.status).toBe(200)
    expect(otpRateLimitMock).toHaveBeenNthCalledWith(1, 'otp-send:ip:203.0.113.7')
    expect(otpRateLimitMock).toHaveBeenNthCalledWith(2, await buildPhoneRateLimitKey('send', '+919876543210'))
  })

  it('uses Cloudflare client IP headers instead of client-controlled forwarded headers', async () => {
    vi.stubEnv('CF_PAGES', '1')

    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', flow: 'login' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.10',
        'cf-connecting-ip': '203.0.113.9',
      },
    }) as never)

    expect(response.status).toBe(200)
    expect(otpRateLimitMock).toHaveBeenNthCalledWith(1, 'otp-send:ip:203.0.113.9')
  })

  it('allows account creation only for signup OTP sends', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', flow: 'signup' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+919876543210',
      options: { shouldCreateUser: true },
    })
  })

  it('allows account creation for provider signup OTP sends', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp,
      },
    })

    const { POST } = await import('../auth/otp/send/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: '+919876543210', flow: 'provider_signup' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+919876543210',
      options: { shouldCreateUser: true },
    })
    expect(response.headers.get('set-cookie')).toContain(`${OTP_PENDING_COOKIE_NAME}=`)
    expect(response.headers.get('set-cookie')).not.toContain('9876543210')
  })

  it('returns 404 for the public preview API when the production preview gate is disabled', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'false')

    const { POST } = await import('../auth/preview/route')
    const response = await POST(new Request('http://localhost/api/auth/preview', {
      method: 'POST',
      body: JSON.stringify({ password: 'preview-secret' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(404)
    expect(previewRateLimitMock).not.toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toBeNull()
    await expect(response.json()).resolves.toEqual({ error: 'Not Found' })
  })

  it('rate limits preview password attempts by trusted IP address', async () => {
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'true')
    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'preview-token-secret')
    vi.stubEnv('VERCEL', '1')
    previewRateLimitMock.mockResolvedValue({ success: false })

    const { POST } = await import('../auth/preview/route')
    const response = await POST(new Request('http://localhost/api/auth/preview', {
      method: 'POST',
      body: JSON.stringify({ password: 'preview-secret' }),
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '203.0.113.18',
      },
    }) as never)

    expect(response.status).toBe(429)
    expect(previewRateLimitMock).toHaveBeenCalledWith('preview:ip:203.0.113.18')
    await expect(response.json()).resolves.toEqual({
      error: 'Too many preview access attempts. Try again later.',
    })
  })

  it('falls back to the patient role when OTP verification cannot resolve a stored profile role', async () => {
    const pendingOtpCookie = await createPendingOtpCookieValue({
      phone: '+919876543210',
      flow: 'login',
    })

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
      body: JSON.stringify({ otp: '123456' }),
      headers: {
        'Content-Type': 'application/json',
        cookie: `${OTP_PENDING_COOKIE_NAME}=${pendingOtpCookie}`,
      },
    }) as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ role: 'patient' })
  })

  it('rejects legacy demo OTP codes through the normal verification flow', async () => {
    const pendingOtpCookie = await createPendingOtpCookieValue({
      phone: '+919000000000',
      flow: 'login',
    })

    const verifyOtp = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid OTP' },
    })

    createClientMock.mockResolvedValue({
      auth: {
        verifyOtp,
      },
    })

    const { POST } = await import('../auth/otp/verify/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ otp: '999999' }),
      headers: {
        'Content-Type': 'application/json',
        cookie: `${OTP_PENDING_COOKIE_NAME}=${pendingOtpCookie}`,
      },
    }) as never)

    expect(verifyOtp).toHaveBeenCalledWith({
      phone: '+919000000000',
      token: '999999',
      type: 'sms',
    })
    expect(response.status).toBe(400)
    expect(response.headers.get('set-cookie')).toBeNull()
    await expect(response.json()).resolves.toEqual({ error: 'Invalid OTP' })
  })

  it('keeps OTP verification successful when profile sync fails after auth succeeds', async () => {
    const pendingOtpCookie = await createPendingOtpCookieValue({
      phone: '+919876543210',
      flow: 'signup',
    })

    adminUpdateUserByIdMock.mockResolvedValue({
      error: { message: 'metadata unavailable' },
    })
    adminFromMock.mockReturnValue(createUpdateChain({ error: { message: 'profile unavailable' } }))

    createClientMock.mockResolvedValue({
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-2',
            },
            session: { access_token: 'token' },
          },
          error: null,
        }),
      },
      from: vi.fn(() => createSingleRowChain({ data: { role: 'patient' } })),
    })

    const { POST } = await import('../auth/otp/verify/route')
    const response = await POST(new Request('http://localhost/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ otp: '123456', full_name: 'Rahul Sharma' }),
      headers: {
        'Content-Type': 'application/json',
        cookie: `${OTP_PENDING_COOKIE_NAME}=${pendingOtpCookie}`,
      },
    }) as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ role: 'patient' })
    expect(adminUpdateUserByIdMock).toHaveBeenCalledWith('user-2', {
      user_metadata: { full_name: 'Rahul Sharma' },
    })
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
        shouldCreateUser: false,
        emailRedirectTo: 'https://bookphysio.in/auth/callback',
      }),
    })
  })

  it('returns a uniform success response when magic-link delivery fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://bookphysio.in')

    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp: vi.fn().mockResolvedValue({
          error: { message: 'User not found' },
        }),
      },
    })

    const { POST } = await import('../auth/magic-link/route')
    const response = await POST(new Request('http://localhost/api/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email: 'unknown@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      message: 'If an account exists, a magic link has been sent.',
    })
  })

  it('masks delivery failures for magic-link sends', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://bookphysio.in')

    createClientMock.mockResolvedValue({
      auth: {
        signInWithOtp: vi.fn().mockResolvedValue({
          error: { message: 'SMTP provider unavailable' },
        }),
      },
    })

    const { POST } = await import('../auth/magic-link/route')
    const response = await POST(new Request('http://localhost/api/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email: 'known@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    }) as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      message: 'If an account exists, a magic link has been sent.',
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
