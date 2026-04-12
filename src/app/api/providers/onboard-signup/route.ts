import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { otpRatelimit } from '@/lib/upstash'
import { parseIndiaDate } from '@/lib/india-date'
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
    registrationType: z.enum(['IAP', 'STATE']).default('IAP'),
    iapNumber: z.string().max(50).optional(),
    stateRegistrationNumber: z.string().max(50).optional(),
    stateName: z.string().max(100).optional(),
    degree: z.string().min(1).max(100),
    experienceYears: z.string().regex(/^\d{1,2}$/, 'Experience years must be a number'),
    specialties: z.array(z.string().min(1).max(100)).min(1, 'Select at least one specialty').max(20),
  }),
  step3: z.object({
    clinicName: z.string().min(2).max(200),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
    visitTypes: z.array(z.enum(['in_clinic', 'home_visit'])).min(1, 'Select at least one visit type'),
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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit by IP to prevent abuse (no auth session required on this endpoint)
  const ip = getRequestIpAddress(request) ?? 'unknown'
  try {
    const ipLimit = await otpRatelimit.limit(`provider-signup:ip:${ip}`)
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 },
      )
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
    // 1. Create the Supabase auth user via admin API.
    //    email_confirm: false causes Supabase to send a confirmation email.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: step1.name,
        phone: step1.phone,
        role: 'provider',
      },
    })

    if (authError || !authData.user) {
      if (authError?.message?.toLowerCase().includes('already registered') ||
          authError?.message?.toLowerCase().includes('already been registered') ||
          authError?.code === 'email_exists') {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 },
        )
      }
      console.error('Provider signup: auth user creation failed', authError)
      return NextResponse.json(
        { error: 'Unable to create account. Please try again.' },
        { status: 500 },
      )
    }

    userId = authData.user.id

    // 2. The handle_new_user DB trigger fires on auth.users INSERT and creates
    //    the users row with role='provider' (from user_metadata.role).
    //    Update additional fields that the trigger doesn't set.
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ full_name: step1.name, role: 'provider' })
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const providerSlug = slugifyProviderName(step1.name, userId!)
    const { error: providerError } = await supabaseAdmin
      .from('providers')
      .upsert({
        id: userId,
        slug: providerSlug,
        title: step2.degree.toLowerCase().includes('dr') ? 'Dr.' : 'PT',
        experience_years: parseInt(step2.experienceYears),
        iap_registration_no: step2.registrationType === 'STATE'
          ? `STATE_${step2.stateName}_${step2.stateRegistrationNumber}`
          : (step2.iapNumber || ''),
        specialty_ids: selectedIds,
        consultation_fee_inr: step4.fees.in_clinic || step4.fees.home_visit || 0,
        verified: false,
        active: false,
        onboarding_step: 4,
      })
      .select()
      .single()

    if (providerError) throw providerError
    providerCreated = true

    // 5. Create location
    const { data: locationRow, error: locError } = await supabaseAdmin
      .from('locations')
      .insert({
        provider_id: userId,
        name: step3.clinicName,
        address: step3.address,
        city: step3.city,
        state: step3.state,
        pincode: step3.pincode,
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
    const multiSlotSchedule = normalizeOnboardingAvailability(step4.availability)
    const scheduleErrors = validateProviderSchedule(multiSlotSchedule)

    if (Object.keys(scheduleErrors).length > 0) {
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        providerId: userId!,
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

    return NextResponse.json({ success: true }, { status: 201 })

  } catch (error: unknown) {
    console.error('Provider onboard-signup error:', error)

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
      // The handle_new_user trigger creates a users row when the auth user is created;
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
      { error: 'Registration failed. Please try again or contact support.' },
      { status: 500 },
    )
  }
}
