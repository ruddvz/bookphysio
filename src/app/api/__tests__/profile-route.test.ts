import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const getUserMock = vi.fn()
const usersSingleMock = vi.fn()
const providerMaybeSingleMock = vi.fn()

const usersChain = {
  update: vi.fn(() => usersChain),
  select: vi.fn(() => usersChain),
  eq: vi.fn(() => usersChain),
  single: (...args: unknown[]) => usersSingleMock(...args),
}

const providersChain = {
  select: vi.fn(() => providersChain),
  eq: vi.fn(() => providersChain),
  maybeSingle: (...args: unknown[]) => providerMaybeSingleMock(...args),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

describe('GET /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'provider-1',
          email: 'provider@example.com',
        },
      },
    })

    usersSingleMock.mockResolvedValue({
      data: {
        id: 'provider-1',
        full_name: 'Dr. Demo Provider',
        phone: '+919999999999',
        role: 'provider',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2026-04-01T00:00:00.000Z',
      },
      error: null,
    })

    providerMaybeSingleMock.mockResolvedValue({
      data: {
        icp_registration_no: 'ICP-12345',
      },
      error: null,
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: (...args: unknown[]) => getUserMock(...args),
      },
      from: vi.fn((table: string) => table === 'users' ? usersChain : providersChain),
    })
  })

  it('includes the provider ICP registration number for authenticated provider profiles', async () => {
    const { GET } = await import('../profile/route')
    const response = await GET()

    expect(response.status).toBe(200)

    const body = await response.json() as {
      email: string | null
      icp_registration_no: string | null
      role: string
    }

    expect(body.role).toBe('provider')
    expect(body.email).toBe('provider@example.com')
    expect(body.icp_registration_no).toBe('ICP-12345')
    expect(usersChain.eq).toHaveBeenCalledWith('id', 'provider-1')
    expect(providersChain.eq).toHaveBeenCalledWith('id', 'provider-1')
  })

  it('trims whitespace from profile names before persisting them', async () => {
    usersSingleMock.mockResolvedValueOnce({
      data: {
        id: 'provider-1',
        full_name: 'Dr. Trimmed',
        phone: '+919999999999',
        role: 'provider',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2026-04-01T00:00:00.000Z',
      },
      error: null,
    })

    const { PATCH } = await import('../profile/route')
    const response = await PATCH(new Request('http://localhost/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: '   Dr. Trimmed   ' }),
    }) as unknown as import('next/server').NextRequest)

    expect(response.status).toBe(200)
    expect(usersChain.update).toHaveBeenCalledWith({ full_name: 'Dr. Trimmed' })
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