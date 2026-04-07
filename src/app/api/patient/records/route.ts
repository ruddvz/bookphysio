import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PatientFacingRecord } from '@/lib/clinical/types'

interface VisitJoinRow {
  id: string
  visit_number: number
  visit_date: string
  profile_id: string
  provider_id: string
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Profiles where this user is the linked patient
  const { data: profiles } = await supabase
    .from('patient_clinical_profiles')
    .select('id, provider_id')
    .eq('patient_user_id', user.id)

  const profileIds = (profiles ?? []).map((p) => p.id)
  if (profileIds.length === 0) {
    return NextResponse.json({ records: [] })
  }

  const { data: visits } = await supabase
    .from('patient_visits')
    .select('id, visit_number, visit_date, profile_id, provider_id')
    .in('profile_id', profileIds)
    .order('visit_date', { ascending: false })

  const visitIds = (visits ?? []).map((v) => v.id)
  if (visitIds.length === 0) {
    return NextResponse.json({ records: [] })
  }

  // Server-side filter: only expose plan + patient_summary to patient
  const { data: notes } = await supabase
    .from('clinical_notes')
    .select('visit_id, plan, patient_summary')
    .in('visit_id', visitIds)

  const noteByVisit = new Map<string, { plan: string | null; patient_summary: string | null }>()
  for (const n of notes ?? []) {
    noteByVisit.set(n.visit_id, { plan: n.plan, patient_summary: n.patient_summary })
  }

  const providerIds = Array.from(new Set((visits ?? []).map((v) => v.provider_id)))
  const { data: providers } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', providerIds)

  const providerNameById = new Map<string, string>()
  for (const p of providers ?? []) providerNameById.set(p.id, p.full_name)

  const records: PatientFacingRecord[] = (visits as VisitJoinRow[] ?? []).map((v) => ({
    visit_id: v.id,
    visit_number: v.visit_number,
    visit_date: v.visit_date,
    provider_name: providerNameById.get(v.provider_id) ?? 'Provider',
    plan: noteByVisit.get(v.id)?.plan ?? null,
    patient_summary: noteByVisit.get(v.id)?.patient_summary ?? null,
  }))

  return NextResponse.json({ records })
}
