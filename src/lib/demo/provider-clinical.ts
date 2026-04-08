import {
  type ClinicalNote,
  type ClinicalProfile,
  type PatientChart,
  type PatientRosterRow,
  type PatientVisit,
  type ScheduleEntry,
  type ScheduleVisitInput,
} from '@/lib/clinical/types'
import { getDemoProfile } from '@/lib/demo/session'

interface DemoProviderVisitRecord {
  id: string
  profile_id: string
  provider_id: string
  visit_number: number
  visit_date: string
  visit_time: string
  fee_inr: number | null
  created_at: string
  note: ClinicalNote | null
}

interface DemoProviderClinicalState {
  profiles: ClinicalProfile[]
  visits: DemoProviderVisitRecord[]
}

const DEMO_PROVIDER_ID = getDemoProfile('provider').id

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(daysFromToday: number): string {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + daysFromToday)
  return formatDateKey(date)
}

function timestampForVisit(dateKey: string, visitTime = '09:00'): string {
  return new Date(`${dateKey}T${visitTime}:00+05:30`).toISOString()
}

function compareVisitsDesc(
  left: Pick<DemoProviderVisitRecord, 'visit_date' | 'visit_time'>,
  right: Pick<DemoProviderVisitRecord, 'visit_date' | 'visit_time'>,
) {
  const leftKey = `${left.visit_date}T${left.visit_time}`
  const rightKey = `${right.visit_date}T${right.visit_time}`
  return rightKey.localeCompare(leftKey)
}

function compareVisitsAsc(
  left: Pick<DemoProviderVisitRecord, 'visit_date' | 'visit_time'>,
  right: Pick<DemoProviderVisitRecord, 'visit_date' | 'visit_time'>,
) {
  const leftKey = `${left.visit_date}T${left.visit_time}`
  const rightKey = `${right.visit_date}T${right.visit_time}`
  return leftKey.localeCompare(rightKey)
}

function toScheduleEntry(profile: ClinicalProfile, visit: DemoProviderVisitRecord): ScheduleEntry {
  return {
    visit_id: visit.id,
    profile_id: visit.profile_id,
    patient_name: profile.patient_name,
    visit_date: visit.visit_date,
    visit_time: visit.visit_time,
    fee_inr: visit.fee_inr,
    visit_number: visit.visit_number,
  }
}

function toPatientVisit(visit: DemoProviderVisitRecord): PatientVisit {
  return {
    id: visit.id,
    profile_id: visit.profile_id,
    provider_id: visit.provider_id,
    visit_number: visit.visit_number,
    visit_date: visit.visit_date,
    created_at: visit.created_at,
    note: visit.note,
  }
}

function findProfile(state: DemoProviderClinicalState, profileId: string) {
  return state.profiles.find((profile) => profile.id === profileId) ?? null
}

function buildVisitRecord(
  profileId: string,
  visitNumber: number,
  visitDate: string,
  visitTime: string,
  feeInr: number | null,
): DemoProviderVisitRecord {
  return {
    id: crypto.randomUUID(),
    profile_id: profileId,
    provider_id: DEMO_PROVIDER_ID,
    visit_number: visitNumber,
    visit_date: visitDate,
    visit_time: visitTime,
    fee_inr: feeInr,
    created_at: timestampForVisit(visitDate, visitTime),
    note: null,
  }
}

function createInitialState(): DemoProviderClinicalState {
  const profiles: ClinicalProfile[] = [
    {
      id: '33333333-3333-4333-8333-000000000001',
      provider_id: DEMO_PROVIDER_ID,
      patient_user_id: null,
      patient_name: 'Rahul Sharma',
      patient_phone: '+919876543210',
      patient_age: 31,
      patient_gender: 'male',
      chief_complaint: 'Post-run ankle stiffness',
      medical_history: 'Mild ankle sprain from a 10K training block.',
      contraindications: null,
      treatment_goals: 'Return to pain-free weekend runs within four weeks.',
      created_at: timestampForVisit(addDays(-14)),
      updated_at: timestampForVisit(addDays(-2)),
    },
    {
      id: '33333333-3333-4333-8333-000000000002',
      provider_id: DEMO_PROVIDER_ID,
      patient_user_id: null,
      patient_name: 'Nisha Rao',
      patient_phone: '+919812345679',
      patient_age: 28,
      patient_gender: 'female',
      chief_complaint: 'Shoulder mobility recovery',
      medical_history: 'Desk-work strain with recent badminton aggravation.',
      contraindications: null,
      treatment_goals: 'Restore full overhead reach without pain.',
      created_at: timestampForVisit(addDays(-10)),
      updated_at: timestampForVisit(addDays(-1)),
    },
    {
      id: '33333333-3333-4333-8333-000000000003',
      provider_id: DEMO_PROVIDER_ID,
      patient_user_id: null,
      patient_name: 'Amit Kumar',
      patient_phone: '+919800112233',
      patient_age: 42,
      patient_gender: 'male',
      chief_complaint: 'Lower back pain management',
      medical_history: 'Intermittent lumbar pain after long drives.',
      contraindications: 'Avoid loaded flexion in the acute phase.',
      treatment_goals: 'Sit through a workday without stiffness.',
      created_at: timestampForVisit(addDays(-21)),
      updated_at: timestampForVisit(addDays(-2)),
    },
  ]

  const visits: DemoProviderVisitRecord[] = [
    buildVisitRecord(profiles[0].id, 3, addDays(0), '09:00', 900),
    buildVisitRecord(profiles[1].id, 2, addDays(1), '15:00', 1200),
    buildVisitRecord(profiles[2].id, 4, addDays(-2), '11:00', 1000),
  ]

  visits[2].note = {
    id: '55555555-5555-4555-8555-000000000001',
    visit_id: visits[2].id,
    provider_id: DEMO_PROVIDER_ID,
    profile_id: profiles[2].id,
    subjective: 'Pain eases after short walks but returns by evening.',
    pain_scale: 4,
    range_of_motion: 'Lumbar flexion limited to mid-shin.',
    functional_tests: 'Sit-to-stand improved from 7/10 to 9/10 reps.',
    objective_notes: 'Reduced guarding over the right lumbar paraspinals.',
    assessment: 'Responding well to extension-biased mobility work.',
    plan: 'Continue extension drills and glute activation; reassess in one week.',
    patient_summary: 'Keep walks short and repeat the home routine twice daily.',
    created_at: visits[2].created_at,
    updated_at: visits[2].created_at,
  }

  return {
    profiles,
    visits,
  }
}

const demoProviderClinicalStore = new Map<string, DemoProviderClinicalState>()

function getSessionState(sessionId: string): DemoProviderClinicalState {
  const existingState = demoProviderClinicalStore.get(sessionId)

  if (existingState) {
    return existingState
  }

  const nextState = createInitialState()
  demoProviderClinicalStore.set(sessionId, nextState)
  return nextState
}

export function getDemoProviderPatients(sessionId: string): PatientRosterRow[] {
  const state = getSessionState(sessionId)

  return state.profiles
    .map((profile) => {
      const patientVisits = state.visits
        .filter((visit) => visit.profile_id === profile.id)
        .sort(compareVisitsDesc)

      return {
        profile_id: profile.id,
        patient_name: profile.patient_name,
        patient_phone: profile.patient_phone,
        patient_age: profile.patient_age,
        chief_complaint: profile.chief_complaint,
        visit_count: patientVisits.length,
        last_visit_date: patientVisits[0]?.visit_date ?? null,
      }
    })
    .sort((left, right) => {
      if (!left.last_visit_date && !right.last_visit_date) {
        return left.patient_name.localeCompare(right.patient_name)
      }

      if (!left.last_visit_date) {
        return 1
      }

      if (!right.last_visit_date) {
        return -1
      }

      return right.last_visit_date.localeCompare(left.last_visit_date)
    })
}

export function createDemoProviderPatient(
  sessionId: string,
  input: {
    patient_name: string
    patient_phone?: string | null
    patient_age?: number | null
    chief_complaint?: string | null
  },
) {
  const state = getSessionState(sessionId)
  const profile_id = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  state.profiles.unshift({
    id: profile_id,
    provider_id: DEMO_PROVIDER_ID,
    patient_user_id: null,
    patient_name: input.patient_name,
    patient_phone: input.patient_phone ?? null,
    patient_age: input.patient_age ?? null,
    patient_gender: null,
    chief_complaint: input.chief_complaint ?? null,
    medical_history: null,
    contraindications: null,
    treatment_goals: null,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return { profile_id }
}

export function getDemoProviderSchedule(sessionId: string, start: string, end: string): ScheduleEntry[] {
  const state = getSessionState(sessionId)

  return state.visits
    .filter((visit) => visit.visit_date >= start && visit.visit_date <= end)
    .sort(compareVisitsAsc)
    .map((visit) => {
      const profile = findProfile(state, visit.profile_id)

      if (!profile) {
        throw new Error(`Missing demo profile for visit ${visit.id}`)
      }

      return toScheduleEntry(profile, visit)
    })
}

function addVisitRecord(
  state: DemoProviderClinicalState,
  profileId: string,
  visitDate: string,
  visitTime: string,
  feeInr: number | null,
) {
  const profile = findProfile(state, profileId)

  if (!profile) {
    return null
  }

  const visitNumber = state.visits.filter((visit) => visit.profile_id === profileId).length + 1
  const visit = buildVisitRecord(profileId, visitNumber, visitDate, visitTime, feeInr)
  state.visits.push(visit)

  profile.updated_at = new Date().toISOString()

  return { profile, visit }
}

export function scheduleDemoProviderVisit(sessionId: string, input: ScheduleVisitInput): ScheduleEntry | null {
  const state = getSessionState(sessionId)
  const result = addVisitRecord(state, input.profile_id, input.visit_date, input.visit_time, input.fee_inr ?? null)

  if (!result) {
    return null
  }

  return toScheduleEntry(result.profile, result.visit)
}

export function getDemoProviderChart(sessionId: string, profileId: string): PatientChart | null {
  const state = getSessionState(sessionId)
  const profile = findProfile(state, profileId)

  if (!profile) {
    return null
  }

  const visits = state.visits
    .filter((visit) => visit.profile_id === profileId)
    .sort(compareVisitsDesc)
    .map(toPatientVisit)

  return {
    profile,
    visits,
  }
}

export function updateDemoProviderProfile(
  sessionId: string,
  profileId: string,
  updates: Partial<
    Pick<
      ClinicalProfile,
      'patient_name' | 'patient_phone' | 'patient_age' | 'patient_gender' | 'chief_complaint' | 'medical_history' | 'contraindications' | 'treatment_goals'
    >
  >,
): ClinicalProfile | null {
  const state = getSessionState(sessionId)
  const profile = findProfile(state, profileId)

  if (!profile) {
    return null
  }

  Object.assign(profile, updates, { updated_at: new Date().toISOString() })

  return profile
}

export function createDemoProviderVisit(sessionId: string, profileId: string, visitDate?: string): PatientVisit | null {
  const state = getSessionState(sessionId)
  const result = addVisitRecord(state, profileId, visitDate ?? formatDateKey(new Date()), '09:00', null)

  if (!result) {
    return null
  }

  return toPatientVisit(result.visit)
}

export function upsertDemoProviderSoap(
  sessionId: string,
  visitId: string,
  input: {
    subjective?: string | null
    pain_scale?: number | null
    range_of_motion?: string | null
    functional_tests?: string | null
    objective_notes?: string | null
    assessment?: string | null
    plan?: string | null
    patient_summary?: string | null
  },
): ClinicalNote | null {
  const state = getSessionState(sessionId)
  const visit = state.visits.find((entry) => entry.id === visitId)

  if (!visit) {
    return null
  }

  const timestamp = new Date().toISOString()

  if (visit.note) {
    visit.note = {
      ...visit.note,
      ...input,
      updated_at: timestamp,
    }

    return visit.note
  }

  visit.note = {
    id: crypto.randomUUID(),
    visit_id: visit.id,
    provider_id: visit.provider_id,
    profile_id: visit.profile_id,
    subjective: input.subjective ?? null,
    pain_scale: input.pain_scale ?? null,
    range_of_motion: input.range_of_motion ?? null,
    functional_tests: input.functional_tests ?? null,
    objective_notes: input.objective_notes ?? null,
    assessment: input.assessment ?? null,
    plan: input.plan ?? null,
    patient_summary: input.patient_summary ?? null,
    created_at: timestamp,
    updated_at: timestamp,
  }

  return visit.note
}