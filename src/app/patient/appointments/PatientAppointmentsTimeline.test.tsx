/**
 * Slice 16.16 — v2 patient appointments timeline component tests.
 * Exercises rendering paths that the pure-helper tests cannot cover:
 * day headers, per-status badge labels, reschedule visibility rules,
 * and link wiring to the detail page.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { PatientAppointmentsTimeline } from './PatientAppointmentsTimeline'
import type { AppointmentItem } from './appointments-utils'

const NOW_IST = Date.parse('2026-04-17T12:00:00.000Z') // 17:30 IST

function makeAppt(overrides: Partial<AppointmentItem> & { id: string }): AppointmentItem {
  return {
    id: overrides.id,
    status: overrides.status ?? 'confirmed',
    visit_type: overrides.visit_type ?? 'in_clinic',
    fee_inr: overrides.fee_inr ?? 700,
    payment_status: overrides.payment_status ?? null,
    availabilities: overrides.availabilities ?? null,
    providers: overrides.providers ?? {
      users: { full_name: 'Priya Sharma' },
      specialties: [{ name: 'Sports Physio' }],
    },
    locations: overrides.locations ?? { city: 'Mumbai' },
  }
}

afterEach(() => cleanup())

describe('PatientAppointmentsTimeline', () => {
  it('renders nothing when the appointments list is empty', () => {
    const { container } = render(
      <PatientAppointmentsTimeline appointments={[]} tab="upcoming" nowMs={NOW_IST} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('groups multiple slots on the same day under a single header', () => {
    const appts = [
      makeAppt({ id: 'a1', availabilities: { starts_at: '2026-04-18T03:30:00.000Z' } }),
      makeAppt({ id: 'a2', availabilities: { starts_at: '2026-04-18T13:30:00.000Z' } }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="upcoming" nowMs={NOW_IST} />)

    expect(screen.getAllByTestId('timeline-row')).toHaveLength(2)
    // Exactly one day header for the 18th.
    expect(screen.getAllByText(/Tomorrow/i)).toHaveLength(1)
  })

  it('labels today with a "Today" solid badge', () => {
    const appts = [
      makeAppt({ id: 'a1', availabilities: { starts_at: '2026-04-17T06:30:00.000Z' } }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="upcoming" nowMs={NOW_IST} />)
    expect(screen.getAllByText(/Today/i).length).toBeGreaterThan(0)
  })

  it('renders per-row status badges using STATUS_LABEL copy', () => {
    const appts = [
      makeAppt({
        id: 'a1',
        status: 'pending',
        availabilities: { starts_at: '2026-04-18T06:30:00.000Z' },
      }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="upcoming" nowMs={NOW_IST} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('hides the reschedule affordance for already-paid upcoming visits', () => {
    const appts = [
      makeAppt({
        id: 'a1',
        status: 'confirmed',
        payment_status: 'paid',
        availabilities: { starts_at: '2026-04-18T06:30:00.000Z' },
      }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="upcoming" nowMs={NOW_IST} />)
    expect(screen.queryByRole('link', { name: /reschedule visit with/i })).not.toBeInTheDocument()
  })

  it('shows a reschedule affordance for eligible upcoming visits', () => {
    const appts = [
      makeAppt({
        id: 'a1',
        status: 'confirmed',
        payment_status: null,
        availabilities: { starts_at: '2026-04-22T06:30:00.000Z' },
      }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="upcoming" nowMs={NOW_IST} />)
    const link = screen.getByRole('link', { name: /reschedule visit with/i })
    expect(link).toHaveAttribute(
      'href',
      '/patient/appointments/a1?reschedule=true',
    )
  })

  it('never renders a reschedule link on the past tab', () => {
    const appts = [
      makeAppt({
        id: 'a1',
        status: 'completed',
        availabilities: { starts_at: '2026-04-05T06:30:00.000Z' },
      }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="past" nowMs={NOW_IST} />)
    expect(screen.queryByRole('link', { name: /reschedule visit with/i })).not.toBeInTheDocument()
  })

  it('links each row to its detail page via an arrow affordance', () => {
    const appts = [
      makeAppt({
        id: 'abc',
        availabilities: { starts_at: '2026-04-18T06:30:00.000Z' },
      }),
    ]
    render(<PatientAppointmentsTimeline appointments={appts} tab="upcoming" nowMs={NOW_IST} />)
    const row = screen.getByTestId('timeline-row')
    const openLink = within(row).getByRole('link', { name: /open visit with/i })
    expect(openLink).toHaveAttribute('href', '/patient/appointments/abc')
  })
})
