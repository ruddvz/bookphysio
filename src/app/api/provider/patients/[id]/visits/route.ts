import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createVisitSchema } from '@/lib/clinical/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Confirm ownership of profile
  const { data: profile } = await supabase
    .from('patient_clinical_profiles')
    .select('id')
    .eq('id', id)
    .eq('provider_id', user.id)
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
      provider_id: user.id,
      visit_number: nextNumber,
      visit_date: parsed.data.visit_date ?? new Date().toISOString().slice(0, 10),
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
