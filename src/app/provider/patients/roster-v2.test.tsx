import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderPatientRosterV2 } from './ProviderPatientRosterV2'
import { buildPatientVisitSparkline, formatPhonePv, patientInitials } from './roster-v2-utils'

const mockV2 = vi.fn(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2(),
}))

const samplePatient = {
  profile_id: 'p1',
  patient_name: 'Raj Kumar',
  patient_phone: '919876543210',
  patient_age: 40,
  chief_complaint: null,
  visit_count: 3,
  last_visit_date: '2026-04-10',
  visit_dates: ['2026-04-10', '2026-03-01'],
}

describe('slice 16.27 — provider patient roster v2', () => {
  beforeEach(() => {
    mockV2.mockReturnValue(true)
  })

  it('ProviderPatientRosterV2 renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<ProviderPatientRosterV2 patients={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders data-testid when v2 is on', () => {
    render(<ProviderPatientRosterV2 patients={[samplePatient]} />)
    expect(screen.getByTestId('provider-patient-roster-v2')).toBeInTheDocument()
  })

  it('shows patient count Badge with correct number', () => {
    render(<ProviderPatientRosterV2 patients={[samplePatient, { ...samplePatient, profile_id: 'p2' }]} />)
    expect(screen.getByLabelText(/Total patients/i)).toHaveTextContent('2 patients')
  })

  it('patientInitials("Raj Kumar") returns RK', () => {
    expect(patientInitials('Raj Kumar')).toBe('RK')
  })

  it('patientInitials("Priya") returns P', () => {
    expect(patientInitials('Priya')).toBe('P')
  })

  it('formatPhonePv(null) returns —', () => {
    expect(formatPhonePv(null)).toBe('—')
  })

  it('formatPhonePv handles E.164 with 91 prefix', () => {
    expect(formatPhonePv('9198765432100')).toMatch(/^\+91/)
  })

  it('buildPatientVisitSparkline returns length 6', () => {
    expect(buildPatientVisitSparkline({ ...samplePatient, visit_dates: [] })).toHaveLength(6)
  })
})
