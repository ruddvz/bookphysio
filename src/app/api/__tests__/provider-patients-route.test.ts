import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireProviderAccessMock = vi.fn()

vi.mock('@/app/api/provider/_lib/access', () => ({
  requireProviderAccess: (...args: unknown[]) => requireProviderAccessMock(...args),
}))

describe('provider patients route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 500 when visit aggregation fails for the dashboard roster', async () => {
    const profilesChain = {
      select: vi.fn(() => profilesChain),
      eq: vi.fn(() => profilesChain),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'profile-1',
            patient_name: 'Aarav Kapoor',
            patient_phone: '+919999999999',
            patient_age: 29,
            chief_complaint: 'Back pain',
            updated_at: '2026-04-05T10:00:00.000Z',
          },
        ],
        error: null,
      }),
    }

    const visitsChain = {
      select: vi.fn(() => visitsChain),
      in: vi.fn(() => visitsChain),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'visits offline' },
      }),
    }

    requireProviderAccessMock.mockResolvedValue({
      isDemo: false,
      providerId: 'provider-1',
      supabase: {
        from: (table: string) => {
          if (table === 'patient_clinical_profiles') {
            return profilesChain
          }

          if (table === 'patient_visits') {
            return visitsChain
          }

          throw new Error(`Unexpected table ${table}`)
        },
      },
    })

    const { GET } = await import('../provider/patients/route')
    const response = await GET(new NextRequest('http://localhost/api/provider/patients?view=dashboard'))

    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch patients' })
  })

  it('hides raw database errors when patient profile creation fails', async () => {
    const insertChain = {
      insert: vi.fn(() => insertChain),
      select: vi.fn(() => insertChain),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'duplicate key value violates unique_patient_phone' },
      }),
    }

    requireProviderAccessMock.mockResolvedValue({
      isDemo: false,
      providerId: 'provider-1',
      supabase: {
        from: (table: string) => {
          if (table === 'patient_clinical_profiles') {
            return insertChain
          }

          throw new Error(`Unexpected table ${table}`)
        },
      },
    })

    const { POST } = await import('../provider/patients/route')
    const response = await POST(new NextRequest('http://localhost/api/provider/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_name: 'Zoya Khan' }),
    }))
    const body = await response.json() as { error: string }

    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body).toEqual({ error: 'Failed to create patient profile' })
    expect(body.error).not.toContain('duplicate key')
  })
})