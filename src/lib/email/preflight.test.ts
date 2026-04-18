import { afterEach, describe, expect, it, vi } from 'vitest'
import { assertEmailServiceConfigured } from './preflight'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('assertEmailServiceConfigured', () => {
  it('returns ok when all required vars are set', () => {
    vi.stubEnv('RESEND_API_KEY', 're_x')
    vi.stubEnv('RESEND_FROM_EMAIL', 'noreply@example.com')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
    expect(assertEmailServiceConfigured()).toEqual({ ok: true })
  })

  it('returns missing list when a key is absent', () => {
    vi.stubEnv('RESEND_API_KEY', 're_x')
    vi.stubEnv('RESEND_FROM_EMAIL', 'noreply@example.com')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    const r = assertEmailServiceConfigured()
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.missing.length).toBeGreaterThan(0)
    }
  })
})
