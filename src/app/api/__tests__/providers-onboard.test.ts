import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserMock = vi.fn()
const adminUpdateUserByIdMock = vi.fn()
const usersEqMock = vi.fn()
const providersSingleMock = vi.fn()
const locationsSingleMock = vi.fn()
const locationsInsertMock = vi.fn(() => ({
  select: vi.fn(() => ({
    single: (...args: unknown[]) => locationsSingleMock(...args),
  })),
}))
const specialtiesSelectMock = vi.fn()
const providerSpecialtiesEqMock = vi.fn()
const providerSpecialtiesInsertMock = vi.fn()
const availabilitiesInsertMock = vi.fn()

const providerUpsertSelectMock = vi.fn(() => ({
  single: providersSingleMock,
}))

const providerUpsertMock = vi.fn(() => ({
  select: providerUpsertSelectMock,
}))

const usersUpdateMock = vi.fn(() => ({
  eq: usersEqMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: (...args: unknown[]) => getUserMock(...args),
    },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        updateUserById: (...args: unknown[]) => adminUpdateUserByIdMock(...args),
      },
    },
    from: (table: string) => {
      if (table === 'users') {
        return {
          update: usersUpdateMock,
        }
      }

      if (table === 'providers') {
        return {
          upsert: providerUpsertMock,
        }
      }

      if (table === 'locations') {
        return {
          insert: locationsInsertMock,
        }
      }

      if (table === 'specialties') {
        return {
          select: (...args: unknown[]) => specialtiesSelectMock(...args),
        }
      }

      if (table === 'provider_specialties') {
        return {
          delete: vi.fn(() => ({
            eq: providerSpecialtiesEqMock,
          })),
          insert: providerSpecialtiesInsertMock,
        }
      }

      if (table === 'availabilities') {
        return {
          insert: availabilitiesInsertMock,
        }
      }

      throw new Error(`Unhandled admin table mock: ${table}`)
    },
  },
}))

describe('POST /api/providers/onboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'provider-user-1' },
      },
    })
    usersEqMock.mockResolvedValue({ error: null })
    adminUpdateUserByIdMock.mockResolvedValue({ error: null })
    providersSingleMock.mockResolvedValue({
      data: { id: 'provider-user-1' },
      error: null,
    })
    locationsSingleMock.mockResolvedValue({
      data: { id: 'location-1' },
      error: null,
    })
    specialtiesSelectMock.mockResolvedValue({
      data: [{ id: 'specialty-1', name: 'Sports Physio' }],
      error: null,
    })
    providerSpecialtiesEqMock.mockResolvedValue({ error: null })
    providerSpecialtiesInsertMock.mockResolvedValue({ error: null })
    availabilitiesInsertMock.mockResolvedValue({ error: null })
  })

  it('activates provider access, search visibility, and generated availability during onboarding', async () => {
    const { POST } = await import('../providers/onboard/route')
    const response = await POST(new NextRequest('http://localhost/api/providers/onboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        step1: {
          name: 'Dr. Meera Shah',
          phone: '+919876543210',
          email: 'meera@example.com',
        },
        step2: {
          registrationType: 'IAP',
          iapNumber: 'IAP-12345',
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
            in_clinic: '900',
            home_visit: '0',
          },
          slotDuration: '30',
          availability: {
            Monday: {
              enabled: true,
              slots: [
                { start: '09:00', end: '10:00' },
                { start: '14:00', end: '15:00' },
              ],
            },
            Tuesday: { enabled: false, slots: [] },
            Wednesday: { enabled: false, slots: [] },
            Thursday: { enabled: false, slots: [] },
            Friday: { enabled: false, slots: [] },
            Saturday: { enabled: false, slots: [] },
            Sunday: { enabled: false, slots: [] },
          },
        },
      }),
    }))

    expect(response.status).toBe(200)
    expect(usersUpdateMock).toHaveBeenCalledWith({
      full_name: 'Dr. Meera Shah',
      role: 'provider',
    })
    expect(adminUpdateUserByIdMock).toHaveBeenCalledWith('provider-user-1', {
      user_metadata: expect.objectContaining({
        full_name: 'Dr. Meera Shah',
        phone: '+919876543210',
        provider_pending: false,
        role: 'provider',
      }),
    })
    expect(providerUpsertMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'provider-user-1',
      consultation_fee_inr: 900,
      specialty_ids: ['specialty-1'],
      verified: true,
      active: true,
    }))
    expect(locationsInsertMock).toHaveBeenCalledWith(expect.objectContaining({
      provider_id: 'provider-user-1',
      city: 'Mumbai',
      state: 'Maharashtra',
      visit_type: ['in_clinic'],
    }))
    expect(providerSpecialtiesInsertMock).toHaveBeenCalledWith([
      { provider_id: 'provider-user-1', specialty_id: 'specialty-1' },
    ])
    expect(availabilitiesInsertMock).toHaveBeenCalledTimes(1)
    expect(availabilitiesInsertMock.mock.calls[0]?.[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider_id: 'provider-user-1',
          location_id: 'location-1',
          slot_duration_mins: 30,
        }),
      ]),
    )
  })
})
