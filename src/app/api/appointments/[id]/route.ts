import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelAppointmentSchema, updateNotesSchema } from '@/lib/validations/booking'
import { parseAppointmentNotes, updateProviderAppointmentNotes } from '@/lib/booking/policy'
import { fetchPatientSummaryMap, fetchProviderSummaryMap } from '@/lib/appointments/profile-summaries'
import type { SummaryLookupClient } from '@/lib/appointments/profile-summaries'
import { canPatientCancelAppointment } from '@/lib/appointments/cancellation'
import { getActiveBookingAppointmentHoldKey, redis } from '@/lib/upstash'
import { getDemoAppointmentDetail } from '@/lib/demo/store'
import { getDemoSessionFromCookies } from '@/lib/demo/session'

type PaymentRecord = {
  status: 'created' | 'paid' | 'failed' | 'refunded'
  amount_inr: number
  gst_amount_inr: number
  created_at?: string
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

async function clearActiveBookingHold(appointmentId: string) {
  try {
    const appointmentHoldKey = getActiveBookingAppointmentHoldKey(appointmentId)
    const activeIpHoldKey = await redis.get<string>(appointmentHoldKey)

    if (typeof activeIpHoldKey === 'string' && activeIpHoldKey.trim()) {
      const activeHoldValue = await redis.get<string>(activeIpHoldKey)

      if (activeHoldValue === appointmentId) {
        await redis.del(activeIpHoldKey)
      }
    }

    await redis.del(appointmentHoldKey)
  } catch (error) {
    console.error('[api/appointments/[id]] Failed to clear active booking hold:', error)
  }
}

function withAppointmentDetailNotes<T extends { notes: string | null }>(
  appointment: T,
  options?: { includeProviderNotes?: boolean; includeLegacyNotes?: boolean },
) {
  const parsedNotes = parseAppointmentNotes(appointment.notes)
  const providerNotes = options?.includeProviderNotes ? parsedNotes.providerNotes : null
  const legacyNotes = options?.includeLegacyNotes ? parsedNotes.legacyNotes : null
  const payments = ('payments' in appointment ? appointment.payments : null) as PaymentRecord[] | PaymentRecord | null | undefined
  const paymentRecords = Array.isArray(payments)
    ? [...payments].sort((left, right) => {
        const rightCreatedAt = right.created_at ? Date.parse(right.created_at) : 0
        const leftCreatedAt = left.created_at ? Date.parse(left.created_at) : 0
        return rightCreatedAt - leftCreatedAt
      })
    : payments ? [payments] : []
  const latestPayment = paymentRecords[0] ?? null
  const paidPayment = paymentRecords.find((payment) => payment.status === 'paid') ?? null
  const refundedPayment = paymentRecords.find((payment) => payment.status === 'refunded') ?? null
  const effectivePayment = refundedPayment ?? paidPayment ?? latestPayment

  return {
    ...appointment,
    notes: providerNotes,
    provider_notes: providerNotes,
    patient_reason: parsedNotes.patientReason,
    home_visit_address: parsedNotes.homeVisitAddress,
    legacy_notes: legacyNotes,
    payment_status: effectivePayment?.status ?? null,
    payment_amount_inr: effectivePayment?.amount_inr ?? null,
    payment_gst_amount_inr: effectivePayment?.gst_amount_inr ?? null,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession) {
    const demoAppointment = getDemoAppointmentDetail(demoSession.role, id)

    if (!demoAppointment) {
      return jsonNoStore({ error: 'Appointment not found' }, { status: 404 })
    }

    return jsonNoStore(demoAppointment)
  }

  if (!user) return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*, availabilities (*), locations (*), payments (status, amount_inr, gst_amount_inr, created_at)')
    .eq('id', id)
    .or(`patient_id.eq.${user.id},provider_id.eq.${user.id}`)
    .single()

  if (error || !data) return jsonNoStore({ error: 'Appointment not found' }, { status: 404 })

  const appointmentSummaryClient = supabaseAdmin as unknown as SummaryLookupClient

  const patientProfile = user.id === data.provider_id
    ? (await fetchPatientSummaryMap(appointmentSummaryClient, [data.patient_id as string])).get(data.patient_id as string) ?? null
    : null
  const providerSummary = user.id === data.patient_id
    ? (await fetchProviderSummaryMap(appointmentSummaryClient, [data.provider_id as string])).get(data.provider_id as string) ?? null
    : null

  return jsonNoStore(
    withAppointmentDetailNotes(
      { ...data, patient_profile: patientProfile, providers: providerSummary },
      {
        includeProviderNotes: user.id === data.provider_id,
        includeLegacyNotes: user.id === data.provider_id,
      },
    ),
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonNoStore({ error: 'Invalid request body.' }, { status: 400 })
  }

  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession) {
    const demoAppointment = getDemoAppointmentDetail(demoSession.role, id)

    if (!demoAppointment) {
      return jsonNoStore({ error: 'Appointment not found' }, { status: 404 })
    }

    if (body.action === 'cancel' && demoSession.role === 'patient') {
      return jsonNoStore({ ...demoAppointment, status: 'cancelled' })
    }

    if (body.action === 'update_notes' && demoSession.role === 'provider' && typeof body.notes === 'string') {
      return jsonNoStore({
        ...demoAppointment,
        notes: body.notes.slice(0, 2000),
        provider_notes: body.notes.slice(0, 2000),
      })
    }

    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }

  if (!user) return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })

  if (body.action === 'update_notes') {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')

    const parsedNotes = updateNotesSchema.safeParse(body)
    if (!parsedNotes.success) return jsonNoStore({ error: parsedNotes.error.flatten() }, { status: 400 })

    const { data: apptCheck } = await supabaseAdmin
      .from('appointments')
      .select('id, provider_id, notes')
      .eq('id', id)
      .eq('provider_id', user.id)
      .single()
    if (!apptCheck) return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
    const notes = updateProviderAppointmentNotes(apptCheck.notes, parsedNotes.data.notes)
    const { data: updated, error: notesErr } = await supabaseAdmin
      .from('appointments')
      .update({ notes })
      .eq('id', id)
      .select()
      .single()
    if (notesErr) return jsonNoStore({ error: 'Failed to update notes' }, { status: 500 })
    return jsonNoStore(withAppointmentDetailNotes(updated, { includeProviderNotes: true, includeLegacyNotes: true }))
  }

  // Only cancellation is supported via PATCH
  const parsed = cancelAppointmentSchema.safeParse(body)
  if (!parsed.success) return jsonNoStore({ error: parsed.error.flatten() }, { status: 400 })

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  const { data: appt } = await supabaseAdmin
    .from('appointments')
    .select('id, status, patient_id, availability_id, availabilities (starts_at), payments (status)')
    .eq('id', id)
    .eq('patient_id', user.id)
    .single()

  if (!appt) return jsonNoStore({ error: 'Appointment not found' }, { status: 404 })
  const availability = Array.isArray(appt.availabilities) ? appt.availabilities[0] : appt.availabilities
  const startsAt = availability && typeof availability === 'object' && 'starts_at' in availability
    ? availability.starts_at as string | null | undefined
    : null
  const payments = ('payments' in appt ? appt.payments : null) as PaymentRecord[] | PaymentRecord | null | undefined
  const paymentRecords = Array.isArray(payments) ? payments : payments ? [payments] : []

  if (paymentRecords.some((payment) => payment.status === 'paid')) {
    return jsonNoStore({ error: 'Appointments paid online cannot be cancelled automatically right now. Please contact support.' }, { status: 409 })
  }

  if (!canPatientCancelAppointment(appt.status as string, startsAt)) {
    return jsonNoStore({ error: 'Appointment cannot be cancelled' }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin.rpc('cancel_appointment_and_release_slot', {
    p_appointment_id: id,
    p_patient_id: user.id,
  })

  if (error) return jsonNoStore({ error: 'Failed to cancel appointment' }, { status: 500 })

  if (!data) return jsonNoStore({ error: 'Appointment not found' }, { status: 404 })

  await clearActiveBookingHold(appt.id)

  return jsonNoStore(
    withAppointmentDetailNotes(data, {
      includeProviderNotes: user.id === data.provider_id,
      includeLegacyNotes: user.id === data.provider_id,
    }),
  )
}
