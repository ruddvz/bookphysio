import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { assertEmailServiceConfigured } from '@/lib/email/preflight'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { otpRatelimit } from '@/lib/upstash'
import { parseIndiaDate } from '@/lib/india-date'
import { createAndSendEmailOtp } from '@/lib/auth/email-otp'
import { sendAdminNewProviderAlert } from '@/lib/resend'
import { z } from 'zod'
import {
  buildAvailabilitySlotsInIndia,
  type DayName,
  getProviderAvailabilityWindow,
  type ProviderMultiSlotSchedule,
  validateProviderSchedule,
} from '@/lib/provider-availability'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const daySlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
})

const onboardingAvailabilityDaySchema = z.union([
  z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),
  z.object({
    enabled: z.boolean(),
    slots: z.array(daySlotSchema),
  }),
])

const onboardSignupSchema = z.object({
  // Credentials (used to create the Supabase auth user)
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Onboarding steps (same shape as the existing /api/providers/onboard endpoint)
  step1: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91XXXXXXXXXX)').optional(),
    email: z.string().email().optional(),
  }),
  step2: z.object({
    registrationType: z.enum(['NCAHP', 'IAP', 'STATE']).default('NCAHP'),
    ncahpNumber: z.string().max(50).optional(),
    iapNumber: z.string().max(50).optional(),
    stateRegistrationNumber: z.string().max(50).optional(),
    stateName: z.string().max(100).optional(),
    degree: z.string().min(1).max(100),
    experienceYears: z.string().regex(/^\d{1,2}$/, 'Experience years must be a number'),
    specialties: z.array(z.string().min(1).max(100)).min(1, 'Select at least one specialty').max(20),
    certifications: z.array(z.string().min(1).max(200)).max(20).optional().default([]),
  }).superRefine((data, context) => {
    if (data.registrationType === 'NCAHP') {
      if (!data.ncahpNumber?.trim() || data.ncahpNumber.trim().length < 3) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ncahpNumber'],
          message: 'NCAHP registration number must be at least 3 characters',
        })
      }
    }

    if (data.registrationType === 'IAP' && !data.iapNumber?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['iapNumber'],
        message: 'IAP registration number is required',
      })
    }

    if (data.registrationType === 'STATE') {
      if (!data.stateName?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stateName'],
          message: 'State council name is required',
        })
      }

      if (!data.stateRegistrationNumber?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stateRegistrationNumber'],
          message: 'State registration number is required',
        })
      }
    }
  }),
  step3: z.object({
    visitTypes: z.array(z.enum(['in_clinic', 'home_visit', 'online'])).min(1, 'Select at least one visit type'),
    clinicName: z.string().max(200).optional(),
    address: z.string().max(500).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode').optional().or(z.literal('')),
    modalities: z.array(z.string().min(1).max(200)).max(20).optional().default([]),
  }).superRefine((data, context) => {
    const isClinic = data.visitTypes.includes('in_clinic')
    if (isClinic) {
      if (!data.clinicName?.trim() || data.clinicName.trim().length < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['clinicName'],
          message: 'Clinic name is required',
        })
      }
      if (!data.address?.trim() || data.address.trim().length < 5) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Address is required',
        })
      }
      if (!data.pincode?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pincode'],
          message: 'Pincode is required',
        })
      }
    }
  }),
  step4: z.object({
    fees: z.record(z.string(), z.coerce.number().int().min(0).max(999999)),
    slotDuration: z.coerce.number().int().min(15).max(120),
    availability: z.record(z.string(), onboardingAvailabilityDaySchema),
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SHORT_DAY_TO_FULL_DAY: Record<string, DayName> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
}

function slugifyProviderName(name: string, userId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${base || 'provider'}-${userId.slice(0, 8)}`
}

function normalizeOnboardingAvailability(
  availability: Record<string, z.infer<typeof onboardingAvailabilityDaySchema>>,
): ProviderMultiSlotSchedule {
  const schedule: ProviderMultiSlotSchedule = {
    Monday: { enabled: false, slots: [] },
    Tuesday: { enabled: false, slots: [] },
    Wednesday: { enabled: false, slots: [] },
    Thursday: { enabled: false, slots: [] },
    Friday: { enabled: false, slots: [] },
    Saturday: { enabled: false, slots: [] },
    Sunday: { enabled: false, slots: [] },
  }

  for (const [inputDay, config] of Object.entries(availability)) {
    const dayName = (SHORT_DAY_TO_FULL_DAY[inputDay] ?? inputDay) as DayName
    if (!(dayName in schedule)) continue

    schedule[dayName] = 'slots' in config
      ? { enabled: config.enabled, slots: config.slots }
      : { enabled: config.enabled, slots: config.enabled ? [{ start: config.start, end: config.end }] : [] }
  }

  return schedule
}

function buildScheduleErrorResponse(scheduleErrors: Record<string, string>) {
  return NextResponse.json(
    {
      error: 'Some availability fields are invalid. Please review and try again.',
      details: {
        fieldErrors: Object.fromEntries(
          Object.entries(scheduleErrors).map(([field, message]) => [field, [message]]),
        ),
        formErrors: [],
      },
    },
    { status: 400 },
  )
}

function isAlreadyRegisteredAuthError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? ''
  return normalized.includes('already registered') || normalized.includes('already been registered')
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit by IP to prevent abuse (no auth session required on this endpoint)
  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`provider-signup:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json(
          { error: 'Too many signup attempts. Please try again later.' },
          { status: 429 },
        )
      }
    }
  } catch {
    // Rate limiter unavailable (e.g. no Upstash in dev) — allow through
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = onboardSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Some fields are invalid. Please review and try again.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { email, password, step1, step2, step3, step4 } = parsed.data
  const multiSlotSchedule = normalizeOnboardingAvailability(step4.availability)
  const scheduleErrors = validateProviderSchedule(multiSlotSchedule)

  if (Object.keys(scheduleErrors).length > 0) {
    return buildScheduleErrorResponse(scheduleErrors)
  }

  // Rate limit by email to prevent duplicate signups
  try {
    const emailLimit = await otpRatelimit.limit(`provider-signup:email:${email.toLowerCase()}`)
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 },
      )
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  // Track what was created for rollback on partial failure
  let userId: string | null = null
  let providerCreated = false
  let locationCreated = false
  let specialtiesLinked = false

  try {
    const emailPreflight = assertEmailServiceConfigured()
    if (!emailPreflight.ok) {
      return NextResponse.json(
        { error: 'Email service is temporarily unavailable. Please try again in a few minutes.' },
        { status: 503 },
      )
    }

    // 1. Create the Supabase auth user via the admin client.
    //    email_confirm: false — user must verify via our 6-digit OTP email (sent below),
    //    not Supabase's built-in mailer (which is disabled; all email goes via Resend).
    //
    //    NOTE: role is intentionally NOT set in user_metadata here.
    //    The handle_new_user trigger copies the metadata role into users.role, and
    //    passing 'provider_pending' would crash the trigger on databases where
    //    migration 040 hasn't been applied yet (CHECK constraint violation → 500).
    //    We set the role authoritatively via the UPDATE in step 2 below.
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: step1.name,
        phone: step1.phone,
      },
    })

    if (adminError) {
      if (isAlreadyRegisteredAuthError(adminError.message)) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 },
        )
      }
      console.error('Provider signup: admin user creation failed', { message: adminError.message, status: adminError.status })
      return NextResponse.json(
        { error: `Unable to create account: ${adminError.message}` },
        { status: 500 },
      )
    }

    if (!adminData.user) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 },
      )
    }

    userId = adminData.user.id

    // 2. The handle_new_user DB trigger fires on auth.users INSERT and creates
    //    the users row with role='provider' (from user_metadata.role).
    //    The trigger sets NEW.phone (null for email signups), so we also store
    //    the phone from the form data.
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ full_name: step1.name, role: 'provider_pending', phone: step1.phone ?? null })
      .eq('id', userId)

    if (userError) throw userError

    // 3. Resolve specialty IDs by name
    const { data: existingSpecialties, error: specialtiesError } = await supabaseAdmin
      .from('specialties')
      .select('id, name')

    if (specialtiesError) throw specialtiesError

    const selectedIds = (existingSpecialties ?? [])
      .filter((s: { id: string; name: string }) => step2.specialties.includes(s.name))
      .map((s: { id: string; name: string }) => s.id)

    // 4. Create provider profile
    const providerSlug = slugifyProviderName(step1.name, userId as string)
    const registrationRef =
      step2.registrationType === 'NCAHP' ? (step2.ncahpNumber ?? '') :
      step2.registrationType === 'IAP' ? (step2.iapNumber ?? '') :
      `STATE_${step2.stateName ?? ''}_${step2.stateRegistrationNumber ?? ''}`

    const { error: providerError } = await supabaseAdmin
      .from('providers')
      .upsert({
        id: userId,
        slug: providerSlug,
        title: step2.degree.toLowerCase().includes('dr') ? 'Dr.' : 'PT',
        experience_years: parseInt(step2.experienceYears),
        iap_registration_no: registrationRef,
        specialty_ids: selectedIds,
        consultation_fee_inr: step4.fees.in_clinic || step4.fees.home_visit || 0,
        certifications: step2.certifications ?? [],
        verified: false,
        active: true,
        onboarding_step: 4,
      })
      .select()
      .single()

    if (providerError) throw providerError
    providerCreated = true

    // 5. Create location
    // Home-visit-only providers have no physical clinic — pass null for pincode
    // to satisfy the DB CHECK constraint (which rejects empty strings).
    const isClinic = step3.visitTypes.includes('in_clinic')
    const { data: locationRow, error: locError } = await supabaseAdmin
      .from('locations')
      .insert({
        provider_id: userId,
        name: isClinic ? (step3.clinicName ?? '') : '',
        address: isClinic ? (step3.address ?? '') : '',
        city: step3.city,
        state: step3.state,
        pincode: isClinic ? (step3.pincode || null) : null,
        visit_type: step3.visitTypes,
      })
      .select('id')
      .single()

    if (locError) throw locError
    locationCreated = true

    // 6. Link specialties
    if (selectedIds.length > 0) {
      await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', userId)
      const { error: linkError } = await supabaseAdmin
        .from('provider_specialties')
        .insert(selectedIds.map((sid: string) => ({ provider_id: userId, specialty_id: sid })))

      if (linkError) throw linkError
      specialtiesLinked = true
    }

    // 7. Seed recurring availability
    if (locationRow?.id) {
      const { startDateKey, endDateKey } = getProviderAvailabilityWindow(4)
      const seedWindowStart = parseIndiaDate(startDateKey).toISOString()
      const seedWindowEnd = new Date(
        parseIndiaDate(endDateKey).getTime() + 24 * 60 * 60 * 1000 - 1,
      ).toISOString()

      const { error: deleteAvailabilityError } = await supabaseAdmin
        .from('availabilities')
        .delete()
        .eq('provider_id', userId)
        .eq('is_booked', false)
        .eq('is_blocked', false)
        .gte('starts_at', seedWindowStart)
        .lte('starts_at', seedWindowEnd)

      if (deleteAvailabilityError) throw deleteAvailabilityError

      const generatedSlots = buildAvailabilitySlotsInIndia({
        schedule: multiSlotSchedule,
        durationMinutes: step4.slotDuration,
        weeks: 4,
        providerId: userId as string,
        locationId: locationRow.id,
        bufferMins: 5,
      })

      if (generatedSlots.length > 0) {
        const { error: availabilityError } = await supabaseAdmin
          .from('availabilities')
          .insert(generatedSlots)

        if (availabilityError) throw availabilityError
      }
    }

    // 8. Send 6-digit email OTP via Resend so Step 5 can verify the provider's email.
    //    Fire-and-forget: a failure here does not roll back the signup; the provider
    //    can resend from Step 5 using /api/auth/email-otp/send.
    const otpResult = await createAndSendEmailOtp(email, userId as string)
    if (!otpResult.ok) {
      console.error('Provider signup: OTP send failed after user creation', otpResult.error)
    }

    // 9. Notify admin of new provider application (fire-and-forget).
    void sendAdminNewProviderAlert({
      providerName: step1.name,
      email,
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    })

    return NextResponse.json(
      {
        success: true,
        emailOtpStatus: otpResult.ok ? 'sent' : 'failed',
        ...(otpResult.ok ? {} : { emailOtpError: otpResult.error }),
      },
      { status: 201 },
    )

  } catch (error: unknown) {
    // Surface the actual error message for easier debugging
    const errMsg = error instanceof Error ? error.message
      : (typeof (error as { message?: string })?.message === 'string' ? (error as { message: string }).message : String(error))
    console.error('Provider onboard-signup error:', errMsg, error)

    // Best-effort rollback in reverse dependency order
    if (userId) {
      if (specialtiesLinked) {
        const { error: specRollbackError } = await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', userId)
        if (specRollbackError) console.error('Rollback provider_specialties failed:', specRollbackError)
      }
      if (locationCreated) {
        const { error: locRollbackError } = await supabaseAdmin.from('locations').delete().eq('provider_id', userId)
        if (locRollbackError) console.error('Rollback locations failed:', locRollbackError)
      }
      if (providerCreated) {
        const { error: provRollbackError } = await supabaseAdmin.from('providers').delete().eq('id', userId)
        if (provRollbackError) console.error('Rollback providers failed:', provRollbackError)
      }
      // Delete the auth user to allow re-signup with the same email.
      // The handle_new_user trigger creates a users row on auth.users INSERT;
      // deleting the auth user cascades to the users row via ON DELETE CASCADE on the FK.
      const { error: userRollbackError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (userRollbackError) console.error('Rollback auth user failed:', userRollbackError)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Some fields are invalid. Please review and try again.' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: `Registration failed: ${errMsg}` },
      { status: 500 },
    )
  }
}
