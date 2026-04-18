import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDemoCookiePayload, encodeDemoCookie, parseDemoCookie, resolvePostAuthRedirect, sanitizeReturnPath } from './session'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('sanitizeReturnPath', () => {
  it('preserves internal paths with search params', () => {
    expect(sanitizeReturnPath('/provider/messages?tab=unread')).toBe('/provider/messages?tab=unread')
  })

  it('rejects external-looking paths', () => {
    expect(sanitizeReturnPath('//evil.example.com')).toBeNull()
  })

  it('rejects normalized protocol-relative paths', () => {
    expect(sanitizeReturnPath('/..//evil.example.com')).toBeNull()
  })
})

describe('resolvePostAuthRedirect', () => {
  it('returns a compatible deep link for the same role', () => {
    expect(resolvePostAuthRedirect('provider', '/provider/messages?tab=unread')).toBe('/provider/messages?tab=unread')
  })

  it('allows the forgot-password route for recovery flows', () => {
    expect(resolvePostAuthRedirect('provider', '/forgot-password')).toBe('/forgot-password')
  })

  it('falls back to the role default for incompatible paths', () => {
    expect(resolvePostAuthRedirect('provider', '/patient/messages')).toBe('/provider/dashboard')
  })

  it('falls back to the role default for malformed redirect targets', () => {
    expect(resolvePostAuthRedirect('patient', '/..//evil.example.com')).toBe('/patient/dashboard')
  })

  it('defaults to the patient dashboard when the role is unknown', () => {
    expect(resolvePostAuthRedirect(undefined, '/admin')).toBe('/patient/dashboard')
  })
})

describe('demo cookie signing', () => {
  it('parses signed demo cookies in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')

    const encodedCookie = await encodeDemoCookie(createDemoCookiePayload('provider'))
    const parsedCookie = await parseDemoCookie(encodedCookie)

    expect(parsedCookie?.role).toBe('provider')
  })

  it('rejects unsigned demo cookies in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')

    const unsignedCookie = Buffer.from(JSON.stringify(createDemoCookiePayload('patient')), 'utf8').toString('base64url')

    await expect(parseDemoCookie(unsignedCookie)).resolves.toBeNull()
  })
})