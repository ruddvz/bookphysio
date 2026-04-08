import { NextResponse, type NextRequest } from 'next/server'
import { requireProviderAccess } from '@/app/api/provider/_lib/access'
import { upsertDemoProviderSoap } from '@/lib/demo/provider-clinical'
import { upsertSoapSchema } from '@/lib/clinical/types'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params
  const access = await requireProviderAccess(req)

  if (access instanceof NextResponse) {
    return access
  }

  const body = await req.json().catch(() => null)
  const parsed = upsertSoapSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  if (access.isDemo) {
    const note = upsertDemoProviderSoap(access.demoSessionId ?? '', visitId, parsed.data)

    if (!note) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    return NextResponse.json(note, { status: 201 })
  }

  const { supabase, providerId } = access

  // Confirm visit ownership
  const { data: visit } = await supabase
    .from('patient_visits')
    .select('id, profile_id')
    .eq('id', visitId)
    .eq('provider_id', providerId)
    .single()

  if (!visit) return NextResponse.json({ error: 'Visit not found' }, { status: 404 })

  const { data: existing } = await supabase
    .from('clinical_notes')
    .select('id')
    .eq('visit_id', visitId)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('clinical_notes')
      .update(parsed.data)
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: 'Failed to save clinical note' }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('clinical_notes')
    .insert({
      visit_id: visitId,
      provider_id: providerId,
      profile_id: visit.profile_id,
      ...parsed.data,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save clinical note' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
