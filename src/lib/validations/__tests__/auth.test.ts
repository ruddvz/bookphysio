import { describe, it, expect } from 'vitest'
import { signupPatientSchema, signupProviderSchema, otpVerifySchema } from '../auth'

describe('signupPatientSchema', () => {
  it('accepts valid patient signup', () => {
    const result = signupPatientSchema.safeParse({
      full_name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876543210',
      password: 'SecurePass123',
    })
    expect(result.success).toBe(true)
  })
  it('rejects invalid Indian phone number', () => {
    const result = signupPatientSchema.safeParse({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'SecurePass123',
    })
    expect(result.success).toBe(false)
  })
  it('rejects short password', () => {
    const result = signupPatientSchema.safeParse({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('otpVerifySchema', () => {
  it('accepts valid 6-digit OTP', () => {
    const result = otpVerifySchema.safeParse({ phone: '+919876543210', otp: '123456' })
    expect(result.success).toBe(true)
  })
  it('rejects non-6-digit OTP', () => {
    const result = otpVerifySchema.safeParse({ phone: '+919876543210', otp: '12345' })
    expect(result.success).toBe(false)
  })
})
