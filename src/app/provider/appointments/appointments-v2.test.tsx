import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderAppointmentsTimelineV2 } from './ProviderAppointmentsTimelineV2'
import { groupApptsByDay, patientDisplayName, providerStatusBadgeVariant } from './provider-appointments-v2-utils'

const mockV2 = vi.fn(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2(),
}))

describe('slice 16.24 — provider appointments v2', () => {
  beforeEach(() => {
    mockV2.mockReturnValue(true)
  })

  it('ProviderAppointmentsTimelineV2 renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(
      <ProviderAppointmentsTimelineV2 tab="upcoming" appointments={[]} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders with correct data-testid when v2 is on', () => {
    const now = new Date('2026-04-18T10:00:00+05:30').getTime()
    render(
      <ProviderAppointmentsTimelineV2
        tab="upcoming"
        nowMs={now}
        appointments={[
          {
            id: 'a1',
            status: 'confirmed',
            visit_type: 'in_clinic',
            fee_inr: 500,
            availabilities: { starts_at: '2026-04-18T11:00:00+05:30' },
            patient: { full_name: 'Test Patient' },
          },
        ]}
      />,
    )
    expect(screen.getByTestId('provider-appointments-timeline-v2')).toBeInTheDocument()
  })

  it('day header shows Today for today appointment', () => {
    const now = new Date('2026-04-18T10:00:00+05:30').getTime()
    render(
      <ProviderAppointmentsTimelineV2
        tab="upcoming"
        nowMs={now}
        appointments={[
          {
            id: 'a1',
            status: 'confirmed',
            visit_type: 'in_clinic',
            fee_inr: 500,
            availabilities: { starts_at: '2026-04-18T14:00:00+05:30' },
            patient: { full_name: 'A' },
          },
        ]}
      />,
    )
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('confirmed appointment shows success Badge', () => {
    const now = new Date('2026-05-01T10:00:00+05:30').getTime()
    render(
      <ProviderAppointmentsTimelineV2
        tab="upcoming"
        nowMs={now}
        appointments={[
          {
            id: 'a1',
            status: 'confirmed',
            visit_type: 'in_clinic',
            fee_inr: 500,
            availabilities: { starts_at: '2026-05-02T14:00:00+05:30' },
            patient: { full_name: 'B' },
          },
        ]}
      />,
    )
    expect(screen.getByLabelText(/Status Confirmed/i)).toBeInTheDocument()
  })

  it('cancelled appointment shows danger Badge', () => {
    const now = new Date('2026-05-01T10:00:00+05:30').getTime()
    render(
      <ProviderAppointmentsTimelineV2
        tab="cancelled"
        nowMs={now}
        appointments={[
          {
            id: 'a1',
            status: 'cancelled',
            visit_type: 'in_clinic',
            fee_inr: 500,
            availabilities: { starts_at: '2026-04-10T14:00:00+05:30' },
            patient: { full_name: 'C' },
          },
        ]}
      />,
    )
    expect(screen.getByLabelText(/Status Cancelled/i)).toBeInTheDocument()
  })

  it('patientDisplayName returns Patient when patient is null', () => {
    expect(patientDisplayName({ patient: null })).toBe('Patient')
  })

  it('groupApptsByDay returns empty array when input is empty', () => {
    expect(groupApptsByDay([], 'upcoming')).toEqual([])
  })
})

describe('providerStatusBadgeVariant', () => {
  it('maps confirmed to success', () => {
    expect(providerStatusBadgeVariant('confirmed')).toBe('success')
  })
})
