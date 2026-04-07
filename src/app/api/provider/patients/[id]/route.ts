import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ClinicalNote, ClinicalProfile, PatientChart, PatientVisit } from '@/lib/clinical/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: profileErr } = await supabase
    .from('patient_clinical_profiles')
    .select('*')
    .eq('id', id)
    .eq('provider_id', user.id)
    .single()

  if (profileErr || !profile) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const { data: visitsData } = await supabase
    .from('patient_visits')
    .select('*')
    .eq('profile_id', id)
    .order('visit_number', { ascending: false })

  const visitIds = (visitsData ?? []).map((v) => v.id)
  let notesByVisit = new Map<string, ClinicalNote>()

  if (visitIds.length > 0) {
    const { data: notes } = await supabase
      .from('clinical_notes')
      .select('*')
      .in('visit_id', visitIds)

    for (const n of notes ?? []) {
      notesByVisit.set(n.visit_id, n as ClinicalNote)
    }
  }

  const visits: PatientVisit[] = (visitsData ?? []).map((v) => ({
    ...(v as PatientVisit),
    note: notesByVisit.get(v.id) ?? null,
  }))

  const chart: PatientChart = {
    profile: profile as ClinicalProfile,
    visits,
  }

  return NextResponse.json(chart)
}
