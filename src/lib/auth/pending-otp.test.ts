import { afterEach, describe, expect, it } from 'vitest'

import { clearPendingOtp, readPendingOtp, savePendingOtp } from './pending-otp'

afterEach(() => {
  clearPendingOtp()
})

describe('pending OTP storage', () => {
  it('round-trips pending OTP state through session storage', () => {
    expect(
      savePendingOtp({
        flow: 'signup',
        flowId: 'flow-1',
        returnTo: '/patient/dashboard',
      })
    ).toBe(true)

    expect(readPendingOtp()).toEqual({
      flow: 'signup',
      flowId: 'flow-1',
      returnTo: '/patient/dashboard',
    })

    expect(window.sessionStorage.getItem('bp-pending-otp')).not.toContain('9876543210')
  })

  it('returns null for malformed stored state', () => {
    window.sessionStorage.setItem('bp-pending-otp', JSON.stringify({ flow: 'provider_signup' }))

    expect(readPendingOtp()).toBeNull()
  })

  it('clears pending OTP state', () => {
    savePendingOtp({ flow: 'login', flowId: 'flow-1' })

    clearPendingOtp()

    expect(readPendingOtp()).toBeNull()
  })
})