import { NextResponse, type NextRequest } from 'next/server'
import { requireProviderAccess } from '@/app/api/provider/_lib/access'
import { getDemoProviderSchedule, scheduleDemoProviderVisit } from '@/lib/demo/provider-clinical'
import { scheduleVisitSchema, type ScheduleEntry } from '@/lib/clinical/types'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

interface VisitRow {
  id: string
  profile_id: string
  visit_number: number
  visit_date: string
  visit_time: string | null
  fee_inr: number | null
  patient_clinical_profiles: { patient_name: string } | null
}

export async function GET(req: NextRequest) {
  const access = await requireProviderAccess(req)

  if (access instanceof NextResponse) {
    return access
  }

  const start = req.nextUrl.searchParams.get('start')
  const end = req.nextUrl.searchParams.get('end')
  if (!start || !end) {
    return NextResponse.json({ error: 'start and end required' }, { status: 400 })
  }

  if (access.isDemo) {
    return NextResponse.json({ entries: getDemoProviderSchedule(access.demoSessionId ?? '', start, end) }, { headers: NO_STORE_HEADERS })
  }

  const { supabase, providerId } = access

  const { data, error } = await supabase
    .from('patient_visits')
    .select('id, profile_id, visit_number, visit_date, visit_time, fee_inr, patient_clinical_profiles!inner(patient_name)')
    .eq('provider_id', providerId)
    .gte('visit_date', start)
    .lte('visit_date', end)
    .not('visit_time', 'is', null)
    .order('visit_date', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })

  const rows = (data as unknown as VisitRow[]) ?? []
  const entries: ScheduleEntry[] = rows.map((r) => ({
    visit_id: r.id,
    profile_id: r.profile_id,
    patient_name: r.patient_clinical_profiles?.patient_name ?? 'Unknown',
    visit_date: r.visit_date,
    visit_time: r.visit_time ?? '',
    fee_inr: r.fee_inr,
    visit_number: r.visit_number,
  }))

  return NextResponse.json({ entries }, { headers: NO_STORE_HEADERS })
}

export async function POST(req: NextRequest) {
  const access = await requireProviderAccess(req)

  if (access instanceof NextResponse) {
    return access
  }

  const body = await req.json().catch(() => null)
  const parsed = scheduleVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  if (access.isDemo) {
    const entry = scheduleDemoProviderVisit(access.demoSessionId ?? '', input)

    if (!entry) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(entry, { status: 201 })
  }

  const { supabase, providerId } = access

  // Confirm provider owns the profile
  const { data: profile } = await supabase
    .from('patient_clinical_profiles')
    .select('id')
    .eq('id', input.profile_id)
    .eq('provider_id', providerId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  // Compute next visit_number
  const { data: maxRow } = await supabase
    .from('patient_visits')
    .select('visit_number')
    .eq('profile_id', input.profile_id)
    .order('visit_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (maxRow?.visit_number ?? 0) + 1

  const { data, error } = await supabase
    .from('patient_visits')
    .insert({
      profile_id: input.profile_id,
      provider_id: providerId,
      visit_number: nextNumber,
      visit_date: input.visit_date,
      visit_time: input.visit_time,
      fee_inr: input.fee_inr ?? null,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to schedule visit' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
