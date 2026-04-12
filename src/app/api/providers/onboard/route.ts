import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

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

type OnboardPayload = z.infer<typeof onboardSchema>

interface RollbackState {
  providerCreated: boolean
  createdLocationIds: string[]
  previousSpecialtyIds: string[]
  selectedSpecialtyIds: string[]
  specialtiesReplaced: boolean
}

async function validatePayload(request: NextRequest): Promise<OnboardPayload> {
  const body = await request.json()
  return onboardSchema.parse(body)
}

async function updateUserMetadata(userId: string, step1: OnboardPayload['step1']): Promise<void> {
  const { error: userError } = await supabaseAdmin
    .from('users')
    .update({
      full_name: step1.name,
    })
    .eq('id', userId)

  if (userError) {
    throw userError
  }

  const { error: authUserError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      full_name: step1.name,
      phone: step1.phone,
      provider_pending: true,
    },
  })

  if (authUserError) {
    throw authUserError
  }
}

async function createProviderProfile(
  userId: string,
  step2: OnboardPayload['step2'],
  step4: OnboardPayload['step4'],
): Promise<boolean> {
  const { data: existingProvider, error: existingProviderError } = await supabaseAdmin
    .from('providers')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (existingProviderError) {
    throw existingProviderError
  }

  const { error: providerError } = await supabaseAdmin
    .from('providers')
    .upsert({
      id: userId,
      title: step2.degree.includes('Dr') ? 'Dr.' : 'PT',
      experience_years: Number.parseInt(step2.experienceYears, 10),
      iap_registration_no: step2.registrationType === 'STATE'
        ? `STATE_${step2.stateName}_${step2.stateRegistrationNumber}`
        : (step2.iapNumber || ''),
      consultation_fee_inr: Number.parseInt(step4.fees.in_clinic || step4.fees.home_visit || '0', 10),
      verified: false,
      active: false,
      onboarding_step: 4,
    })

  if (providerError) {
    throw providerError
  }

  return !existingProvider
}

async function createLocation(
  userId: string,
  step3: OnboardPayload['step3'],
): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('locations')
    .insert({
      provider_id: userId,
      name: step3.clinicName,
      address: step3.address,
      city: step3.city,
      pincode: step3.pincode,
      visit_type: step3.visitTypes,
    })
    .select('id')

  if (error) {
    throw error
  }

  return (data ?? []).map((location) => location.id as string)
}

async function linkSpecialties(
  userId: string,
  step2: OnboardPayload['step2'],
  rollbackState: RollbackState,
): Promise<void> {
  const { data: existingSpecialties, error: specialtiesError } = await supabaseAdmin
    .from('specialties')
    .select('id, name')

  if (specialtiesError) {
    throw specialtiesError
  }

  const selectedSpecialtyIds = (existingSpecialties ?? [])
    .filter((specialty) => step2.specialties.includes(specialty.name as string))
    .map((specialty) => specialty.id as string)

  if (selectedSpecialtyIds.length === 0) {
    return
  }

  const { data: existingLinks, error: existingLinksError } = await supabaseAdmin
    .from('provider_specialties')
    .select('specialty_id')
    .eq('provider_id', userId)

  if (existingLinksError) {
    throw existingLinksError
  }

  rollbackState.previousSpecialtyIds = (existingLinks ?? []).map((link) => link.specialty_id as string)
  rollbackState.selectedSpecialtyIds = selectedSpecialtyIds
  rollbackState.specialtiesReplaced = true

  const { error: deleteError } = await supabaseAdmin
    .from('provider_specialties')
    .delete()
    .eq('provider_id', userId)

  if (deleteError) {
    throw deleteError
  }

  const { error: insertError } = await supabaseAdmin
    .from('provider_specialties')
    .insert(selectedSpecialtyIds.map((specialtyId) => ({ provider_id: userId, specialty_id: specialtyId })))

  if (insertError) {
    throw insertError
  }
}

async function rollbackOnboard(userId: string, state: RollbackState): Promise<void> {
  if (state.specialtiesReplaced) {
    if (state.selectedSpecialtyIds.length > 0) {
      const { error: cleanupNewSpecialtiesError } = await supabaseAdmin
        .from('provider_specialties')
        .delete()
        .eq('provider_id', userId)
        .in('specialty_id', state.selectedSpecialtyIds)

      if (cleanupNewSpecialtiesError) {
        console.error('Rollback provider_specialties cleanup failed:', cleanupNewSpecialtiesError)
      }
    }

    if (state.previousSpecialtyIds.length > 0) {
      const { error: restoreSpecialtiesError } = await supabaseAdmin
        .from('provider_specialties')
        .upsert(
          state.previousSpecialtyIds.map((specialtyId) => ({
            provider_id: userId,
            specialty_id: specialtyId,
          })),
          { onConflict: 'provider_id,specialty_id' },
        )

      if (restoreSpecialtiesError) {
        console.error('Rollback provider_specialties restore failed:', restoreSpecialtiesError)
      }
    }
  }

  if (state.createdLocationIds.length > 0) {
    const { error: locationRollbackError } = await supabaseAdmin
      .from('locations')
      .delete()
      .in('id', state.createdLocationIds)

    if (locationRollbackError) {
      console.error('Rollback locations failed:', locationRollbackError)
    }
  }

  if (state.providerCreated) {
    const { error: providerRollbackError } = await supabaseAdmin
      .from('providers')
      .delete()
      .eq('id', userId)

    if (providerRollbackError) {
      console.error('Rollback providers failed:', providerRollbackError)
    }
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rollbackState: RollbackState = {
    providerCreated: false,
    createdLocationIds: [],
    previousSpecialtyIds: [],
    selectedSpecialtyIds: [],
    specialtiesReplaced: false,
  }

  try {
    const { step1, step2, step3, step4 } = await validatePayload(request)

    await updateUserMetadata(user.id, step1)
    rollbackState.providerCreated = await createProviderProfile(user.id, step2, step4)
    rollbackState.createdLocationIds = await createLocation(user.id, step3)
    await linkSpecialties(user.id, step2, rollbackState)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Onboarding error:', error)
    await rollbackOnboard(user.id, rollbackState)

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
