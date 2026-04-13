import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoAppointments } from '@/lib/demo/store'
import { getDemoSessionFromCookies } from '@/lib/demo/session'
import { createAppointmentSchema } from '@/lib/validations/booking'
import { checkBookingAnomaly } from '@/lib/booking/anomaly-detection'
import {
  bookingIpRatelimit,
  bookingUserRatelimit,
  getActiveBookingAppointmentHoldKey,
  getActiveBookingHoldTtlSeconds,
  getActiveBookingIpHoldKey,
  getProviderAvailabilityRewriteLockKey,
  redis,
  releaseRedisLockIfOwned,
} from '@/lib/upstash'
import { buildAppointmentNotes, getVisitTypeConsultationFee } from '@/lib/booking/policy'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { fetchPatientSummaryMap, fetchProviderSummaryMap } from '@/lib/appointments/profile-summaries'
import type { SummaryLookupClient } from '@/lib/appointments/profile-summaries'
import { hasPublicSupabaseEnv } from '@/lib/supabase/env'

type PaymentRecord = {
  status: 'created' | 'paid' | 'failed' | 'refunded'
  amount_inr: number
  gst_amount_inr: number
  created_at?: string
}

function firstValue<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set('Cache-Control', 'no-store')
  return response
}

function withSanitizedAppointmentNotes<T extends { notes: string | null; payments?: PaymentRecord[] | PaymentRecord | null }>(appointment: T) {
  const payments = Array.isArray(appointment.payments)
    ? [...appointment.payments]
    : appointment.payments ? [appointment.payments] : []
  const sortedPayments = payments.sort((left, right) => {
    const rightCreatedAt = right.created_at ? Date.parse(right.created_at) : 0
    const leftCreatedAt = left.created_at ? Date.parse(left.created_at) : 0
    return rightCreatedAt - leftCreatedAt
  })
  const latestPayment = sortedPayments[0] ?? null

  return {
    ...appointment,
    notes: null,
    provider_notes: null,
    payment_status: latestPayment?.status ?? null,
    payment_amount_inr: latestPayment?.amount_inr ?? null,
    payment_gst_amount_inr: latestPayment?.gst_amount_inr ?? null,
  }
}

async function releaseBookingHoldIfOwned(holdKey: string | null, expectedValue: string | null) {
  if (!holdKey || !expectedValue) {
    return
  }

  try {
    await releaseRedisLockIfOwned(holdKey, expectedValue)
  } catch (error) {
    console.error('[api/appointments] Failed to release booking hold:', error)
  }
}

async function isProviderAvailabilityBeingUpdated(providerId: string) {
  const availabilityRewriteLockKey = getProviderAvailabilityRewriteLockKey(providerId)
  const activeAvailabilityRewrite = await redis.get<string>(availabilityRewriteLockKey)

  return typeof activeAvailabilityRewrite === 'string' && activeAvailabilityRewrite.trim().length > 0
}

export async function POST(request: NextRequest) {
  if (!hasPublicSupabaseEnv()) {
    return jsonNoStore(
      { error: 'Booking is temporarily unavailable while authentication is being configured.' },
      { status: 503 },
    )
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })

  const ip = getRequestIpAddress(request) ?? 'anonymous'
  try {
    const ipRateLimit = await bookingIpRatelimit.limit(`appointments:create:${ip}`)
    if (!ipRateLimit.success) {
      return jsonNoStore({ error: 'Too many booking attempts. Please try again shortly.' }, { status: 429 })
    }
  } catch (error) {
    console.error('[api/appointments] IP rate-limit unavailable:', error)
    return jsonNoStore({ error: 'Booking protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[api/appointments] Failed to verify booking role:', profileError)
    return jsonNoStore({ error: 'Failed to verify booking access' }, { status: 500 })
  }

  if (profile?.role !== 'patient') {
    return jsonNoStore({ error: 'Only patient accounts can create bookings.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonNoStore({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = createAppointmentSchema.safeParse(body)
  if (!parsed.success) return jsonNoStore({ error: parsed.error.flatten() }, { status: 400 })

  const { provider_id, availability_id, location_id, visit_type, notes, patient_address } = parsed.data
  const activeIpHoldKey = ip ? getActiveBookingIpHoldKey(ip, provider_id) : null
  const provisionalHoldToken = activeIpHoldKey ? `pending:${user.id}:${crypto.randomUUID()}` : null

  if (visit_type === 'home_visit' && !patient_address?.trim()) {
    return jsonNoStore({ error: 'A patient address is required for home visits.' }, { status: 400 })
  }

  try {
    if (await isProviderAvailabilityBeingUpdated(provider_id)) {
      return jsonNoStore({ error: 'Provider availability is being updated. Please retry in a few seconds.' }, { status: 503 })
    }
  } catch (error) {
    console.error('[api/appointments] Availability rewrite lock unavailable:', error)
    return jsonNoStore({ error: 'Booking protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }

  const { data: existingBookings, error: existingBookingsError } = await supabaseAdmin
    .from('appointments')
    .select('id, provider_id, availabilities!inner (starts_at), payments (status)')
    .eq('patient_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .gte('availabilities.starts_at', new Date().toISOString())

  if (existingBookingsError) {
    return jsonNoStore({ error: 'Failed to validate existing bookings' }, { status: 500 })
  }

  const hasUnpaidUpcomingBooking = (existingBookings ?? []).some((appointment) => {
    const payments = Array.isArray(appointment.payments)
      ? appointment.payments
      : appointment.payments ? [appointment.payments] : []

    return !payments.some((payment) => payment?.status === 'paid')
  })

  if (hasUnpaidUpcomingBooking) {
    return jsonNoStore(
      { error: 'Only one unpaid upcoming booking can be held at a time. Please complete, pay for, or cancel your current booking before reserving another slot.' },
      { status: 409 },
    )
  }

  const { data: slot, error: slotError } = await supabase
    .from('availabilities')
    .select('id, provider_id, location_id, starts_at, is_booked, is_blocked, providers!inner (consultation_fee_inr)')
    .eq('id', availability_id)
    .single()

  if (slotError || !slot || slot.is_booked || slot.is_blocked) {
    return jsonNoStore({ error: 'Slot unavailable' }, { status: 409 })
  }

  if (slot.provider_id !== provider_id) {
    return jsonNoStore({ error: 'Selected slot details changed. Please refresh and try again.' }, { status: 409 })
  }

  if (Date.parse(slot.starts_at as string) <= Date.now()) {
    return jsonNoStore({ error: 'Slot unavailable' }, { status: 409 })
  }

  if (!slot.location_id) {
    return jsonNoStore({ error: 'Selected slot is missing a provider location. Please choose another slot.' }, { status: 409 })
  }

  if (location_id && slot.location_id !== location_id) {
    return jsonNoStore({ error: 'Selected slot location changed. Please refresh and try again.' }, { status: 409 })
  }

  const { data: slotLocation, error: locationError } = await supabase
    .from('locations')
    .select('visit_type')
    .eq('id', slot.location_id)
    .maybeSingle()

  if (locationError) {
    return jsonNoStore({ error: 'Failed to validate slot location' }, { status: 500 })
  }

  if (slotLocation && !slotLocation.visit_type.includes(visit_type)) {
    return jsonNoStore({ error: 'Selected slot is not available for that visit type.' }, { status: 409 })
  }

  if (activeIpHoldKey && provisionalHoldToken) {
    try {
      const holdAcquired = await redis.set(activeIpHoldKey, provisionalHoldToken, { nx: true, ex: 10 * 60 })

      if (holdAcquired !== 'OK') {
        return jsonNoStore(
          { error: 'Only one unpaid upcoming booking can be held from the same network for this provider at a time. Please complete, pay for, or cancel the existing booking before reserving another slot.' },
          { status: 409 },
        )
      }
    } catch (error) {
      console.error('[api/appointments] Active booking hold unavailable:', error)
      return jsonNoStore({ error: 'Booking protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    }
  }

  try {
    if (await isProviderAvailabilityBeingUpdated(provider_id)) {
      await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)
      return jsonNoStore({ error: 'Provider availability is being updated. Please retry in a few seconds.' }, { status: 503 })
    }
  } catch (error) {
    await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)
    console.error('[api/appointments] Availability rewrite lock unavailable:', error)
    return jsonNoStore({ error: 'Booking protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }

  const { data: reservedSlot, error: reserveError } = await supabaseAdmin
    .from('availabilities')
    .update({ is_booked: true })
    .eq('id', availability_id)
    .eq('is_booked', false)
    .eq('is_blocked', false)
    .select('id')
    .maybeSingle()

  if (reserveError || !reservedSlot) {
    await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)
    return jsonNoStore({ error: 'Slot unavailable' }, { status: 409 })
  }

  try {
    const rateLimit = await bookingUserRatelimit.limit(`appointments:create:${user.id}`)
    if (!rateLimit.success) {
      await supabaseAdmin.from('availabilities').update({ is_booked: false }).eq('id', availability_id)
      await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)
      return jsonNoStore({ error: 'Too many booking attempts. Please try again shortly.' }, { status: 429 })
    }
  } catch (error) {
    await supabaseAdmin.from('availabilities').update({ is_booked: false }).eq('id', availability_id)
    await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)
    console.error('[api/appointments] User rate-limit unavailable:', error)
    return jsonNoStore({ error: 'Booking protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }

  const baseFeeInr = (slot.providers as unknown as { consultation_fee_inr: number }).consultation_fee_inr
  const feeInr = getVisitTypeConsultationFee(baseFeeInr, visit_type)
  const appointmentNotes = buildAppointmentNotes({
    visitType: visit_type,
    notes,
    patientAddress: patient_address,
  })

  const { data: appointment, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      patient_id: user.id,
      provider_id: slot.provider_id,
      availability_id,
      location_id: slot.location_id,
      visit_type,
      status: 'confirmed',
      fee_inr: feeInr,
      notes: appointmentNotes,
    })
    .select()
    .single()

  if (error) {
    await supabaseAdmin
      .from('availabilities')
      .update({ is_booked: false })
      .eq('id', availability_id)
    await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)

    console.error('[api/appointments] Insert error:', error)
    return jsonNoStore({ error: 'Failed to create appointment' }, { status: 500 })
  }

  if (activeIpHoldKey && provisionalHoldToken) {
    const appointmentHoldKey = getActiveBookingAppointmentHoldKey(appointment.id as string)
    const holdTtlSeconds = getActiveBookingHoldTtlSeconds(slot.starts_at as string | null | undefined)

    try {
      const currentHoldValue = await redis.get<string>(activeIpHoldKey)

      if (currentHoldValue !== provisionalHoldToken) {
        throw new Error('Booking hold ownership changed before persistence.')
      }

      await redis.set(activeIpHoldKey, appointment.id, { ex: holdTtlSeconds })
      await redis.set(appointmentHoldKey, activeIpHoldKey, { ex: holdTtlSeconds })
    } catch (error) {
      await supabaseAdmin.from('appointments').delete().eq('id', appointment.id)
      await supabaseAdmin
        .from('availabilities')
        .update({ is_booked: false })
        .eq('id', availability_id)
      await redis.del(appointmentHoldKey)
      await releaseBookingHoldIfOwned(activeIpHoldKey, appointment.id as string)
      await releaseBookingHoldIfOwned(activeIpHoldKey, provisionalHoldToken)

      console.error('[api/appointments] Failed to persist active booking hold:', error)
      return jsonNoStore({ error: 'Booking protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    }
  }

  // Fire-and-forget anomaly detection — never blocks the response
  checkBookingAnomaly({
    appointmentId: appointment.id as string,
    patientId: user.id,
    providerId: slot.provider_id as string,
    feeInr: feeInr,
    visitType: visit_type,
    bookedAt: new Date().toISOString(),
  }).catch(() => {
    // Intentionally swallowed — anomaly detection must never affect the booking
  })

  // SEC-08: Always create a payment record so every booking has a payment trace.
  // For now, all bookings default to pay_at_clinic (gateway-based online payment
  // will create a separate 'razorpay' record via the payments/create-order flow).
  const gstAmountInr = Math.round(feeInr * 0.18)
  const { error: paymentError } = await supabaseAdmin
    .from('payments')
    .insert({
      appointment_id: appointment.id,
      amount_inr: feeInr,
      gst_amount_inr: gstAmountInr,
      status: 'created',
      gateway: 'pay_at_clinic',
    })

  if (paymentError) {
    console.error('[api/appointments] Failed to create pay_at_clinic payment record:', paymentError)
    // Payment record failure is not user-facing — the appointment is valid.
    // Log and continue so ops can reconcile manually.
  }

  return jsonNoStore(withSanitizedAppointmentNotes(appointment), { status: 201 })
}

export async function GET(request: NextRequest) {
  const demoSession = await getDemoSessionFromCookies(request.cookies)
  const dashboardView = request.nextUrl.searchParams.get('view') === 'dashboard'

  if (!hasPublicSupabaseEnv()) {
    if (demoSession) {
      if (dashboardView && demoSession.role === 'patient') {
        const demoAppointments = getDemoAppointments('patient')

        return jsonNoStore({
          appointments: demoAppointments.map((appointment) => ({
            id: appointment.id,
            status: appointment.status,
            visit_type: appointment.visit_type,
            fee_inr: appointment.fee_inr,
            availabilities: appointment.availabilities
              ? { starts_at: appointment.availabilities.starts_at }
              : null,
            providers: 'providers' in appointment ? appointment.providers : null,
            locations: appointment.locations
              ? { city: appointment.locations.city }
              : null,
          })),
        })
      }

      return jsonNoStore({ appointments: getDemoAppointments(demoSession.role) })
    }

    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const activeDemoSession = !user ? demoSession : null

  if (!user && activeDemoSession) {
    if (dashboardView && activeDemoSession.role === 'patient') {
      const demoAppointments = getDemoAppointments('patient')

      return jsonNoStore({
        appointments: demoAppointments.map((appointment) => ({
          id: appointment.id,
          status: appointment.status,
          visit_type: appointment.visit_type,
          fee_inr: appointment.fee_inr,
          availabilities: appointment.availabilities
            ? { starts_at: appointment.availabilities.starts_at }
            : null,
          providers: 'providers' in appointment ? appointment.providers : null,
          locations: appointment.locations
            ? { city: appointment.locations.city }
            : null,
        })),
      })
    }

    return jsonNoStore({ appointments: getDemoAppointments(activeDemoSession.role) })
  }

  if (!user) return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })

  // Check user role (patient or provider)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[api/appointments] Failed to verify user role:', profileError)
    return jsonNoStore({ error: 'Failed to verify appointments access' }, { status: 500 })
  }

  if (profile?.role !== 'patient' && profile?.role !== 'provider') {
    return jsonNoStore({ error: 'Forbidden' }, { status: 403 })
  }

  const role = profile.role

  const { supabaseAdmin } = await import('@/lib/supabase/admin')
  const appointmentSummaryClient = supabaseAdmin as unknown as SummaryLookupClient

  if (role === 'patient' && dashboardView) {
    const { data: dashboardAppointments, error } = await supabaseAdmin
      .from('appointments')
      .select('id, status, visit_type, fee_inr, provider_id, availabilities (starts_at), locations (city)')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[api/appointments] Fetch error:', error)
      return jsonNoStore({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    const providerSummaryById = await fetchProviderSummaryMap(
      appointmentSummaryClient,
      (dashboardAppointments ?? []).map((appointment) => appointment.provider_id as string),
    )

    return jsonNoStore({
      appointments: (dashboardAppointments ?? []).map((appointment) => {
        const availability = firstValue(appointment.availabilities)
        const location = firstValue(appointment.locations)

        return {
          id: appointment.id,
          status: appointment.status,
          visit_type: appointment.visit_type,
          fee_inr: appointment.fee_inr,
          availabilities: availability
            ? { starts_at: availability.starts_at }
            : null,
          providers: providerSummaryById.get(appointment.provider_id as string) ?? null,
          locations: location
            ? { city: location.city }
            : null,
        }
      }),
    })
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*, availabilities (*), locations (*), payments (status, amount_inr, gst_amount_inr, created_at)')
    .eq(role === 'provider' ? 'provider_id' : 'patient_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[api/appointments] Fetch error:', error)
    return jsonNoStore({ error: 'Failed to fetch appointments' }, { status: 500 })
  }

  if (role === 'provider') {
    const patientSummaryById = await fetchPatientSummaryMap(
      appointmentSummaryClient,
      (data ?? []).map((appointment) => appointment.patient_id as string),
    )

    return jsonNoStore({
      appointments: (data ?? []).map((appointment) => {
        const patientSummary = patientSummaryById.get(appointment.patient_id as string)

        return withSanitizedAppointmentNotes({
          ...appointment,
          patient: patientSummary
            ? {
                id: patientSummary.id,
                full_name: patientSummary.full_name,
                phone: patientSummary.phone,
                avatar_url: patientSummary.avatar_url,
              }
            : null,
        })
      }),
    })
  }

  const providerSummaryById = await fetchProviderSummaryMap(
    appointmentSummaryClient,
    (data ?? []).map((appointment) => appointment.provider_id as string),
  )

  return jsonNoStore({
    appointments: (data ?? []).map((appointment) =>
      withSanitizedAppointmentNotes({
        ...appointment,
        providers: providerSummaryById.get(appointment.provider_id as string) ?? null,
      }),
    ),
  })
}
