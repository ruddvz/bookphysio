import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseAppointmentNotes } from '@/lib/booking/policy'

const createClientMock = vi.fn()
const adminFromMock = vi.fn()
const bookingIpRateLimitMock = vi.fn()
const bookingUserRateLimitMock = vi.fn()
const redisGetMock = vi.fn()
const redisSetMock = vi.fn()
const redisDelMock = vi.fn()
let adminAppointmentInsertHandler: ((payload: unknown) => void) | undefined
let adminExistingBookings: unknown[] | undefined
let redisState = new Map<string, string>()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => adminFromMock(...args),
  },
}))

vi.mock('@/lib/upstash', () => ({
  bookingIpRatelimit: {
    limit: (...args: unknown[]) => bookingIpRateLimitMock(...args),
  },
  bookingUserRatelimit: {
    limit: (...args: unknown[]) => bookingUserRateLimitMock(...args),
  },
  redis: {
    get: (...args: unknown[]) => redisGetMock(...args),
    set: (...args: unknown[]) => redisSetMock(...args),
    del: (...args: unknown[]) => redisDelMock(...args),
  },
  getActiveBookingIpHoldKey: (ipAddress: string) => `bp:booking:active-ip:${ipAddress}`,
  getActiveBookingAppointmentHoldKey: (appointmentId: string) => `bp:booking:active-appointment:${appointmentId}`,
  getActiveBookingHoldTtlSeconds: () => 1800,
}))

function createRoleChain(role: 'patient' | 'provider' | 'admin') {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue({ data: { role }, error: null }),
  }

  return chain
}

function createSlotChain() {
  const startsAt = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()

  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'slot-1',
        provider_id: '11111111-1111-4111-8111-111111111111',
        location_id: '22222222-2222-4222-8222-222222222222',
        starts_at: startsAt,
        is_booked: false,
        is_blocked: false,
        providers: {
          consultation_fee_inr: 1200,
        },
      },
      error: null,
    }),
  }

  return chain
}

function createLocationChain() {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { visit_type: ['in_clinic', 'home_visit'] },
      error: null,
    }),
  }

  return chain
}

function createAppointmentsTable(options: {
  existingBookings?: unknown[]
}) {
  const selectChain = {
    eq: vi.fn(() => selectChain),
    in: vi.fn(() => selectChain),
    gte: vi.fn(() => selectChain),
    then: (onFulfilled: (value: { data: unknown[]; error: null }) => unknown) => Promise.resolve({ data: options.existingBookings ?? [], error: null }).then(onFulfilled),
  }

  return {
    select: vi.fn(() => selectChain),
  }
}

function createAdminAppointmentsChain() {
  const selectChain = {
    eq: vi.fn(() => selectChain),
    in: vi.fn(() => selectChain),
    gte: vi.fn(() => selectChain),
    then: (onFulfilled: (value: { data: unknown[]; error: null }) => unknown) =>
      Promise.resolve({ data: adminExistingBookings ?? [], error: null }).then(onFulfilled),
  }

  const insertSelectChain = {
    select: vi.fn(() => insertSelectChain),
    single: vi.fn().mockResolvedValue({ data: { id: 'appt-123456' }, error: null }),
  }

  const deleteChain = {
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  return {
    select: vi.fn(() => selectChain),
    insert: vi.fn((payload: unknown) => {
      adminAppointmentInsertHandler?.(payload)
      return insertSelectChain
    }),
    delete: vi.fn(() => deleteChain),
  }
}

function createAdminAvailabilityChain() {
  const chain = {
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    select: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'slot-1' }, error: null }),
  }

  return chain
}

function buildSupabaseClient(options: {
  role: 'patient' | 'provider' | 'admin'
  onInsert?: (payload: unknown) => void
  existingBookings?: unknown[]
}) {
  const appointmentsTable = createAppointmentsTable({
    existingBookings: options.existingBookings,
  })
  adminAppointmentInsertHandler = options.onInsert
  adminExistingBookings = options.existingBookings

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: '00000000-0000-4000-8000-000000000010',
          },
        },
      }),
    },
    from: (table: string) => {
      if (table === 'users') {
        return createRoleChain(options.role)
      }

      if (table === 'appointments') {
        return appointmentsTable
      }

      if (table === 'availabilities') {
        return createSlotChain()
      }

      if (table === 'locations') {
        return createLocationChain()
      }

      throw new Error(`Unhandled table: ${table}`)
    },
  }
}

describe('POST /api/appointments', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    adminAppointmentInsertHandler = undefined
    adminExistingBookings = undefined
    redisState = new Map()
    bookingIpRateLimitMock.mockResolvedValue({ success: true })
    bookingUserRateLimitMock.mockResolvedValue({ success: true })
    redisGetMock.mockImplementation(async (key: string) => redisState.get(String(key)) ?? null)
    redisSetMock.mockImplementation(async (key: string, value: string, options?: { nx?: boolean }) => {
      const normalizedKey = String(key)

      if (options?.nx && redisState.has(normalizedKey)) {
        return null
      }

      redisState.set(normalizedKey, String(value))
      return 'OK'
    })
    redisDelMock.mockImplementation(async (key: string) => {
      const normalizedKey = String(key)
      const deleted = redisState.delete(normalizedKey)
      return deleted ? 1 : 0
    })
    adminFromMock.mockImplementation((table: string) => {
      if (table === 'availabilities') {
        return createAdminAvailabilityChain()
      }

      if (table === 'appointments') {
        return createAdminAppointmentsChain()
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })
  })

  it('rejects non-patient accounts before reserving a slot', async () => {
    createClientMock.mockResolvedValue(buildSupabaseClient({ role: 'provider' }))

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'in_clinic',
      }),
    }))

    expect(response.status).toBe(403)
    expect(adminFromMock).not.toHaveBeenCalled()
  })

  it('rate limits repeated booking attempts and releases the reserved slot when the user bucket is exhausted', async () => {
    createClientMock.mockResolvedValue(buildSupabaseClient({ role: 'patient' }))
    bookingUserRateLimitMock.mockResolvedValue({ success: false })

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'in_clinic',
      }),
    }))

    expect(response.status).toBe(429)
  expect(adminFromMock).toHaveBeenCalledTimes(3)
  })

  it('blocks any second upcoming pay-at-visit booking before reserving a slot', async () => {
    createClientMock.mockResolvedValue(buildSupabaseClient({
      role: 'patient',
      existingBookings: [{ id: 'appt-existing' }],
    }))

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'in_clinic',
      }),
    }))

    expect(response.status).toBe(409)
  expect(adminFromMock).toHaveBeenCalledTimes(1)
  })

  it('blocks another unpaid booking from the same network before reserving a slot', async () => {
    vi.stubEnv('VERCEL', '1')
    redisSetMock.mockResolvedValueOnce(null)
    createClientMock.mockResolvedValue(buildSupabaseClient({ role: 'patient' }))

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '203.0.113.10',
      },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'in_clinic',
      }),
    }))

    expect(response.status).toBe(409)
  expect(adminFromMock).toHaveBeenCalledTimes(1)
  })

  it('allows another booking when the patient already has a future appointment that was paid online', async () => {
    let insertedPayload: Record<string, unknown> | undefined
    createClientMock.mockResolvedValue(buildSupabaseClient({
      role: 'patient',
      existingBookings: [{ id: 'appt-paid', payments: [{ status: 'paid' }] }],
      onInsert: (payload) => {
        insertedPayload = payload as Record<string, unknown>
      },
    }))

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'in_clinic',
      }),
    }))

    expect(response.status).toBe(201)
    expect(insertedPayload).toMatchObject({
      patient_id: '00000000-0000-4000-8000-000000000010',
      visit_type: 'in_clinic',
    })
  })

  it('applies home-visit pricing and stores booking metadata without mixing it into provider notes', async () => {
    let insertedPayload: Record<string, unknown> | undefined
    createClientMock.mockResolvedValue(buildSupabaseClient({
      role: 'patient',
      onInsert: (payload) => {
        insertedPayload = payload as Record<string, unknown>
      },
    }))

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'home_visit',
        patient_address: '12 Palm Street, Bengaluru',
        notes: 'Bring previous MRI report',
      }),
    }))

    expect(response.status).toBe(201)
    expect(parseAppointmentNotes(insertedPayload?.notes as string)).toEqual({
      homeVisitAddress: '12 Palm Street, Bengaluru',
      patientReason: 'Bring previous MRI report',
      providerNotes: null,
      legacyNotes: null,
    })
    expect(insertedPayload).toMatchObject({
      fee_inr: 1560,
      location_id: '22222222-2222-4222-8222-222222222222',
      patient_id: '00000000-0000-4000-8000-000000000010',
      status: 'confirmed',
      visit_type: 'home_visit',
    })
    expect(redisSetMock).toHaveBeenCalled()
  })

  it('rejects malformed JSON instead of crashing the booking route', async () => {
    createClientMock.mockResolvedValue(buildSupabaseClient({ role: 'patient' }))

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad-json',
    }))

    expect(response.status).toBe(400)
  })

  it('rejects attempts to book past slots', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: '00000000-0000-4000-8000-000000000010',
            },
          },
        }),
      },
      from: (table: string) => {
        if (table === 'users') {
          return createRoleChain('patient')
        }

        if (table === 'appointments') {
          return createAppointmentsTable({})
        }

        if (table === 'availabilities') {
          const pastSlotChain = {
            select: vi.fn(() => pastSlotChain),
            eq: vi.fn(() => pastSlotChain),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'slot-1',
                provider_id: '11111111-1111-4111-8111-111111111111',
                location_id: '22222222-2222-4222-8222-222222222222',
                starts_at: new Date(Date.now() - (60 * 60 * 1000)).toISOString(),
                is_booked: false,
                is_blocked: false,
                providers: {
                  consultation_fee_inr: 1200,
                },
              },
              error: null,
            }),
          }

          return pastSlotChain
        }

        if (table === 'locations') {
          return createLocationChain()
        }

        throw new Error(`Unhandled table: ${table}`)
      },
    })

    const { POST } = await import('../appointments/route')
    const response = await POST(new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: '11111111-1111-4111-8111-111111111111',
        availability_id: '33333333-3333-4333-8333-333333333333',
        location_id: '22222222-2222-4222-8222-222222222222',
        visit_type: 'in_clinic',
      }),
    }))

    expect(response.status).toBe(409)
    expect(adminFromMock).toHaveBeenCalledTimes(1)
  })
})