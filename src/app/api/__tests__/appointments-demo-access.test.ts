import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDemoCookiePayload,
  DEMO_SESSION_COOKIE,
  encodeDemoCookie,
} from '@/lib/demo/session'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  })),
}))

async function buildDemoCookie(role: 'patient' | 'provider' | 'admin') {
  return encodeDemoCookie(createDemoCookiePayload(role))
}

describe('GET /api/appointments demo access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
  })

  it('returns patient demo dashboard appointments without a Supabase session', async () => {
    const { GET } = await import('../appointments/route')
    const demoCookie = await buildDemoCookie('patient')
    const request = new NextRequest('http://localhost/api/appointments?view=dashboard', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
    })

    const response = await GET(request)
    const body = (await response.json()) as {
      appointments?: Array<{
        id: string
        providers?: { users?: { full_name?: string } }
      }>
    }

    expect(response.status).toBe(200)
    expect(body.appointments?.[0]?.id).toBe('demo-patient-appt-1')
    expect(body.appointments?.[0]?.providers?.users?.full_name).toBe('Dr. Meera Iyer')
  })

  it('returns patient demo appointments without a Supabase session', async () => {
    const { GET } = await import('../appointments/route')
    const demoCookie = await buildDemoCookie('patient')
    const request = new NextRequest('http://localhost/api/appointments', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
    })

    const response = await GET(request)
    const body = (await response.json()) as { appointments?: Array<{ id: string }> }

    expect(response.status).toBe(200)
    expect(body.appointments?.length).toBeGreaterThan(0)
  })

  it('returns patient demo appointment detail without a Supabase session', async () => {
    const { GET } = await import('../appointments/[id]/route')
    const demoCookie = await buildDemoCookie('patient')
    const request = new NextRequest('http://localhost/api/appointments/demo-patient-appt-1', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
    })

    const response = await GET(request, {
      params: Promise.resolve({ id: 'demo-patient-appt-1' }),
    })
    const body = (await response.json()) as { id?: string; providers?: { users?: { full_name?: string } } }

    expect(response.status).toBe(200)
    expect(body.id).toBe('demo-patient-appt-1')
    expect(body.providers?.users?.full_name).toBe('Dr. Meera Iyer')
  })

  it('allows demo patients to cancel a demo appointment detail request without hitting Supabase auth', async () => {
    const { PATCH } = await import('../appointments/[id]/route')
    const demoCookie = await buildDemoCookie('patient')
    const request = new NextRequest('http://localhost/api/appointments/demo-patient-appt-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
      body: JSON.stringify({ action: 'cancel' }),
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'demo-patient-appt-1' }),
    })
    const body = (await response.json()) as { status?: string }

    expect(response.status).toBe(200)
    expect(body.status).toBe('cancelled')
  })
})