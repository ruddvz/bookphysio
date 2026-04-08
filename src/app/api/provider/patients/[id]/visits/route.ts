import { NextResponse, type NextRequest } from 'next/server'
import { requireProviderAccess } from '@/app/api/provider/_lib/access'
import { createDemoProviderVisit } from '@/lib/demo/provider-clinical'
import { createVisitSchema } from '@/lib/clinical/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireProviderAccess(req)

  if (access instanceof NextResponse) {
    return access
  }

  const body = await req.json().catch(() => ({}))
  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (access.isDemo) {
    const visit = createDemoProviderVisit(access.demoSessionId ?? '', id, parsed.data.visit_date)

    if (!visit) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(visit, { status: 201 })
  }

  const { supabase, providerId } = access

  // Confirm ownership of profile
  const { data: profile } = await supabase
    .from('patient_clinical_profiles')
    .select('id')
    .eq('id', id)
    .eq('provider_id', providerId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  // Compute next visit number
  const { data: maxRow } = await supabase
    .from('patient_visits')
    .select('visit_number')
    .eq('profile_id', id)
    .order('visit_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (maxRow?.visit_number ?? 0) + 1

  const { data, error } = await supabase
    .from('patient_visits')
    .insert({
      profile_id: id,
      provider_id: providerId,
      visit_number: nextNumber,
      visit_date: parsed.data.visit_date ?? new Date().toISOString().slice(0, 10),
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
