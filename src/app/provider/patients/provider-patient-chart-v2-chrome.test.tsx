import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProviderPatientChartV2Chrome } from '@/app/provider/patients/ProviderPatientChartV2Chrome'
import type { ClinicalProfile, PatientVisit } from '@/lib/clinical/types'

const profile: ClinicalProfile = {
  id: 'pid',
  provider_id: 'prov',
  patient_user_id: null,
  patient_name: 'Test',
  patient_phone: '919876543210',
  patient_age: 35,
  patient_gender: 'male',
  chief_complaint: 'Knee',
  medical_history: null,
  contraindications: null,
  treatment_goals: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

const visits: PatientVisit[] = [
  {
    id: 'v1',
    profile_id: 'pid',
    provider_id: 'prov',
    visit_number: 2,
    visit_date: '2026-04-10',
    created_at: '2026-04-10',
    note: null,
  },
  {
    id: 'v2',
    profile_id: 'pid',
    provider_id: 'prov',
    visit_number: 1,
    visit_date: '2026-03-01',
    created_at: '2026-03-01',
    note: null,
  },
]

describe('ProviderPatientChartV2Chrome', () => {
  it('calls onQuickNote when quick note is pressed', () => {
    const onQuickNote = vi.fn()
    render(
      <ProviderPatientChartV2Chrome
        profile={profile}
        visits={visits}
        referenceNowMs={new Date('2026-06-15T12:00:00+05:30').getTime()}
        onQuickNote={onQuickNote}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /quick note/i }))
    expect(onQuickNote).toHaveBeenCalledTimes(1)
  })
})
