import { describe, expect, it } from 'vitest'
import {
  adminMayUseModerationTools,
  isActiveProviderRole,
  patientMayReadOwnAppointments,
  providerMayManageScheduleAndSlots,
  providerPendingMayOnlyUsePendingFlow,
  publicMustNotAccessSubscriptions,
  resolveSessionContext,
} from '../checklist'

describe('resolveSessionContext', () => {
  it('returns public when no user id', () => {
    expect(resolveSessionContext(null, 'admin')).toEqual({ kind: 'public' })
  })

  it('returns authenticated with role when both set', () => {
    expect(resolveSessionContext('uuid', 'patient')).toEqual({
      kind: 'authenticated',
      userId: 'uuid',
      role: 'patient',
    })
  })

  it('returns authenticated_profile_pending when role not loaded', () => {
    expect(resolveSessionContext('uuid', null)).toEqual({
      kind: 'authenticated_profile_pending',
      userId: 'uuid',
    })
  })
})

describe('role helpers', () => {
  it('treats only provider as active provider', () => {
    expect(isActiveProviderRole('provider')).toBe(true)
    expect(isActiveProviderRole('provider_pending')).toBe(false)
    expect(isActiveProviderRole('patient')).toBe(false)
  })
})

describe('checklist flags', () => {
  it('patient may read own appointments when role patient', () => {
    const ctx = resolveSessionContext('u1', 'patient')
    expect(patientMayReadOwnAppointments(ctx)).toBe(true)
  })

  it('provider may manage slots when approved', () => {
    const ctx = resolveSessionContext('u1', 'provider')
    expect(providerMayManageScheduleAndSlots(ctx)).toBe(true)
  })

  it('provider_pending does not get full schedule access', () => {
    const ctx = resolveSessionContext('u1', 'provider_pending')
    expect(providerMayManageScheduleAndSlots(ctx)).toBe(false)
    expect(providerPendingMayOnlyUsePendingFlow(ctx)).toBe(true)
  })

  it('admin moderation flag', () => {
    expect(adminMayUseModerationTools(resolveSessionContext('a', 'admin'))).toBe(true)
    expect(adminMayUseModerationTools(resolveSessionContext('p', 'patient'))).toBe(false)
  })

  it('public subscription restriction is documented as constant true', () => {
    expect(publicMustNotAccessSubscriptions()).toBe(true)
  })
})
