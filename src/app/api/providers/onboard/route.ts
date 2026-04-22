import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { parseIndiaDate } from '@/lib/india-date'
import { z } from 'zod'
import {
  buildAvailabilitySlotsInIndia,
  type DayName,
  getProviderAvailabilityWindow,
  type ProviderMultiSlotSchedule,
  validateProviderSchedule,
} from '@/lib/provider-availability'

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
    if (!(dayName in schedule)) {
      continue
    }

    schedule[dayName] = 'slots' in config
      ? {
          enabled: config.enabled,
          slots: config.slots,
        }
      : {
          enabled: config.enabled,
          slots: config.enabled ? [{ start: config.start, end: config.end }] : [],
        }
  }

  return schedule
}

const onboardSchema = z.object({
  step1: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
    phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91XXXXXXXXXX)'),
    email: z.string().email('Enter a valid email address').optional(),
  }),
  step2: z.object({
    registrationType: z.enum(['IAP', 'STATE']).default('IAP'),
    iapNumber: z.string().max(50).optional(),
    stateRegistrationNumber: z.string().max(50).optional(),
    stateName: z.string().max(100).optional(),
    degree: z.enum(['BPT', 'MPT', 'PhD', 'DPT']),
    experienceYears: z.string().regex(/^\d{1,2}$/, 'Experience years must be a number'),
    specialties: z.array(z.string().min(1).max(100)).min(1, 'Select at least one specialty').max(20),
    certifications: z.array(z.string().trim().min(1).max(100)).max(20).optional().default([]),
    equipmentTags: z.array(z.string().trim().min(1).max(100)).max(30).optional().default([]),
  }),
  step3: z.object({
    clinicName: z.string().min(2).max(200),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
    visitTypes: z.array(z.enum(['in_clinic', 'home_visit', 'online'])).min(1, 'Select at least one visit type'),
  }),
  step4: z.object({
    fees: z.record(z.string(), z.coerce.number().int().min(0).max(999999)),
    slotDuration: z.coerce.number().int().min(15).max(120),
    availability: z.record(z.string(), onboardingAvailabilityDaySchema),
  }),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Track what we created so we can roll back on partial failure.
  let providerCreated = false
  let locationCreated = false
  let specialtiesLinked = false

  try {
    const body = await request.json()
    const validated = onboardSchema.parse(body)
    const { step1, step2, step3, step4 } = validated
    const providerSlug = slugifyProviderName(step1.name, user.id)
    const multiSlotSchedule = normalizeOnboardingAvailability(step4.availability)
    const scheduleErrors = validateProviderSchedule(multiSlotSchedule)

    if (Object.keys(scheduleErrors).length > 0) {
      return NextResponse.json(
        {
          error: 'Some onboarding fields are invalid. Please review and try again.',
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

    // 1. Mark the user as provider_pending. They cannot access the provider
    // portal until an admin approves the listing (sets role → 'provider').
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        full_name: step1.name,
        role: 'provider_pending',
      })
      .eq('id', user.id)

    if (userError) throw userError

    const { error: authUserError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          full_name: step1.name,
          phone: step1.phone,
          provider_pending: true,
          role: 'provider_pending',
        },
      })

    if (authUserError) throw authUserError

    const { data: existingSpecialties, error: specialtiesError } = await supabaseAdmin
      .from('specialties')
      .select('id, name')

    if (specialtiesError) throw specialtiesError

    const selectedIds = (existingSpecialties ?? [])
      .filter((specialty) => step2.specialties.includes(specialty.name))
      .map((specialty) => specialty.id)

    const qualificationValue = step2.degree

    // 2. Create provider profile
    const { error: providerError } = await supabaseAdmin
      .from('providers')
      .upsert({
        id: user.id, // ID matches user ID
        slug: providerSlug,
        title: step2.degree.includes('Dr') ? 'Dr.' : 'PT',
        experience_years: parseInt(step2.experienceYears),
        iap_registration_no: step2.registrationType === 'STATE'
          ? `STATE_${step2.stateName}_${step2.stateRegistrationNumber}`
          : (step2.iapNumber || ''),
        specialty_ids: selectedIds,
        consultation_fee_inr: step4.fees.in_clinic || step4.fees.home_visit || 0,
        qualification: qualificationValue,
        certifications: step2.certifications ?? [],
        equipment_tags: step2.equipmentTags ?? [],
        verified: false,
        active: false,
        onboarding_step: 4,
      })
      .select()
      .single()

    if (providerError) throw providerError
    providerCreated = true

    // 3. Create Location
    const { data: locationRow, error: locError } = await supabaseAdmin
      .from('locations')
      .insert({
        provider_id: user.id,
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

    // 4. Link Specialties by name match (best-effort — taxonomy is admin-managed)
    if (selectedIds.length > 0) {
      await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', user.id)
      const { error: linkError } = await supabaseAdmin
        .from('provider_specialties')
        .insert(selectedIds.map(sid => ({ provider_id: user.id, specialty_id: sid })))

      if (linkError) throw linkError
      specialtiesLinked = true
    }

    // 5. Seed recurring availability during onboarding so it is ready for later activation after approval.
    if (locationRow?.id) {
      const { startDateKey, endDateKey } = getProviderAvailabilityWindow(4)
      const seedWindowStart = parseIndiaDate(startDateKey).toISOString()
      const seedWindowEnd = new Date(
        parseIndiaDate(endDateKey).getTime() + 24 * 60 * 60 * 1000 - 1,
      ).toISOString()

      const { error: deleteAvailabilityError } = await supabaseAdmin
        .from('availabilities')
        .delete()
        .eq('provider_id', user.id)
        .eq('is_booked', false)
        .eq('is_blocked', false)
        .gte('starts_at', seedWindowStart)
        .lte('starts_at', seedWindowEnd)

      if (deleteAvailabilityError) throw deleteAvailabilityError

      const generatedSlots = buildAvailabilitySlotsInIndia({
        schedule: multiSlotSchedule,
        durationMinutes: step4.slotDuration,
        weeks: 4,
        providerId: user.id,
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

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('Onboarding error:', error)

    // Best-effort rollback so a half-onboarded provider doesn't linger.
    // Order matters: child rows (specialties, locations) before parent (providers).
    // Only delete rows that were created in THIS request (tracked by the boolean flags).
    if (specialtiesLinked) {
      const { error: specRollbackError } = await supabaseAdmin
        .from('provider_specialties')
        .delete()
        .eq('provider_id', user.id)
      if (specRollbackError) console.error('Rollback provider_specialties failed:', specRollbackError)
    }
    if (locationCreated) {
      const { error: locRollbackError } = await supabaseAdmin
        .from('locations')
        .delete()
        .eq('provider_id', user.id)
      if (locRollbackError) console.error('Rollback locations failed:', locRollbackError)
    }
    if (providerCreated) {
      const { error: provRollbackError } = await supabaseAdmin
        .from('providers')
        .delete()
        .eq('id', user.id)
      if (provRollbackError) console.error('Rollback providers failed:', provRollbackError)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Some onboarding fields are invalid. Please review and try again.' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Onboarding failed. Please try again or contact support.' },
      { status: 500 },
    )
  }
}
