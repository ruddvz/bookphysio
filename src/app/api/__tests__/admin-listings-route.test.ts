import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const supabaseAdminFromMock = vi.fn()
const adminUpdateUserByIdMock = vi.fn()
const apiRateLimitMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        updateUserById: (...args: unknown[]) => adminUpdateUserByIdMock(...args),
      },
    },
    from: (table: string) => supabaseAdminFromMock(table),
  },
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: {
    limit: (...args: unknown[]) => apiRateLimitMock(...args),
  },
}))

function createRequireAdminClient() {
  const roleChain = {
    select: vi.fn(() => roleChain),
    eq: vi.fn(() => roleChain),
    single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
  }

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
    },
    from: (table: string) => {
      if (table === 'users') {
        return roleChain
      }

      throw new Error(`Unexpected table ${table}`)
    },
  }
}

describe('admin listings route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    apiRateLimitMock.mockResolvedValue({ success: true })
    adminUpdateUserByIdMock.mockResolvedValue({ error: null })
    createClientMock.mockResolvedValue(createRequireAdminClient())
  })

  it('rate limits listing requests before reading provider records', async () => {
    apiRateLimitMock.mockResolvedValueOnce({ success: false })

    const { GET } = await import('../admin/listings/route')
    const response = await GET()

    expect(response.status).toBe(429)
    expect(supabaseAdminFromMock).not.toHaveBeenCalled()
  })

  it('promotes approved providers out of the pending role when a listing is approved', async () => {
    const updateEqMock = vi.fn().mockResolvedValue({ error: null })
    const usersUpdateEqMock = vi.fn().mockResolvedValue({ error: null })

    supabaseAdminFromMock.mockImplementation((table: string) => {
      if (table === 'providers') {
        return {
          update: vi.fn(() => ({
            eq: updateEqMock,
          })),
        }
      }

      if (table === 'users') {
        return {
          update: vi.fn(() => ({
            eq: usersUpdateEqMock,
          })),
        }
      }

      throw new Error(`Unexpected admin table ${table}`)
    })

    const { PATCH } = await import('../admin/listings/route')
    const response = await PATCH(new NextRequest('http://localhost/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        approved: true,
      }),
    }))

    expect(response.status).toBe(200)
    expect(usersUpdateEqMock).toHaveBeenCalledWith('id', '11111111-1111-4111-8111-111111111111')
    expect(adminUpdateUserByIdMock).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      {
        user_metadata: expect.objectContaining({
          provider_pending: false,
          role: 'provider',
        }),
      },
    )
  })
})
