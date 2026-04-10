import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDemoCookiePayload, DEMO_SESSION_COOKIE, DEMO_SESSION_SUPPRESSION_COOKIE, encodeDemoCookie, parseDemoCookie } from '@/lib/demo/session'
import { createPreviewToken } from '@/lib/preview/token'

describe('GET /api/auth/demo-session', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the demo session derived from the signed cookie in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'true')
    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'preview-token-secret')

    const { GET } = await import('../auth/demo-session/route')
    const cookiePayload = createDemoCookiePayload('patient')
    const demoCookie = await encodeDemoCookie(cookiePayload)
    const previewToken = await createPreviewToken('preview-token-secret')
    const request = new NextRequest('http://localhost/api/auth/demo-session', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}; preview_token=${previewToken}`,
      },
    })

    const response = await GET(request)
    const body = (await response.json()) as { session: { expires_at: number; user: { user_metadata: { role: string } } } }

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body.session.expires_at).toBe(cookiePayload.expiresAt)
    expect(body.session.user.user_metadata.role).toBe('patient')
  })

  it('returns 204 in production when a signed demo cookie lacks preview authorization', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEMO', 'false')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'false')

    const { GET } = await import('../auth/demo-session/route')
    const cookiePayload = createDemoCookiePayload('patient')
    const demoCookie = await encodeDemoCookie(cookiePayload)
    const request = new NextRequest('http://localhost/api/auth/demo-session', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
    })

    const response = await GET(request)

    expect(response.status).toBe(204)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.text()).resolves.toBe('')
  })

  it('returns 204 when demo access has been explicitly suppressed', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')

    const { GET } = await import('../auth/demo-session/route')
    const cookiePayload = createDemoCookiePayload('patient')
    const demoCookie = await encodeDemoCookie(cookiePayload)
    const request = new NextRequest('http://localhost/api/auth/demo-session', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}; ${DEMO_SESSION_SUPPRESSION_COOKIE}=1`,
      },
    })

    const response = await GET(request)

    expect(response.status).toBe(204)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.text()).resolves.toBe('')
  })

  it('returns 204 when no demo session cookie is present', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')

    const { GET } = await import('../auth/demo-session/route')
    const request = new NextRequest('http://localhost/api/auth/demo-session')

    const response = await GET(request)

    expect(response.status).toBe(204)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.text()).resolves.toBe('')
  })
})

describe('POST /api/auth/demo-session', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows preview-authenticated production requests and sets a signed demo cookie', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'true')
    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'preview-token-secret')

    const { POST } = await import('../auth/demo-session/route')
    const previewToken = await createPreviewToken('preview-token-secret')
    const request = new NextRequest('http://localhost/api/auth/demo-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `preview_token=${previewToken}`,
      },
      body: JSON.stringify({ role: 'admin' }),
    })

    const response = await POST(request)
    const body = (await response.json()) as { redirectTo: string }
    const demoCookie = response.cookies.get(DEMO_SESSION_COOKIE)

    expect(response.status).toBe(200)
    expect(body.redirectTo).toBe('/admin')
    expect(demoCookie?.value).toBeTruthy()
    await expect(parseDemoCookie(demoCookie?.value)).resolves.toMatchObject({ role: 'admin' })
  })

  it('rejects production requests without preview authorization', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEMO', 'false')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'false')

    const { POST } = await import('../auth/demo-session/route')
    const request = new NextRequest('http://localhost/api/auth/demo-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'patient' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Demo access is disabled.' })
  })

  it('rejects preview cookies in production when the public preview gate is disabled', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEMO', 'false')
    vi.stubEnv('ENABLE_PUBLIC_PREVIEW_GATE', 'false')

    const { POST } = await import('../auth/demo-session/route')
    const previewToken = await createPreviewToken('preview-secret')
    const request = new NextRequest('http://localhost/api/auth/demo-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `preview_token=${previewToken}`,
      },
      body: JSON.stringify({ role: 'patient' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Demo access is disabled.' })
  })

  it('clears the demo cookie and sets a suppression cookie on delete', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const { DELETE } = await import('../auth/demo-session/route')
    const response = await DELETE()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
    expect(response.cookies.get(DEMO_SESSION_COOKIE)?.value).toBe('')
    expect(response.cookies.get(DEMO_SESSION_SUPPRESSION_COOKIE)?.value).toBe('1')
  })
})