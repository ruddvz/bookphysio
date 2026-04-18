import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderPatientsRosterCardV2 } from '@/app/provider/patients/ProviderPatientsRosterCardV2'
import type { PatientRosterRow } from '@/lib/clinical/types'

const base: PatientRosterRow = {
  profile_id: 'p1',
  patient_name: 'Ravi Kumar',
  patient_phone: '919876543210',
  patient_age: 42,
  chief_complaint: 'Low back pain',
  visit_count: 5,
  last_visit_date: '2026-04-01',
  visit_series_6m: [1, 1, 2, 2, 2, 3],
}

describe('ProviderPatientsRosterCardV2', () => {
  it('renders patient name and chart link', () => {
    render(
      <ProviderPatientsRosterCardV2
        patient={base}
        formatDate={(iso) => iso ?? '—'}
        formatPhone={(p) => p ?? '—'}
      />,
    )
    expect(screen.getByText('Ravi Kumar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /chart/i })).toHaveAttribute('href', '/provider/patients/p1')
  })
})
