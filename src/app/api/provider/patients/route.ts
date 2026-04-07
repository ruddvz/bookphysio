import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addPatientSchema, type PatientRosterRow } from '@/lib/clinical/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profiles, error } = await supabase
    .from('patient_clinical_profiles')
    .select('id, patient_name, patient_phone, patient_age, chief_complaint, updated_at')
    .eq('provider_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const profileIds = (profiles ?? []).map((p) => p.id)
  let visitMap = new Map<string, { count: number; last: string | null }>()

  if (profileIds.length > 0) {
    const { data: visits } = await supabase
      .from('patient_visits')
      .select('profile_id, visit_date')
      .in('profile_id', profileIds)
      .order('visit_date', { ascending: false })

    for (const v of visits ?? []) {
      const cur = visitMap.get(v.profile_id) ?? { count: 0, last: null }
      visitMap.set(v.profile_id, {
        count: cur.count + 1,
        last: cur.last ?? v.visit_date,
      })
    }
  }

  const rows: PatientRosterRow[] = (profiles ?? []).map((p) => {
    const v = visitMap.get(p.id)
    return {
      profile_id: p.id,
      patient_name: p.patient_name,
      patient_phone: p.patient_phone,
      patient_age: p.patient_age,
      chief_complaint: p.chief_complaint,
      visit_count: v?.count ?? 0,
      last_visit_date: v?.last ?? null,
    }
  })

  return NextResponse.json({ patients: rows })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = addPatientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('patient_clinical_profiles')
    .insert({
      provider_id: user.id,
      patient_name: parsed.data.patient_name,
      patient_phone: parsed.data.patient_phone ?? null,
      patient_age: parsed.data.patient_age ?? null,
      patient_gender: parsed.data.patient_gender ?? null,
      chief_complaint: parsed.data.chief_complaint ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile_id: data.id }, { status: 201 })
}
