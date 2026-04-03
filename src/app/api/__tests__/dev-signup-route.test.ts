import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_SESSION_COOKIE, parseDemoCookie } from '@/lib/demo/session'
import { createPreviewToken } from '@/lib/preview/token'

describe('GET /api/auth/dev-signup', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('redirects preview-authenticated production requests into a demo session', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')

    const { GET } = await import('../auth/dev-signup/route')
    const previewToken = await createPreviewToken('preview-secret')
    const request = new NextRequest('http://localhost/api/auth/dev-signup?role=provider', {
      headers: {
        cookie: `preview_token=${previewToken}`,
      },
    })

    const response = await GET(request)
    const demoCookie = response.cookies.get(DEMO_SESSION_COOKIE)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/provider/dashboard')
    await expect(parseDemoCookie(demoCookie?.value)).resolves.toMatchObject({ role: 'provider' })
  })

  it('rejects production requests without preview authorization', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')

    const { GET } = await import('../auth/dev-signup/route')
    const request = new NextRequest('http://localhost/api/auth/dev-signup?role=patient')
    const response = await GET(request)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
  })
})