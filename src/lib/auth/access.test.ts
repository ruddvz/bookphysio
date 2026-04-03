import { describe, expect, it } from 'vitest'
import { canRoleAccessPath, isPatientPath } from './access'

describe('access helpers', () => {
  it('treats booking pages as patient-only routes', () => {
    expect(isPatientPath('/book/provider-123')).toBe(true)
  })

  it('allows only patient accounts onto booking pages', () => {
    expect(canRoleAccessPath('patient', '/book/provider-123')).toBe(true)
    expect(canRoleAccessPath('provider', '/book/provider-123')).toBe(false)
    expect(canRoleAccessPath('admin', '/book/provider-123')).toBe(false)
  })
})