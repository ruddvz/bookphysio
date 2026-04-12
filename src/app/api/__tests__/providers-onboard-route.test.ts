import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const adminFromMock = vi.fn()
const updateUserByIdMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => adminFromMock(...args),
    auth: {
      admin: {
        updateUserById: (...args: unknown[]) => updateUserByIdMock(...args),
      },
    },
  },
}))

describe('POST /api/providers/onboard', () => {
  const providerId = '00000000-0000-4000-8000-000000000010'
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: providerId,
            },
          },
        }),
      },
    })

    updateUserByIdMock.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('restores previous specialty links when insertion fails after deleting old links', async () => {
    const userUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
    const providerMaybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const providerUpsertMock = vi.fn().mockResolvedValue({ error: null })
    const providerDeleteEqMock = vi.fn().mockResolvedValue({ error: null })
    const locationInsertSelectMock = vi.fn().mockResolvedValue({
      data: [{ id: 'location-1' }],
      error: null,
    })
    const locationDeleteInMock = vi.fn().mockResolvedValue({ error: null })
    const specialtiesSelectMock = vi.fn().mockResolvedValue({
      data: [
        { id: 'specialty-selected', name: 'Sports' },
        { id: 'specialty-other', name: 'Neuro' },
      ],
      error: null,
    })
    const providerSpecialtiesSelectEqMock = vi.fn().mockResolvedValue({
      data: [{ specialty_id: 'specialty-previous' }],
      error: null,
    })
    const providerSpecialtiesDeleteInMock = vi.fn().mockResolvedValue({ error: null })
    const providerSpecialtiesInsertMock = vi.fn().mockResolvedValue({
      error: { message: 'insert failed' },
    })
    const providerSpecialtiesUpsertMock = vi.fn().mockResolvedValue({ error: null })

    const providerSelectChain = {
      eq: vi.fn(() => providerSelectChain),
      maybeSingle: providerMaybeSingleMock,
    }

    const providerSpecialtiesDeleteChain = {
      eq: vi.fn(() => providerSpecialtiesDeleteChain),
      in: providerSpecialtiesDeleteInMock,
      error: null,
    }

    adminFromMock.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          update: vi.fn(() => ({
            eq: userUpdateEqMock,
          })),
        }
      }

      if (table === 'providers') {
        return {
          select: vi.fn(() => providerSelectChain),
          upsert: providerUpsertMock,
          delete: vi.fn(() => ({
            eq: providerDeleteEqMock,
          })),
        }
      }

      if (table === 'locations') {
        return {
          insert: vi.fn(() => ({
            select: locationInsertSelectMock,
          })),
          delete: vi.fn(() => ({
            in: locationDeleteInMock,
          })),
        }
      }

      if (table === 'specialties') {
        return {
          select: specialtiesSelectMock,
        }
      }

      if (table === 'provider_specialties') {
        return {
          select: vi.fn(() => ({
            eq: providerSpecialtiesSelectEqMock,
          })),
          delete: vi.fn(() => providerSpecialtiesDeleteChain),
          insert: providerSpecialtiesInsertMock,
          upsert: providerSpecialtiesUpsertMock,
        }
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })

    const { POST } = await import('../providers/onboard/route')
    const response = await POST(new NextRequest('http://localhost/api/providers/onboard', {
      method: 'POST',
      body: JSON.stringify({
        step1: {
          name: 'Dr Demo',
          phone: '+919876543210',
          email: 'demo@example.com',
        },
        step2: {
          registrationType: 'IAP',
          iapNumber: 'IAP-123',
          stateRegistrationNumber: '',
          stateName: '',
          degree: 'BPT',
          experienceYears: '5',
          specialties: ['Sports'],
        },
        step3: {
          clinicName: 'Demo Clinic',
          address: '123 Rehab Street',
          city: 'Mumbai',
          pincode: '400001',
          visitTypes: ['in_clinic'],
        },
        step4: {
          fees: {
            in_clinic: '1200',
          },
          slotDuration: '30',
          availability: {},
        },
      }),
    }))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: 'Onboarding failed. Please try again or contact support.',
    })

    expect(providerSpecialtiesInsertMock).toHaveBeenCalledWith([
      { provider_id: providerId, specialty_id: 'specialty-selected' },
    ])
    expect(providerSpecialtiesDeleteInMock).not.toHaveBeenCalled()
    expect(providerSpecialtiesUpsertMock).toHaveBeenCalledWith(
      [{ provider_id: providerId, specialty_id: 'specialty-previous' }],
      { onConflict: 'provider_id,specialty_id' },
    )
    expect(locationDeleteInMock).toHaveBeenCalledWith('id', ['location-1'])
    expect(providerDeleteEqMock).toHaveBeenCalledWith('id', providerId)
  })
})
