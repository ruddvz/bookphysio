import { NextResponse, type NextRequest } from 'next/server'
import { requireProviderAccess } from '@/app/api/provider/_lib/access'
import {
  createDemoProviderPatient,
  getDemoPatientVisitDates,
  getDemoProviderPatients,
} from '@/lib/demo/provider-clinical'
import { monthlyVisitCountSeries } from '@/lib/clinical/provider-patients-utils'
import { addPatientSchema, type PatientRosterRow } from '@/lib/clinical/types'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

export async function GET(request: NextRequest) {
  const access = await requireProviderAccess(request)
  const dashboardView = request.nextUrl.searchParams.get('view') === 'dashboard'
  const includeVisitSeries = request.nextUrl.searchParams.get('includeVisitSeries') === '1'

  if (access instanceof NextResponse) {
    return access
  }

  if (access.isDemo) {
    const sessionId = access.demoSessionId ?? ''
    let demoPatients = getDemoProviderPatients(sessionId)

    if (includeVisitSeries && !dashboardView) {
      const refMs = Date.now()
      demoPatients = demoPatients.map((patient) => ({
        ...patient,
        visit_series_6m: monthlyVisitCountSeries(getDemoPatientVisitDates(sessionId, patient.profile_id), refMs, 6),
      }))
    }

    return NextResponse.json({
      patients: dashboardView
        ? demoPatients.map((patient) => ({
            profile_id: patient.profile_id,
            patient_name: patient.patient_name,
            visit_count: patient.visit_count,
            last_visit_date: patient.last_visit_date,
          }))
        : demoPatients,
    }, { headers: NO_STORE_HEADERS })
  }

  const { supabase, providerId } = access

  const { data: profiles, error } = await supabase
    .from('patient_clinical_profiles')
    .select('id, patient_name, patient_phone, patient_age, chief_complaint, updated_at')
    .eq('provider_id', providerId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[api/provider/patients] Failed to load patient profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500, headers: NO_STORE_HEADERS })
  }

  const profileIds = (profiles ?? []).map((p) => p.id)
  const visitMap = new Map<string, { count: number; last: string | null }>()
  const visitDatesByProfile = new Map<string, string[]>()

  if (profileIds.length > 0) {
    const { data: visits, error: visitsError } = await supabase
      .from('patient_visits')
      .select('profile_id, visit_date')
      .in('profile_id', profileIds)
      .order('visit_date', { ascending: false })

    if (visitsError) {
      console.error('[api/provider/patients] Failed to load patient visits:', visitsError)
      return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500, headers: NO_STORE_HEADERS })
    }

    for (const v of visits ?? []) {
      const cur = visitMap.get(v.profile_id) ?? { count: 0, last: null }
      visitMap.set(v.profile_id, {
        count: cur.count + 1,
        last: cur.last ?? v.visit_date,
      })
      if (includeVisitSeries) {
        const list = visitDatesByProfile.get(v.profile_id) ?? []
        list.push(v.visit_date)
        visitDatesByProfile.set(v.profile_id, list)
      }
    }
  }

  const refMs = Date.now()
  const rows: PatientRosterRow[] = (profiles ?? []).map((p) => {
    const v = visitMap.get(p.id)
    const base: PatientRosterRow = {
      profile_id: p.id,
      patient_name: p.patient_name,
      patient_phone: p.patient_phone,
      patient_age: p.patient_age,
      chief_complaint: p.chief_complaint,
      visit_count: v?.count ?? 0,
      last_visit_date: v?.last ?? null,
    }
    if (includeVisitSeries) {
      return {
        ...base,
        visit_series_6m: monthlyVisitCountSeries(visitDatesByProfile.get(p.id) ?? [], refMs, 6),
      }
    }
    return base
  })

  return NextResponse.json({
    patients: dashboardView
      ? rows.map((row) => ({
          profile_id: row.profile_id,
          patient_name: row.patient_name,
          visit_count: row.visit_count,
          last_visit_date: row.last_visit_date,
        }))
      : rows,
  }, { headers: NO_STORE_HEADERS })
}

export async function POST(req: NextRequest) {
  const access = await requireProviderAccess(req)

  if (access instanceof NextResponse) {
    return access
  }

  const body = await req.json().catch(() => null)
  const parsed = addPatientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  if (access.isDemo) {
    return NextResponse.json(createDemoProviderPatient(access.demoSessionId ?? '', parsed.data), { status: 201 })
  }

  const { supabase, providerId } = access

  const { data, error } = await supabase
    .from('patient_clinical_profiles')
    .insert({
      provider_id: providerId,
      patient_name: parsed.data.patient_name,
      patient_phone: parsed.data.patient_phone ?? null,
      patient_age: parsed.data.patient_age ?? null,
      patient_gender: parsed.data.patient_gender ?? null,
      chief_complaint: parsed.data.chief_complaint ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[api/provider/patients] Failed to create patient profile:', error)
    return NextResponse.json({ error: 'Failed to create patient profile' }, { status: 500, headers: NO_STORE_HEADERS })
  }
  return NextResponse.json({ profile_id: data.id }, { status: 201 })
}
