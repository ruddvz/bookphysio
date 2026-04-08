import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const getDemoSessionFromCookiesMock = vi.fn()
const getDemoPatientFacingRecordsMock = vi.fn()
const rpcMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/demo/session', () => ({
  getDemoSessionFromCookies: (...args: unknown[]) => getDemoSessionFromCookiesMock(...args),
}))

vi.mock('@/lib/demo/store', () => ({
  getDemoPatientFacingRecords: (...args: unknown[]) => getDemoPatientFacingRecordsMock(...args),
}))

function mockSupabase(options?: {
  user?: { id: string } | null
  rpcResult?: { data: unknown[] | null; error: unknown }
}) {
  rpcMock.mockResolvedValue(options?.rpcResult ?? { data: [], error: null })

  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options?.user === undefined ? { id: 'patient-1' } : options.user },
      }),
    },
    rpc: (...args: unknown[]) => rpcMock(...args),
  })
}

describe('GET /api/patient/records', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getDemoSessionFromCookiesMock.mockResolvedValue(null)
    getDemoPatientFacingRecordsMock.mockReturnValue([])
  })

  it('returns 401 for unauthenticated patients', async () => {
    mockSupabase({ user: null })

    const { GET } = await import('../patient/records/route')
    const response = await GET()

    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('returns demo-safe records when a patient demo session is active', async () => {
    mockSupabase({ user: null })
    getDemoSessionFromCookiesMock.mockResolvedValue({
      role: 'patient',
      userId: '00000000-0000-4000-8000-000000000001',
      sessionId: 'demo-session',
    })
    getDemoPatientFacingRecordsMock.mockReturnValue([
      {
        visit_id: 'demo-visit-1',
        visit_number: 1,
        visit_date: '2026-04-06',
        provider_name: 'Dr. Meera Iyer',
        plan: 'Keep doing the mobility routine once daily.',
        patient_summary: 'Your ankle swelling is settling well.',
      },
    ])

    const { GET } = await import('../patient/records/route')
    const response = await (GET as (request?: NextRequest) => Promise<Response>)(
      new NextRequest('http://localhost/api/patient/records')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      records: [
        {
          visit_id: 'demo-visit-1',
          visit_number: 1,
          visit_date: '2026-04-06',
          provider_name: 'Dr. Meera Iyer',
          plan: 'Keep doing the mobility routine once daily.',
          patient_summary: 'Your ankle swelling is settling well.',
        },
      ],
    })
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('returns an empty list when the patient has no linked clinical profiles', async () => {
    mockSupabase({
      rpcResult: { data: [], error: null },
    })

    const { GET } = await import('../patient/records/route')
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ records: [] })
  })

  it('returns patient-safe records ordered newest first with provider fallback and null-safe notes', async () => {
    mockSupabase({
      rpcResult: {
        data: [
          {
            visit_id: 'visit-3',
            visit_number: 3,
            visit_date: '2026-04-06',
            provider_name: null,
            plan: 'Continue mobility work for five more days.',
            patient_summary: 'Your shoulder motion improved this week.',
            subjective: 'Provider-only detail',
            assessment: 'Provider-only assessment',
            pain_scale: 2,
          },
          {
            visit_id: 'visit-2',
            visit_number: 2,
            visit_date: '2026-04-05',
            provider_name: 'Dr. Meera Iyer',
            plan: null,
            patient_summary: null,
            objective_notes: 'Restricted detail',
          },
          {
            visit_id: 'visit-1',
            visit_number: 1,
            visit_date: '2026-04-03',
            provider_name: 'Dr. Meera Iyer',
            plan: null,
            patient_summary: null,
          },
        ],
        error: null,
      },
    })

    const { GET } = await import('../patient/records/route')
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')

    const body = await response.json() as {
      records: Array<Record<string, unknown>>
    }

    expect(body.records).toEqual([
      {
        visit_id: 'visit-3',
        visit_number: 3,
        visit_date: '2026-04-06',
        provider_name: 'Provider',
        plan: 'Continue mobility work for five more days.',
        patient_summary: 'Your shoulder motion improved this week.',
      },
      {
        visit_id: 'visit-2',
        visit_number: 2,
        visit_date: '2026-04-05',
        provider_name: 'Dr. Meera Iyer',
        plan: null,
        patient_summary: null,
      },
      {
        visit_id: 'visit-1',
        visit_number: 1,
        visit_date: '2026-04-03',
        provider_name: 'Dr. Meera Iyer',
        plan: null,
        patient_summary: null,
      },
    ])

    expect(body.records[0]).not.toHaveProperty('subjective')
    expect(body.records[0]).not.toHaveProperty('assessment')
    expect(body.records[0]).not.toHaveProperty('pain_scale')
    expect(body.records[1]).not.toHaveProperty('objective_notes')
    expect(rpcMock).toHaveBeenCalledWith('get_patient_facing_records')
  })

  it('returns 500 when clinical queries fail instead of silently degrading', async () => {
    mockSupabase({
      rpcResult: {
        data: null,
        error: { message: 'database offline' },
      },
    })

    const { GET } = await import('../patient/records/route')
    const response = await GET()

    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ error: 'Failed to load records' })
  })
})