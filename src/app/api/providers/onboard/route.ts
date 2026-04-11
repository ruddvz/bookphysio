import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

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
    degree: z.string().min(1).max(100),
    experienceYears: z.string().regex(/^\d{1,2}$/, 'Experience years must be a number'),
    specialties: z.array(z.string().min(1).max(100)).min(1, 'Select at least one specialty').max(20),
  }),
  step3: z.object({
    clinicName: z.string().min(2).max(200),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
    visitTypes: z.array(z.enum(['in_clinic', 'home_visit'])).min(1, 'Select at least one visit type'),
  }),
  step4: z.object({
    fees: z.record(z.string(), z.string().regex(/^\d{1,6}$/, 'Fee must be a valid number')),
    slotDuration: z.string().regex(/^\d{1,3}$/, 'Slot duration must be a number'),
    availability: z.record(z.string(), z.unknown()),
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

    // 1. Update user metadata — role stays 'patient' until admin approves
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        full_name: step1.name
      })
      .eq('id', user.id)

    if (userError) throw userError

    const { error: authUserError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        full_name: step1.name,
        phone: step1.phone,
        provider_pending: true, // Admin must approve before role becomes 'provider'
      },
    })

    if (authUserError) throw authUserError

    // 2. Create provider profile
    const { error: providerError } = await supabaseAdmin
      .from('providers')
      .upsert({
        id: user.id, // ID matches user ID
        title: step2.degree.includes('Dr') ? 'Dr.' : 'PT',
        experience_years: parseInt(step2.experienceYears),
        iap_registration_no: step2.registrationType === 'STATE'
          ? `STATE_${step2.stateName}_${step2.stateRegistrationNumber}`
          : (step2.iapNumber || ''),
        consultation_fee_inr: parseInt(step4.fees.in_clinic || step4.fees.home_visit || '0'),
        verified: false,
        active: false, // Inactive until admin approves
        onboarding_step: 4
      })
      .select()
      .single()

    if (providerError) throw providerError
    providerCreated = true

    // 3. Create Location
    const { error: locError } = await supabaseAdmin
      .from('locations')
      .insert({
        provider_id: user.id,
        name: step3.clinicName,
        address: step3.address,
        city: step3.city,
        pincode: step3.pincode,
        visit_type: step3.visitTypes
      })

    if (locError) throw locError
    locationCreated = true

    // 4. Link Specialties by name match (best-effort — taxonomy is admin-managed)
    const { data: existingSpecialties } = await supabaseAdmin
      .from('specialties')
      .select('id, name')

    if (existingSpecialties) {
      const selectedIds = existingSpecialties
        .filter(s => step2.specialties.includes(s.name))
        .map(s => s.id)

      if (selectedIds.length > 0) {
        await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', user.id)
        const { error: linkError } = await supabaseAdmin
          .from('provider_specialties')
          .insert(selectedIds.map(sid => ({ provider_id: user.id, specialty_id: sid })))

        if (linkError) throw linkError
        specialtiesLinked = true
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('Onboarding error:', error)

    // Best-effort rollback so a half-onboarded provider doesn't linger.
    // Order matters: child rows (specialties, locations) before parent (providers).
    if (specialtiesLinked) {
      await supabaseAdmin
        .from('provider_specialties')
        .delete()
        .eq('provider_id', user.id)
        .then(undefined, (err: unknown) => console.error('Rollback provider_specialties failed:', err))
    }
    if (locationCreated) {
      await supabaseAdmin
        .from('locations')
        .delete()
        .eq('provider_id', user.id)
        .then(undefined, (err: unknown) => console.error('Rollback locations failed:', err))
    }
    if (providerCreated) {
      await supabaseAdmin
        .from('providers')
        .delete()
        .eq('id', user.id)
        .then(undefined, (err: unknown) => console.error('Rollback providers failed:', err))
    }

    const message = error instanceof z.ZodError
      ? 'Some onboarding fields are invalid. Please review and try again.'
      : 'Onboarding failed. Please try again or contact support.'

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
