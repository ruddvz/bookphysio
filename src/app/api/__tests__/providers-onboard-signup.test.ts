import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signUpMock = vi.fn()
const otpLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()
const usersUpdateEqMock = vi.fn()
const usersUpdateMock = vi.fn(() => ({
  eq: usersUpdateEqMock,
}))
const specialtiesSelectMock = vi.fn()
const providerUpsertSingleMock = vi.fn()
const providerUpsertSelectMock = vi.fn(() => ({
  single: providerUpsertSingleMock,
}))
const providerUpsertMock = vi.fn(() => ({
  select: providerUpsertSelectMock,
}))
const providerDeleteEqMock = vi.fn()
const providerDeleteMock = vi.fn(() => ({
  eq: providerDeleteEqMock,
}))
const locationsInsertSingleMock = vi.fn()
const locationsInsertSelectMock = vi.fn(() => ({
  single: locationsInsertSingleMock,
}))
const locationsInsertMock = vi.fn(() => ({
  select: locationsInsertSelectMock,
}))
const locationsDeleteEqMock = vi.fn()
const locationsDeleteMock = vi.fn(() => ({
  eq: locationsDeleteEqMock,
}))
const providerSpecialtiesDeleteEqMock = vi.fn()
const providerSpecialtiesDeleteMock = vi.fn(() => ({
  eq: providerSpecialtiesDeleteEqMock,
}))
const providerSpecialtiesInsertMock = vi.fn()
const availabilitiesDeleteLteMock = vi.fn()
const availabilitiesDeleteGteMock = vi.fn(() => ({
  lte: availabilitiesDeleteLteMock,
}))
const availabilitiesDeleteEqBookedMock = vi.fn(() => ({
  gte: availabilitiesDeleteGteMock,
}))
const availabilitiesDeleteEqBlockedMock = vi.fn(() => ({
  eq: availabilitiesDeleteEqBookedMock,
}))
const availabilitiesDeleteEqProviderMock = vi.fn(() => ({
  eq: availabilitiesDeleteEqBlockedMock,
}))
const availabilitiesDeleteMock = vi.fn(() => ({
  eq: availabilitiesDeleteEqProviderMock,
}))
const availabilitiesInsertMock = vi.fn()
const deleteUserMock = vi.fn()

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

vi.mock('@/lib/upstash', () => ({
  otpRatelimit: {
    limit: (...args: unknown[]) => otpLimitMock(...args),
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: (...args: unknown[]) => signUpMock(...args),
    },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        deleteUser: (...args: unknown[]) => deleteUserMock(...args),
      },
    },
    from: (table: string) => {
      if (table === 'users') {
        return {
          update: usersUpdateMock,
        }
      }

      if (table === 'specialties') {
        return {
          select: (...args: unknown[]) => specialtiesSelectMock(...args),
        }
      }

      if (table === 'providers') {
        return {
          upsert: providerUpsertMock,
          delete: providerDeleteMock,
        }
      }

      if (table === 'locations') {
        return {
          insert: locationsInsertMock,
          delete: locationsDeleteMock,
        }
      }

      if (table === 'provider_specialties') {
        return {
          delete: providerSpecialtiesDeleteMock,
          insert: providerSpecialtiesInsertMock,
        }
      }

      if (table === 'availabilities') {
        return {
          delete: availabilitiesDeleteMock,
          insert: availabilitiesInsertMock,
        }
      }

      throw new Error(`Unhandled table mock: ${table}`)
    },
  },
}))

function buildRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/providers/onboard-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

function buildValidPayload() {
  return {
    email: 'meera@example.com',
    password: 'SecurePass123',
    step1: {
      name: 'Dr. Meera Shah',
      phone: '+919876543210',
      email: 'meera@example.com',
    },
    step2: {
      registrationType: 'IAP',
      iapNumber: 'IAP-12345',
      stateRegistrationNumber: '',
      stateName: '',
      degree: 'MPT',
      experienceYears: '8',
      specialties: ['Sports Physio'],
    },
    step3: {
      clinicName: 'Physio Plus',
      address: '12 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      visitTypes: ['in_clinic'],
    },
    step4: {
      fees: {
        in_clinic: 900,
        home_visit: 0,
      },
      slotDuration: 30,
      availability: {
        Monday: {
          enabled: true,
          slots: [{ start: '09:00', end: '10:00' }],
        },
        Tuesday: { enabled: false, slots: [] },
        Wednesday: { enabled: false, slots: [] },
        Thursday: { enabled: false, slots: [] },
        Friday: { enabled: false, slots: [] },
        Saturday: { enabled: false, slots: [] },
        Sunday: { enabled: false, slots: [] },
      },
    },
  }
}

describe('POST /api/providers/onboard-signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    otpLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.5')
    signUpMock.mockResolvedValue({
      data: {
        user: {
          id: 'provider-1',
          identities: [{ id: 'identity-1' }],
        },
      },
      error: null,
    })
    usersUpdateEqMock.mockResolvedValue({ error: null })
    specialtiesSelectMock.mockResolvedValue({
      data: [{ id: 'specialty-1', name: 'Sports Physio' }],
      error: null,
    })
    providerUpsertSingleMock.mockResolvedValue({ data: { id: 'provider-1' }, error: null })
    locationsInsertSingleMock.mockResolvedValue({ data: { id: 'location-1' }, error: null })
    providerSpecialtiesDeleteEqMock.mockResolvedValue({ error: null })
    providerSpecialtiesInsertMock.mockResolvedValue({ error: null })
    availabilitiesDeleteLteMock.mockResolvedValue({ error: null })
    availabilitiesInsertMock.mockResolvedValue({ error: null })
    providerDeleteEqMock.mockResolvedValue({ error: null })
    locationsDeleteEqMock.mockResolvedValue({ error: null })
    deleteUserMock.mockResolvedValue({ error: null })
  })

  it('requires state registration details for STATE registrations', async () => {
    const { POST } = await import('../providers/onboard-signup/route')
    const payload = buildValidPayload()
    payload.step2 = {
      ...payload.step2,
      registrationType: 'STATE',
      iapNumber: '',
      stateName: '',
      stateRegistrationNumber: '',
    }

    const response = await POST(buildRequest(payload))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Some fields are invalid. Please review and try again.')
    expect(signUpMock).not.toHaveBeenCalled()
  })

  it('rejects invalid availability before creating any auth or provider records', async () => {
    const { POST } = await import('../providers/onboard-signup/route')
    const payload = buildValidPayload()
    payload.step4.availability.Monday.slots = [
      { start: '09:00', end: '10:00' },
      { start: '09:30', end: '10:30' },
    ]

    const response = await POST(buildRequest(payload))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Some availability fields are invalid. Please review and try again.')
    expect(signUpMock).not.toHaveBeenCalled()
    expect(providerUpsertMock).not.toHaveBeenCalled()
  })

  it('keeps new providers inactive until they are verified', async () => {
    const { POST } = await import('../providers/onboard-signup/route')
    const response = await POST(buildRequest(buildValidPayload()))

    expect(response.status).toBe(201)
    expect(providerUpsertMock).toHaveBeenCalledWith(expect.objectContaining({
      verified: false,
      active: false,
    }))
  })
})
