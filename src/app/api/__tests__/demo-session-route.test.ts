import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_SESSION_COOKIE, parseDemoCookie } from '@/lib/demo/session'
import { createPreviewToken } from '@/lib/preview/token'

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

    const { POST } = await import('../auth/demo-session/route')
    const previewToken = await createPreviewToken('preview-secret')
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
})