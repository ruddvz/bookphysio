import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const supabaseAdminFromMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (table: string) => supabaseAdminFromMock(table),
  },
}))

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns no-store admin metrics when all queries succeed', async () => {
    let usersFromCalls = 0
    let providersFromCalls = 0

    const roleChain = {
      select: vi.fn(() => roleChain),
      eq: vi.fn(() => roleChain),
      single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    }

    const patientCountChain = {
      select: vi.fn(() => patientCountChain),
      eq: vi.fn().mockResolvedValue({ count: 11, error: null }),
    }

    const verifiedProvidersChain = {
      select: vi.fn(() => verifiedProvidersChain),
      eq: vi.fn().mockResolvedValue({ count: 7, error: null }),
    }

    const pendingProvidersChain = {
      select: vi.fn(() => pendingProvidersChain),
      eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
    }

    const appointmentsChain = {
      select: vi.fn(() => appointmentsChain),
      eq: vi.fn(() => appointmentsChain),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { gmv: 2500 },
        error: null,
      }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          usersFromCalls += 1
          return usersFromCalls === 1 ? roleChain : patientCountChain
        }

        if (table === 'providers') {
          providersFromCalls += 1
          return providersFromCalls === 1 ? verifiedProvidersChain : pendingProvidersChain
        }

        throw new Error(`Unexpected table ${table}`)
      },
    })

    supabaseAdminFromMock.mockImplementation((table: string) => {
      if (table === 'appointments') {
        return appointmentsChain
      }

      throw new Error(`Unexpected admin table ${table}`)
    })

    const { GET } = await import('../admin/stats/route')
    const response = await GET(new NextRequest('http://localhost/api/admin/stats'))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      activeProviders: 7,
      pendingApprovals: 2,
      totalPatients: 11,
      gmvMtd: 2500,
    })
  })

  it('returns 500 when admin role verification fails', async () => {
    const roleChain = {
      select: vi.fn(() => roleChain),
      eq: vi.fn(() => roleChain),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'users offline' } }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          return roleChain
        }

        throw new Error(`Unexpected table ${table}`)
      },
    })

    const { GET } = await import('../admin/stats/route')
    const response = await GET(new NextRequest('http://localhost/api/admin/stats'))

    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Failed to verify admin access' })
  })

  it('returns 500 when any admin metric query fails', async () => {
    let usersFromCalls = 0
    let providersFromCalls = 0

    const roleChain = {
      select: vi.fn(() => roleChain),
      eq: vi.fn(() => roleChain),
      single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    }

    const patientCountChain = {
      select: vi.fn(() => patientCountChain),
      eq: vi.fn().mockResolvedValue({ count: 11, error: null }),
    }

    const verifiedProvidersChain = {
      select: vi.fn(() => verifiedProvidersChain),
      eq: vi.fn().mockResolvedValue({ count: 7, error: null }),
    }

    const pendingProvidersChain = {
      select: vi.fn(() => pendingProvidersChain),
      eq: vi.fn().mockResolvedValue({ count: null, error: { message: 'providers offline' } }),
    }

    const appointmentsChain = {
      select: vi.fn(() => appointmentsChain),
      eq: vi.fn(() => appointmentsChain),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { gmv: 1000 },
        error: null,
      }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          usersFromCalls += 1
          return usersFromCalls === 1 ? roleChain : patientCountChain
        }

        if (table === 'providers') {
          providersFromCalls += 1
          return providersFromCalls === 1 ? verifiedProvidersChain : pendingProvidersChain
        }

        throw new Error(`Unexpected table ${table}`)
      },
    })

    supabaseAdminFromMock.mockImplementation((table: string) => {
      if (table === 'appointments') {
        return appointmentsChain
      }

      throw new Error(`Unexpected admin table ${table}`)
    })

    const { GET } = await import('../admin/stats/route')
    const response = await GET(new NextRequest('http://localhost/api/admin/stats'))

    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch admin stats' })
  })
})