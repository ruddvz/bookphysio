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

async function buildProviderCookie() {
  return encodeDemoCookie(createDemoCookiePayload('provider'))
}

describe('provider demo access routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PREVIEW_PASSWORD', 'preview-secret')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEMO', 'true')
  })

  it('returns provider demo patient roster without a Supabase session', async () => {
    const { GET } = await import('../provider/patients/route')
    const demoCookie = await buildProviderCookie()
    const request = new NextRequest('http://localhost/api/provider/patients', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
    })

    const response = await GET(request)
    const body = (await response.json()) as {
      patients?: Array<{ patient_name: string }>
    }

    expect(response.status).toBe(200)
    expect(body.patients?.length).toBeGreaterThan(0)
    expect(body.patients?.[0]?.patient_name).toBeTruthy()
  })

  it('creates provider demo patients and returns them in the roster', async () => {
    const { GET, POST } = await import('../provider/patients/route')
    const demoCookie = await buildProviderCookie()
    const cookieHeader = `${DEMO_SESSION_COOKIE}=${demoCookie}`

    const createResponse = await POST(new NextRequest('http://localhost/api/provider/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        patient_name: 'Zoya Khan',
        patient_phone: '+919988776655',
        patient_age: 29,
        chief_complaint: 'Neck stiffness',
      }),
    }))

    expect(createResponse.status).toBe(201)
    const createdBody = (await createResponse.json()) as { profile_id?: string }
    expect(createdBody.profile_id).toBeTruthy()

    const rosterResponse = await GET(new NextRequest('http://localhost/api/provider/patients', {
      headers: {
        cookie: cookieHeader,
      },
    }))
    const rosterBody = (await rosterResponse.json()) as {
      patients?: Array<{ profile_id: string; patient_name: string }>
    }

    expect(rosterResponse.status).toBe(200)
    expect(rosterBody.patients?.some((patient) => patient.profile_id === createdBody.profile_id && patient.patient_name === 'Zoya Khan')).toBe(true)
  })

  it('returns provider demo schedule entries without a Supabase session', async () => {
    const { GET } = await import('../provider/schedule/route')
    const demoCookie = await buildProviderCookie()
    const request = new NextRequest('http://localhost/api/provider/schedule?start=2000-01-01&end=2999-12-31', {
      headers: {
        cookie: `${DEMO_SESSION_COOKIE}=${demoCookie}`,
      },
    })

    const response = await GET(request)
    const body = (await response.json()) as {
      entries?: Array<{ patient_name: string; visit_time: string }>
    }

    expect(response.status).toBe(200)
    expect(body.entries?.length).toBeGreaterThan(0)
    expect(body.entries?.[0]?.patient_name).toBeTruthy()
    expect(body.entries?.[0]?.visit_time).toMatch(/^\d{2}:\d{2}$/)
  })

  it('allows provider demo sessions to schedule visits for existing demo patients', async () => {
    const patientsRoute = await import('../provider/patients/route')
    const scheduleRoute = await import('../provider/schedule/route')
    const demoCookie = await buildProviderCookie()
    const cookieHeader = `${DEMO_SESSION_COOKIE}=${demoCookie}`

    const patientsResponse = await patientsRoute.GET(new NextRequest('http://localhost/api/provider/patients', {
      headers: {
        cookie: cookieHeader,
      },
    }))
    const patientsBody = (await patientsResponse.json()) as {
      patients: Array<{ profile_id: string; patient_name: string }>
    }

    const profileId = patientsBody.patients[0]?.profile_id
    expect(profileId).toBeTruthy()

    const createResponse = await scheduleRoute.POST(new NextRequest('http://localhost/api/provider/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        profile_id: profileId,
        visit_date: '2026-04-09',
        visit_time: '13:00',
        fee_inr: 1100,
      }),
    }))

    expect(createResponse.status).toBe(201)
    const createdBody = (await createResponse.json()) as {
      profile_id?: string
      patient_name?: string
      visit_time?: string
    }

    expect(createdBody.profile_id).toBe(profileId)
    expect(createdBody.patient_name).toBeTruthy()
    expect(createdBody.visit_time).toBe('13:00')

    const scheduleResponse = await scheduleRoute.GET(new NextRequest('http://localhost/api/provider/schedule?start=2026-04-09&end=2026-04-09', {
      headers: {
        cookie: cookieHeader,
      },
    }))
    const scheduleBody = (await scheduleResponse.json()) as {
      entries?: Array<{ profile_id: string; visit_time: string }>
    }

    expect(scheduleResponse.status).toBe(200)
    expect(scheduleBody.entries?.some((entry) => entry.profile_id === profileId && entry.visit_time === '13:00')).toBe(true)
  })

  it('returns patient charts for provider demo sessions', async () => {
    const patientsRoute = await import('../provider/patients/route')
    const chartRoute = await import('../provider/patients/[id]/route')
    const demoCookie = await buildProviderCookie()
    const cookieHeader = `${DEMO_SESSION_COOKIE}=${demoCookie}`

    const rosterResponse = await patientsRoute.GET(new NextRequest('http://localhost/api/provider/patients', {
      headers: {
        cookie: cookieHeader,
      },
    }))
    const rosterBody = (await rosterResponse.json()) as {
      patients: Array<{ profile_id: string; patient_name: string }>
    }

    const profileId = rosterBody.patients[0]?.profile_id
    const response = await chartRoute.GET(new NextRequest(`http://localhost/api/provider/patients/${profileId}`, {
      headers: {
        cookie: cookieHeader,
      },
    }), {
      params: Promise.resolve({ id: profileId }),
    })
    const body = (await response.json()) as {
      profile?: { id: string; patient_name: string }
      visits?: Array<{ id: string; visit_number: number }>
    }

    expect(response.status).toBe(200)
    expect(body.profile?.id).toBe(profileId)
    expect(body.profile?.patient_name).toBeTruthy()
    expect(body.visits?.length).toBeGreaterThan(0)
  })

  it('persists provider demo chart updates across profile, visit, and SOAP routes', async () => {
    const patientsRoute = await import('../provider/patients/route')
    const chartRoute = await import('../provider/patients/[id]/route')
    const profileRoute = await import('../provider/patients/[id]/profile/route')
    const visitsRoute = await import('../provider/patients/[id]/visits/route')
    const soapRoute = await import('../provider/visits/[visitId]/soap/route')
    const demoCookie = await buildProviderCookie()
    const cookieHeader = `${DEMO_SESSION_COOKIE}=${demoCookie}`

    const rosterResponse = await patientsRoute.GET(new NextRequest('http://localhost/api/provider/patients', {
      headers: {
        cookie: cookieHeader,
      },
    }))
    const rosterBody = (await rosterResponse.json()) as {
      patients: Array<{ profile_id: string }>
    }
    const profileId = rosterBody.patients[0]?.profile_id

    const profileResponse = await profileRoute.PATCH(new NextRequest(`http://localhost/api/provider/patients/${profileId}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        chief_complaint: 'Updated demo complaint',
        treatment_goals: 'Climb stairs without pain',
      }),
    }), {
      params: Promise.resolve({ id: profileId }),
    })

    expect(profileResponse.status).toBe(200)

    const visitResponse = await visitsRoute.POST(new NextRequest(`http://localhost/api/provider/patients/${profileId}/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        visit_date: '2026-04-11',
      }),
    }), {
      params: Promise.resolve({ id: profileId }),
    })
    const visitBody = (await visitResponse.json()) as { id?: string }

    expect(visitResponse.status).toBe(201)
    expect(visitBody.id).toBeTruthy()

    const soapResponse = await soapRoute.PUT(new NextRequest(`http://localhost/api/provider/visits/${visitBody.id}/soap`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        subjective: 'Symptoms are easing with the home program.',
        plan: 'Continue progressive loading and reassess next week.',
      }),
    }), {
      params: Promise.resolve({ visitId: visitBody.id ?? '' }),
    })

    expect(soapResponse.status).toBe(201)

    const chartResponse = await chartRoute.GET(new NextRequest(`http://localhost/api/provider/patients/${profileId}`, {
      headers: {
        cookie: cookieHeader,
      },
    }), {
      params: Promise.resolve({ id: profileId }),
    })
    const chartBody = (await chartResponse.json()) as {
      profile?: { chief_complaint: string | null; treatment_goals: string | null }
      visits?: Array<{ id: string; note?: { plan?: string | null } | null }>
    }

    expect(chartResponse.status).toBe(200)
    expect(chartBody.profile?.chief_complaint).toBe('Updated demo complaint')
    expect(chartBody.profile?.treatment_goals).toBe('Climb stairs without pain')
    expect(chartBody.visits?.some((visit) => visit.id === visitBody.id && visit.note?.plan === 'Continue progressive loading and reassess next week.')).toBe(true)
  })
})