import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const getUserMock = vi.fn()
const usersSelectSingleMock = vi.fn()
const providersMaybeSingleMock = vi.fn()
const usersUpdateEqMock = vi.fn()
const providersUpdateEqMock = vi.fn()

const usersSelectChain = {
  eq: vi.fn(() => usersSelectChain),
  single: (...args: unknown[]) => usersSelectSingleMock(...args),
}

const usersUpdateChain = {
  eq: (...args: unknown[]) => usersUpdateEqMock(...args),
}

const providersSelectChain = {
  eq: vi.fn(() => providersSelectChain),
  maybeSingle: (...args: unknown[]) => providersMaybeSingleMock(...args),
}

const providersUpdateChain = {
  eq: (...args: unknown[]) => providersUpdateEqMock(...args),
}

const usersTable = {
  select: vi.fn(() => usersSelectChain),
  update: vi.fn(() => usersUpdateChain),
}

const providersTable = {
  select: vi.fn(() => providersSelectChain),
  update: vi.fn(() => providersUpdateChain),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

describe('/api/profile route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'provider-1',
          email: 'provider@example.com',
        },
      },
      error: null,
    })

    usersSelectSingleMock.mockResolvedValue({
      data: {
        id: 'provider-1',
        full_name: 'Asha Rao',
        phone: '+919999999999',
        role: 'provider',
        avatar_url: 'https://project.supabase.co/storage/v1/object/public/avatars/provider-1/avatar.jpg',
        created_at: '2026-04-01T00:00:00.000Z',
      },
      error: null,
    })

    providersMaybeSingleMock.mockResolvedValue({
      data: {
        title: 'PT',
        bio: 'Manual therapy specialist',
        experience_years: 8,
        consultation_fee_inr: 900,
        iap_registration_no: 'IAP-12345',
      },
      error: null,
    })

    usersUpdateEqMock.mockResolvedValue({ error: null })
    providersUpdateEqMock.mockResolvedValue({ error: null })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: (...args: unknown[]) => getUserMock(...args),
      },
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return usersTable
        }

        return providersTable
      }),
    })
  })

  it('returns merged provider profile fields for authenticated provider users', async () => {
    const { GET } = await import('../profile/route')
    const response = await GET()

    expect(response.status).toBe(200)

    const body = await response.json() as {
      role: string
      email: string | null
      title: string | null
      bio: string | null
      experience_years: number | null
      consultation_fee_inr: number | null
      iap_registration_no: string | null
    }

    expect(body).toMatchObject({
      role: 'provider',
      email: 'provider@example.com',
      title: 'PT',
      bio: 'Manual therapy specialist',
      experience_years: 8,
      consultation_fee_inr: 900,
      iap_registration_no: 'IAP-12345',
    })
    expect(usersSelectChain.eq).toHaveBeenCalledWith('id', 'provider-1')
    expect(providersSelectChain.eq).toHaveBeenCalledWith('id', 'provider-1')
  })

  it('keeps patient profile responses compatible without provider lookups', async () => {
    usersSelectSingleMock.mockResolvedValueOnce({
      data: {
        id: 'patient-1',
        full_name: 'Priya Sharma',
        phone: '+919888888888',
        role: 'patient',
        avatar_url: null,
        created_at: '2026-04-01T00:00:00.000Z',
      },
      error: null,
    })

    const { GET } = await import('../profile/route')
    const response = await GET()
    const body = await response.json() as {
      role: string
      iap_registration_no: string | null
      bio?: string | null
    }

    expect(response.status).toBe(200)
    expect(body.role).toBe('patient')
    expect(body.iap_registration_no).toBeNull()
    expect(body.bio ?? null).toBeNull()
    expect(providersTable.select).not.toHaveBeenCalled()
  })

  it('splits profile patch fields between users and providers tables', async () => {
    const { PATCH } = await import('../profile/route')
    const response = await PATCH(new Request('http://localhost/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: '  Dr. Asha Rao  ',
        avatar_url: 'https://project.supabase.co/storage/v1/object/public/avatars/provider-1/new-avatar.jpg',
        bio: 'Updated rehab specialist',
        experience_years: 9,
        consultation_fee_inr: 1200,
        role: 'admin',
      }),
    }) as unknown as import('next/server').NextRequest)

    expect(response.status).toBe(200)
    expect(usersTable.update).toHaveBeenCalledWith({
      full_name: 'Dr. Asha Rao',
      avatar_url: 'https://project.supabase.co/storage/v1/object/public/avatars/provider-1/new-avatar.jpg',
    })
    expect(providersTable.update).toHaveBeenCalledWith({
      bio: 'Updated rehab specialist',
      experience_years: 9,
      consultation_fee_inr: 1200,
    })
  })

  it('returns 400 for malformed JSON PATCH bodies', async () => {
    const { PATCH } = await import('../profile/route')
    const response = await PATCH(new Request('http://localhost/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{"full_name":',
    }) as unknown as import('next/server').NextRequest)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid JSON body' })
  })
})