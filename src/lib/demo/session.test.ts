import { describe, expect, it } from 'vitest'
import { resolvePostAuthRedirect, sanitizeReturnPath } from './session'

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

  it('allows the password update route for recovery flows', () => {
    expect(resolvePostAuthRedirect('provider', '/update-password')).toBe('/update-password')
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