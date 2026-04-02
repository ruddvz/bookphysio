import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const onboardSchema = z.object({
  step1: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().optional(),
  }),
  step2: z.object({
    icpNumber: z.string(),
    degree: z.string(),
    experienceYears: z.string(),
    specialties: z.array(z.string()),
  }),
  step3: z.object({
    clinicName: z.string(),
    address: z.string(),
    city: z.string(),
    pincode: z.string(),
    visitTypes: z.array(z.string()),
  }),
  step4: z.object({
    fees: z.record(z.string(), z.string()),
    slotDuration: z.string(),
    availability: z.record(z.string(), z.unknown()),
  }),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
        icp_registration_no: step2.icpNumber,
        consultation_fee_inr: parseInt(step4.fees.in_clinic || step4.fees.home_visit || '0'),
        verified: false,
        active: false, // Inactive until admin approves
        onboarding_step: 4
      })
      .select()
      .single()

    if (providerError) throw providerError

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

    // 4. Handle Specialties (Assuming Specialties table has name matches or just inserting for now)
    // In a real app, we'd fetch IDs for specialty names. 
    // For now, we'll try to find them or skip if logic is complex.
    // Let's assume we have a table 'specialties' and we link them.
    const { data: existingSpecialties } = await supabaseAdmin
      .from('specialties')
      .select('id, name')
    
    if (existingSpecialties) {
      const selectedIds = existingSpecialties
        .filter(s => step2.specialties.includes(s.name))
        .map(s => s.id)
      
      if (selectedIds.length > 0) {
        await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', user.id)
        await supabaseAdmin.from('provider_specialties').insert(
          selectedIds.map(sid => ({ provider_id: user.id, specialty_id: sid }))
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('Onboarding error:', error)
    const message = error instanceof Error ? error.message : 'Onboarding failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
