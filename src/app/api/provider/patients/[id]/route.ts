import { NextResponse, type NextRequest } from 'next/server'
import { requireProviderAccess } from '@/app/api/provider/_lib/access'
import { getDemoProviderChart } from '@/lib/demo/provider-clinical'
import type { ClinicalNote, ClinicalProfile, PatientChart, PatientVisit } from '@/lib/clinical/types'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireProviderAccess(req)
  const billingPrefillOnly = req.nextUrl.searchParams.get('billingPrefill') === '1'

  if (access instanceof NextResponse) {
    return access
  }

  if (access.isDemo) {
    const chart = getDemoProviderChart(access.demoSessionId ?? '', id)

    if (!chart) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    if (billingPrefillOnly) {
      return NextResponse.json(
        {
          profile: {
            patient_name: chart.profile.patient_name,
            patient_phone: chart.profile.patient_phone ?? null,
          },
        },
        { headers: NO_STORE_HEADERS },
      )
    }

    return NextResponse.json(chart, { headers: NO_STORE_HEADERS })
  }

  const { supabase, providerId } = access

  const { data: profile, error: profileErr } = await supabase
    .from('patient_clinical_profiles')
    .select('*')
    .eq('id', id)
    .eq('provider_id', providerId)
    .single()

  if (profileErr || !profile) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  if (billingPrefillOnly) {
    return NextResponse.json(
      {
        profile: {
          patient_name: profile.patient_name,
          patient_phone: profile.patient_phone ?? null,
        },
      },
      { headers: NO_STORE_HEADERS },
    )
  }

  const { data: visitsData } = await supabase
    .from('patient_visits')
    .select('*')
    .eq('profile_id', id)
    .order('visit_number', { ascending: false })

  const visitIds = (visitsData ?? []).map((v) => v.id)
  const notesByVisit = new Map<string, ClinicalNote>()

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

  return NextResponse.json(chart, { headers: NO_STORE_HEADERS })
}
