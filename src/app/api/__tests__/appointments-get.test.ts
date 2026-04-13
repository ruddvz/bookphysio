import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildAppointmentNotes } from '@/lib/booking/policy'

const createClientMock = vi.fn()
const supabaseAdminFromMock = vi.fn()
const getDemoSessionFromCookiesMock = vi.fn()
const hasPublicSupabaseEnvMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (table: string) => supabaseAdminFromMock(table),
  },
}))

vi.mock('@/lib/demo/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/demo/session')>('@/lib/demo/session')
  return {
    ...actual,
    getDemoSessionFromCookies: (...args: unknown[]) => getDemoSessionFromCookiesMock(...args),
  }
})

vi.mock('@/lib/supabase/env', () => ({
  hasPublicSupabaseEnv: (...args: unknown[]) => hasPublicSupabaseEnvMock(...args),
}))

function createAdminReadChain(result: unknown[] | Record<string, unknown>) {
  const rows = Array.isArray(result) ? result : [result]
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn().mockResolvedValue({
      data: rows,
      error: null,
    }),
    order: vi.fn().mockResolvedValue({
      data: rows,
      error: null,
    }),
    single: vi.fn().mockResolvedValue({
      data: Array.isArray(result) ? (result[0] ?? null) : result,
      error: null,
    }),
  }

  return chain
}

function mockAdminTableRows(rowsByTable: Record<string, unknown[] | Record<string, unknown>>) {
  supabaseAdminFromMock.mockImplementation((table: string) => createAdminReadChain(rowsByTable[table] ?? []))
}

describe('GET /api/appointments', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getDemoSessionFromCookiesMock.mockResolvedValue(null)
    hasPublicSupabaseEnvMock.mockReturnValue(true)
  })

  it('returns 401 instead of throwing when Supabase credentials are unavailable', async () => {
    hasPublicSupabaseEnvMock.mockReturnValue(false)

    const { GET } = await import('../appointments/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments'))

    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it('returns a trimmed patient dashboard payload when dashboard view is requested', async () => {
    const userChain = {
      select: vi.fn(() => userChain),
      eq: vi.fn(() => userChain),
      single: vi.fn().mockResolvedValue({ data: { role: 'patient' }, error: null }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          return userChain
        }

        throw new Error(`Unhandled table: ${table}`)
      },
    })

    mockAdminTableRows({
      appointments: [{
        id: 'appt-dashboard-1',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        visit_type: 'home_visit',
        status: 'confirmed',
        fee_inr: 1560,
        availabilities: [{ starts_at: '2026-04-05T10:00:00.000Z' }],
        locations: [{ city: 'Bengaluru' }],
      }],
      providers: [{
        id: 'provider-1',
        specialty_ids: ['sp-1'],
        gstin: 'should-not-leak',
        users: { full_name: 'Dr. Priya Sharma', avatar_url: null },
      }],
      specialties: [{ id: 'sp-1', name: 'Sports Physio' }],
    })

    const { GET } = await import('../appointments/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments?view=dashboard'))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      appointments: [
        {
          id: 'appt-dashboard-1',
          status: 'confirmed',
          visit_type: 'home_visit',
          fee_inr: 1560,
          availabilities: { starts_at: '2026-04-05T10:00:00.000Z' },
          providers: {
            id: 'provider-1',
            users: { full_name: 'Dr. Priya Sharma', avatar_url: null },
            specialties: [{ name: 'Sports Physio' }],
          },
          locations: { city: 'Bengaluru' },
        },
      ],
    })
  })

  it('returns 500 when role verification fails before loading appointments', async () => {
    const userChain = {
      select: vi.fn(() => userChain),
      eq: vi.fn(() => userChain),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'users offline' } }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          return userChain
        }

        throw new Error(`Unhandled table: ${table}`)
      },
    })

    const { GET } = await import('../appointments/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments?view=dashboard'))

    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Failed to verify appointments access' })
  })

  it('sanitizes list responses so booking metadata is not returned in the notes field', async () => {
    const userChain = {
      select: vi.fn(() => userChain),
      eq: vi.fn(() => userChain),
      single: vi.fn().mockResolvedValue({ data: { role: 'patient' }, error: null }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          return userChain
        }

        throw new Error(`Unhandled table: ${table}`)
      },
    })

    mockAdminTableRows({
      appointments: [{
        id: 'appt-1',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        visit_type: 'home_visit',
        status: 'confirmed',
        fee_inr: 1560,
        notes: buildAppointmentNotes({
          visitType: 'home_visit',
          patientAddress: '12 Palm Street, Bengaluru',
          notes: 'Bring previous MRI report',
        }),
      }],
      providers: [{
        id: 'provider-1',
        specialty_ids: ['sp-1'],
        gstin: 'should-not-leak',
        users: { full_name: 'Dr. Priya Sharma', avatar_url: null },
      }],
      specialties: [{ id: 'sp-1', name: 'Sports Physio' }],
    })

    const { GET } = await import('../appointments/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments'))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()

    expect(body).toMatchObject({
      appointments: [
        {
          id: 'appt-1',
          notes: null,
          provider_notes: null,
          providers: {
            users: { full_name: 'Dr. Priya Sharma', avatar_url: null },
            specialties: [{ name: 'Sports Physio' }],
          },
        },
      ],
    })
    expect(body.appointments[0].providers).not.toHaveProperty('gstin')
  })

  it('returns provider appointments with patient summaries without relying on provider-scoped users joins', async () => {
    const userChain = {
      select: vi.fn(() => userChain),
      eq: vi.fn(() => userChain),
      single: vi.fn().mockResolvedValue({ data: { role: 'provider' }, error: null }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: (table: string) => {
        if (table === 'users') {
          return userChain
        }

        throw new Error(`Unhandled table: ${table}`)
      },
    })

    mockAdminTableRows({
      appointments: [{
        id: 'appt-2',
        patient_id: 'patient-2',
        provider_id: 'provider-1',
        visit_type: 'in_clinic',
        status: 'confirmed',
        fee_inr: 1200,
        notes: 'Legacy note',
        payments: [
          { status: 'refunded', amount_inr: 1416, gst_amount_inr: 216, created_at: '2026-03-10T09:00:00.000Z' },
          { status: 'paid', amount_inr: 1416, gst_amount_inr: 216, created_at: '2026-03-12T09:00:00.000Z' },
        ],
      }],
      users: [{ id: 'patient-2', full_name: 'Patient Two', phone: '+919999999999', avatar_url: null }],
    })

    const { GET } = await import('../appointments/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      appointments: [
        {
          id: 'appt-2',
          notes: null,
          provider_notes: null,
          payment_status: 'paid',
          payment_amount_inr: 1416,
          payment_gst_amount_inr: 216,
          patient: { id: 'patient-2', full_name: 'Patient Two', phone: '+919999999999', avatar_url: null },
        },
      ],
    })
  })
})
