import { afterEach, describe, expect, it } from 'vitest'

import { clearPendingOtp, readPendingOtp, savePendingOtp } from './pending-otp'

afterEach(() => {
  clearPendingOtp()
})

describe('pending OTP storage', () => {
  it('round-trips pending OTP state through session storage', () => {
    expect(
      savePendingOtp({
        phone: '919876543210',
        flow: 'signup',
        fullName: 'Rahul Sharma',
        returnTo: '/patient/dashboard',
      })
    ).toBe(true)

    expect(readPendingOtp()).toEqual({
      phone: '919876543210',
      flow: 'signup',
      fullName: 'Rahul Sharma',
      returnTo: '/patient/dashboard',
    })
  })

  it('returns null for malformed stored state', () => {
    window.sessionStorage.setItem('bp-pending-otp', JSON.stringify({ flow: 'signup' }))

    expect(readPendingOtp()).toBeNull()
  })

  it('clears pending OTP state', () => {
    savePendingOtp({ phone: '919876543210', flow: 'login' })

    clearPendingOtp()

    expect(readPendingOtp()).toBeNull()
  })
})