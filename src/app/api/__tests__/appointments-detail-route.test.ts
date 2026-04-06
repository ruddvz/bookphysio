import { NextRequest } from 'next/server'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { buildAppointmentNotes } from '@/lib/booking/policy'

const createClientMock = vi.fn()
const supabaseAdminFromMock = vi.fn()
const supabaseAdminRpcMock = vi.fn()
const redisGetMock = vi.fn()
const redisDelMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (table: string) => supabaseAdminFromMock(table),
    rpc: (...args: unknown[]) => supabaseAdminRpcMock(...args),
  },
}))

vi.mock('@/lib/upstash', () => ({
  redis: {
    get: (...args: unknown[]) => redisGetMock(...args),
    del: (...args: unknown[]) => redisDelMock(...args),
  },
  getActiveBookingAppointmentHoldKey: (appointmentId: string) => `bp:booking:active-appointment:${appointmentId}`,
  releaseRedisLockIfOwned: async (key: string, expectedValue: string) => {
    const currentValue = await redisGetMock(key)

    if (currentValue === expectedValue) {
      return redisDelMock(key)
    }

    return 0
  },
}))

function createAdminReadChain(result: unknown[] | Record<string, unknown>) {
  const rows = Array.isArray(result) ? result : [result]
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    in: vi.fn().mockResolvedValue({
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

describe('/api/appointments/[id] route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    redisGetMock.mockResolvedValue(null)
    redisDelMock.mockResolvedValue(1)
    supabaseAdminRpcMock.mockResolvedValue({
      data: {
        id: 'appt-123',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        status: 'cancelled',
        notes: null,
      },
      error: null,
    })
  })

  it('surfaces booking metadata separately on appointment detail fetches', async () => {
    const storedNotes = buildAppointmentNotes({
      visitType: 'home_visit',
      patientAddress: '12 Palm Street, Bengaluru',
      notes: 'Bring previous MRI report',
    })

    const appointmentChain = {
      select: vi.fn(() => appointmentChain),
      eq: vi.fn(() => appointmentChain),
      or: vi.fn(() => appointmentChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'appt-123',
          patient_id: 'patient-1',
          provider_id: 'provider-1',
          visit_type: 'home_visit',
          status: 'confirmed',
          fee_inr: 1560,
          notes: storedNotes,
          payments: [
            { status: 'refunded', amount_inr: 1560, gst_amount_inr: 281, created_at: '2026-01-01T09:00:00.000Z' },
            { status: 'paid', amount_inr: 1560, gst_amount_inr: 281, created_at: '2026-01-02T09:00:00.000Z' },
          ],
          created_at: '2026-01-01T09:00:00.000Z',
          availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
          locations: null,
          providers: null,
        },
        error: null,
      }),
    }

    mockAdminTableRows({
      appointments: {
        id: 'appt-123',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        visit_type: 'home_visit',
        status: 'confirmed',
        fee_inr: 1560,
        notes: storedNotes,
        payments: [
          { status: 'refunded', amount_inr: 1560, gst_amount_inr: 281, created_at: '2026-01-01T09:00:00.000Z' },
          { status: 'paid', amount_inr: 1560, gst_amount_inr: 281, created_at: '2026-01-02T09:00:00.000Z' },
        ],
        created_at: '2026-01-01T09:00:00.000Z',
        availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
        locations: null,
        providers: null,
      },
      users: [{ id: 'patient-1', full_name: 'Patient One', phone: '+919999999999', avatar_url: null }],
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: vi.fn(),
    })

    const { GET } = await import('../appointments/[id]/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments/appt-123'), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toMatchObject({
      notes: null,
      provider_notes: null,
      patient_reason: 'Bring previous MRI report',
      home_visit_address: '12 Palm Street, Bengaluru',
      patient_profile: { full_name: 'Patient One' },
      legacy_notes: null,
      payment_status: 'paid',
      payment_amount_inr: 1560,
    })
  })

  it('preserves booking metadata when providers update their notes', async () => {
    let persistedNotes = buildAppointmentNotes({
      visitType: 'home_visit',
      patientAddress: '12 Palm Street, Bengaluru',
      notes: 'Bring previous MRI report',
    })
    let appointmentCallCount = 0

    const appointmentCheckChain = {
      select: vi.fn(() => appointmentCheckChain),
      eq: vi.fn(() => appointmentCheckChain),
      single: vi.fn().mockResolvedValue({
        data: { id: 'appt-123', provider_id: 'provider-1', notes: persistedNotes },
        error: null,
      }),
    }

    const appointmentUpdateChain = {
      update: vi.fn((payload: { notes?: string | null }) => {
        persistedNotes = payload.notes ?? null
        return appointmentUpdateChain
      }),
      eq: vi.fn(() => appointmentUpdateChain),
      select: vi.fn(() => appointmentUpdateChain),
      single: vi.fn().mockImplementation(async () => ({
        data: { id: 'appt-123', notes: persistedNotes },
        error: null,
      })),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: (table: string) => {
        if (table !== 'appointments') {
          throw new Error(`Unhandled table: ${table}`)
        }

        appointmentCallCount += 1
        return appointmentCallCount === 1 ? appointmentCheckChain : appointmentUpdateChain
      },
    })

    supabaseAdminFromMock.mockImplementation((table: string) => {
      if (table === 'appointments') {
        return appointmentUpdateChain
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_notes', notes: 'Manual therapy completed' }),
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      notes: 'Manual therapy completed',
      provider_notes: 'Manual therapy completed',
      patient_reason: 'Bring previous MRI report',
      home_visit_address: '12 Palm Street, Bengaluru',
      legacy_notes: null,
    })
  })

  it('does not expose provider notes to patient viewers on appointment detail fetches', async () => {
    let persistedNotes = buildAppointmentNotes({
      visitType: 'home_visit',
      patientAddress: '12 Palm Street, Bengaluru',
      notes: 'Bring previous MRI report',
    })
    persistedNotes = JSON.stringify({
      __bookphysio: 'bookphysio-appointment-notes-v1',
      homeVisitAddress: '12 Palm Street, Bengaluru',
      patientReason: 'Bring previous MRI report',
      providerNotes: 'Manual therapy completed',
    })

    const appointmentChain = {
      select: vi.fn(() => appointmentChain),
      eq: vi.fn(() => appointmentChain),
      or: vi.fn(() => appointmentChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'appt-123',
          patient_id: 'patient-1',
          provider_id: 'provider-1',
          visit_type: 'home_visit',
          status: 'confirmed',
          fee_inr: 1560,
          notes: persistedNotes,
          created_at: '2026-01-01T09:00:00.000Z',
          availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
          locations: null,
          providers: null,
        },
        error: null,
      }),
    }

    mockAdminTableRows({
      appointments: {
        id: 'appt-123',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        visit_type: 'home_visit',
        status: 'confirmed',
        fee_inr: 1560,
        notes: persistedNotes,
        created_at: '2026-01-01T09:00:00.000Z',
        availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
        locations: null,
        providers: null,
      },
      providers: [{
        id: 'provider-1',
        specialty_ids: [],
        gstin: 'should-not-leak',
        users: { full_name: 'Dr. Meera Iyer', avatar_url: null },
      }],
      specialties: [],
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: vi.fn(),
    })

    const { GET } = await import('../appointments/[id]/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments/appt-123'), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()

    expect(body).toMatchObject({
      notes: null,
      provider_notes: null,
      patient_reason: 'Bring previous MRI report',
      home_visit_address: '12 Palm Street, Bengaluru',
      providers: {
        users: { full_name: 'Dr. Meera Iyer', avatar_url: null },
        specialties: [],
      },
    })
    expect(body.providers).not.toHaveProperty('gstin')
  })

  it('does not expose legacy plain-text notes to patient viewers', async () => {
    const appointmentChain = {
      select: vi.fn(() => appointmentChain),
      eq: vi.fn(() => appointmentChain),
      or: vi.fn(() => appointmentChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'appt-legacy',
          patient_id: 'patient-1',
          provider_id: 'provider-1',
          visit_type: 'in_clinic',
          status: 'confirmed',
          fee_inr: 1200,
          notes: 'Legacy provider note',
          created_at: '2026-01-01T09:00:00.000Z',
          availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
          locations: null,
          providers: null,
          payments: [],
        },
        error: null,
      }),
    }

    mockAdminTableRows({
      appointments: {
        id: 'appt-legacy',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        visit_type: 'in_clinic',
        status: 'confirmed',
        fee_inr: 1200,
        notes: 'Legacy provider note',
        created_at: '2026-01-01T09:00:00.000Z',
        availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
        locations: null,
        providers: null,
        payments: [],
      },
      providers: [{
        id: 'provider-1',
        specialty_ids: [],
        users: { full_name: 'Dr. Meera Iyer', avatar_url: null },
      }],
      specialties: [],
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: vi.fn(),
    })

    const { GET } = await import('../appointments/[id]/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments/appt-legacy'), {
      params: Promise.resolve({ id: 'appt-legacy' }),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      notes: null,
      provider_notes: null,
      patient_reason: null,
      home_visit_address: null,
      legacy_notes: null,
    })
  })

  it('preserves legacy plain-text notes for provider viewers without exposing them as provider-authored notes', async () => {
    const appointmentChain = {
      select: vi.fn(() => appointmentChain),
      eq: vi.fn(() => appointmentChain),
      or: vi.fn(() => appointmentChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'appt-legacy',
          patient_id: 'patient-1',
          provider_id: 'provider-1',
          visit_type: 'in_clinic',
          status: 'confirmed',
          fee_inr: 1200,
          notes: 'Legacy provider note',
          created_at: '2026-01-01T09:00:00.000Z',
          availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
          locations: null,
          payments: [],
        },
        error: null,
      }),
    }

    mockAdminTableRows({
      appointments: {
        id: 'appt-legacy',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        visit_type: 'in_clinic',
        status: 'confirmed',
        fee_inr: 1200,
        notes: 'Legacy provider note',
        created_at: '2026-01-01T09:00:00.000Z',
        availabilities: { starts_at: '2026-01-02T09:00:00.000Z', ends_at: '2026-01-02T09:30:00.000Z', slot_duration_mins: 30 },
        locations: null,
        payments: [],
      },
      users: [{ id: 'patient-1', full_name: 'Patient One', phone: '+919999999999', avatar_url: null }],
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: vi.fn(),
    })

    const { GET } = await import('../appointments/[id]/route')
    const response = await GET(new NextRequest('http://localhost/api/appointments/appt-legacy'), {
      params: Promise.resolve({ id: 'appt-legacy' }),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      notes: null,
      provider_notes: null,
      legacy_notes: 'Legacy provider note',
    })
  })

  it('rejects note updates when notes are missing instead of wiping stored notes', async () => {
    const appointmentCheckChain = {
      select: vi.fn(() => appointmentCheckChain),
      eq: vi.fn(() => appointmentCheckChain),
      single: vi.fn().mockResolvedValue({
        data: { id: 'appt-123', provider_id: 'provider-1', notes: 'Existing note' },
        error: null,
      }),
    }

    const appointmentUpdateChain = {
      update: vi.fn(() => appointmentUpdateChain),
      eq: vi.fn(() => appointmentUpdateChain),
      select: vi.fn(() => appointmentUpdateChain),
      single: vi.fn(),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: (table: string) => {
        if (table !== 'appointments') {
          throw new Error(`Unhandled table: ${table}`)
        }

        return appointmentCheckChain
      },
    })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_notes' }),
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(400)
    expect(appointmentUpdateChain.update).not.toHaveBeenCalled()
  })

  it('rejects non-string note updates instead of wiping stored notes', async () => {
    const appointmentCheckChain = {
      select: vi.fn(() => appointmentCheckChain),
      eq: vi.fn(() => appointmentCheckChain),
      single: vi.fn().mockResolvedValue({
        data: { id: 'appt-123', provider_id: 'provider-1', notes: 'Existing note' },
        error: null,
      }),
    }

    const appointmentUpdateChain = {
      update: vi.fn(() => appointmentUpdateChain),
      eq: vi.fn(() => appointmentUpdateChain),
      select: vi.fn(() => appointmentUpdateChain),
      single: vi.fn(),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: (table: string) => {
        if (table !== 'appointments') {
          throw new Error(`Unhandled table: ${table}`)
        }

        return appointmentCheckChain
      },
    })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_notes', notes: { text: 'bad' } }),
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(400)
    expect(appointmentUpdateChain.update).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON payloads before note validation runs', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'provider-1' } } }),
      },
      from: vi.fn(),
    })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad-json',
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(400)
  })

  it('does not report cancellation success when slot release fails', async () => {
    const appointmentChain = {
      select: vi.fn(() => appointmentChain),
      eq: vi.fn(() => appointmentChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'appt-123',
          status: 'confirmed',
          patient_id: 'patient-1',
          availability_id: 'slot-123',
          availabilities: { starts_at: new Date(Date.now() + (6 * 60 * 60 * 1000)).toISOString() },
        },
        error: null,
      }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: vi.fn(),
    })

    mockAdminTableRows({
      appointments: {
        id: 'appt-123',
        status: 'confirmed',
        patient_id: 'patient-1',
        availability_id: 'slot-123',
        availabilities: { starts_at: new Date(Date.now() + (6 * 60 * 60 * 1000)).toISOString() },
      },
    })

    supabaseAdminRpcMock.mockResolvedValue({ data: null, error: { message: 'boom' } })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', reason: 'schedule_conflict' }),
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({ error: 'Failed to cancel appointment' })
  })

  it('rejects cancellation requests inside the 4-hour cutoff window', async () => {
    const appointmentChain = {
      select: vi.fn(() => appointmentChain),
      eq: vi.fn(() => appointmentChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'appt-123',
          status: 'confirmed',
          patient_id: 'patient-1',
          availability_id: 'slot-123',
          availabilities: { starts_at: new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString() },
        },
        error: null,
      }),
    }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: vi.fn(),
    })

    mockAdminTableRows({
      appointments: {
        id: 'appt-123',
        status: 'confirmed',
        patient_id: 'patient-1',
        availability_id: 'slot-123',
        availabilities: { starts_at: new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString() },
      },
    })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(409)
    expect(supabaseAdminFromMock).toHaveBeenCalledTimes(1)
    expect(supabaseAdminRpcMock).not.toHaveBeenCalled()
  })

  it('rejects paid appointments before invoking the cancellation RPC', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-1' } } }),
      },
      from: vi.fn(),
    })

    mockAdminTableRows({
      appointments: {
        id: 'appt-123',
        status: 'confirmed',
        patient_id: 'patient-1',
        availability_id: 'slot-123',
        availabilities: { starts_at: new Date(Date.now() + (6 * 60 * 60 * 1000)).toISOString() },
        payments: [{ status: 'paid' }],
      },
    })

    const { PATCH } = await import('../appointments/[id]/route')
    const response = await PATCH(new NextRequest('http://localhost/api/appointments/appt-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    }), {
      params: Promise.resolve({ id: 'appt-123' }),
    })

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Appointments paid online cannot be cancelled automatically right now. Please contact support.',
    })
    expect(supabaseAdminRpcMock).not.toHaveBeenCalled()
  })
})
