import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getDemoPatientFacingRecords } from '@/lib/demo/store'
import { getDemoSessionFromCookies } from '@/lib/demo/session'
import { createClient } from '@/lib/supabase/server'
import type { PatientFacingRecord } from '@/lib/clinical/types'

interface PatientFacingRecordRow {
  visit_id: string
  visit_number: number
  visit_date: string
  provider_name: string | null
  plan: string | null
  patient_summary: string | null
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_STORE_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

export async function GET(request?: NextRequest) {
  try {
    const dashboardView = request?.nextUrl.searchParams.get('view') === 'dashboard'
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const demoSession = !user && request ? await getDemoSessionFromCookies(request.cookies) : null

    if (!user && demoSession?.role === 'patient') {
      return jsonNoStore({
        records: getDemoPatientFacingRecords().map((record) => ({
          ...record,
          plan: dashboardView ? null : record.plan,
        })),
      })
    }

    if (!user) {
      return jsonNoStore({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase.rpc('get_patient_facing_records')

    if (error) {
      throw error
    }

    const records: PatientFacingRecord[] = ((data as PatientFacingRecordRow[] | null) ?? []).map((record) => ({
      visit_id: record.visit_id,
      visit_number: record.visit_number,
      visit_date: record.visit_date,
      provider_name: record.provider_name ?? 'Provider',
      plan: dashboardView ? null : record.plan ?? null,
      patient_summary: record.patient_summary ?? null,
    }))

    return jsonNoStore({ records })
  } catch (error) {
    console.error('Failed to load patient records', error)
    return jsonNoStore({ error: 'Failed to load records' }, { status: 500 })
  }
}
