import { NextResponse, type NextRequest } from 'next/server'
import { requireProviderAccess } from '@/app/api/provider/_lib/access'
import { updateDemoProviderProfile } from '@/lib/demo/provider-clinical'
import { updateProfileSchema } from '@/lib/clinical/types'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireProviderAccess(req)

  if (access instanceof NextResponse) {
    return access
  }

  const body = await req.json().catch(() => null)
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  if (access.isDemo) {
    const profile = updateDemoProviderProfile(access.demoSessionId ?? '', id, parsed.data)

    if (!profile) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  }

  const { supabase, providerId } = access

  const { data, error } = await supabase
    .from('patient_clinical_profiles')
    .update(parsed.data)
    .eq('id', id)
    .eq('provider_id', providerId)
    .select('*')
    .single()

  if (error) {
    console.error('[provider/patients/profile] update failed:', error)
    return NextResponse.json({ error: 'Failed to update patient profile' }, { status: 500 })
  }
  return NextResponse.json(data)
}
