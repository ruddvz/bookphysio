import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const roleSingleMock = vi.fn()

const usersQuery = {
  select: vi.fn(() => usersQuery),
  eq: vi.fn(() => usersQuery),
  single: (...args: unknown[]) => roleSingleMock(...args),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'patient-user-1', email: 'patient@example.com' },
        },
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return usersQuery
      }

      throw new Error(`Unexpected table access during guard test: ${table}`)
    }),
  })),
}))

describe('provider access guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    roleSingleMock.mockResolvedValue({
      data: { role: 'patient' },
      error: null,
    })
  })

  it('blocks non-provider access to the patient roster route', async () => {
    const { GET } = await import('../provider/patients/route')
    const response = await GET(new NextRequest('http://localhost/api/provider/patients'))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
  })

  it('returns 500 when provider role verification fails', async () => {
    roleSingleMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'users offline' },
    })

    const { GET } = await import('../provider/patients/route')
    const response = await GET(new NextRequest('http://localhost/api/provider/patients'))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to verify provider access' })
  })

  it('blocks non-provider access to schedule creation', async () => {
    const { POST } = await import('../provider/schedule/route')
    const response = await POST(new NextRequest('http://localhost/api/provider/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_id: '33333333-3333-4333-8333-000000000001',
        visit_date: '2026-04-09',
        visit_time: '13:00',
        fee_inr: 1100,
      }),
    }))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
  })

  it('blocks non-provider access to SOAP updates', async () => {
    const { PUT } = await import('../provider/visits/[visitId]/soap/route')
    const response = await PUT(new NextRequest('http://localhost/api/provider/visits/visit-1/soap', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subjective: 'Pain is lower today.',
      }),
    }), {
      params: Promise.resolve({ visitId: 'visit-1' }),
    })

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
  })
})