import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import {
  computeVisitTrend,
  getCareStatus,
  PatientCarePulse,
} from './PatientCarePulse'

describe('computeVisitTrend', () => {
  it('returns undefined for series shorter than 2 values', () => {
    expect(computeVisitTrend([])).toBeUndefined()
    expect(computeVisitTrend([3])).toBeUndefined()
  })

  it('computes a positive percentage delta when cadence is rising', () => {
    // first half avg = 1, second half avg = 3 → +200%
    expect(computeVisitTrend([1, 1, 3, 3])).toBe(200)
  })

  it('computes a negative percentage delta when cadence is falling', () => {
    // first half avg = 4, second half avg = 1 → -75%
    expect(computeVisitTrend([4, 4, 1, 1])).toBe(-75)
  })

  it('returns undefined when first-half average is zero (no baseline)', () => {
    expect(computeVisitTrend([0, 0, 2, 3])).toBeUndefined()
  })

  it('handles odd-length series by splitting at the midpoint', () => {
    // [2, 2, 2, 4, 4] → first half [2,2] avg=2, second half [2,4,4] avg=3.33 → +67%
    expect(computeVisitTrend([2, 2, 2, 4, 4])).toBe(67)
  })
})

describe('getCareStatus', () => {
  it('returns "On track" when a next appointment is booked', () => {
    const status = getCareStatus({ nextAppointmentInDays: 3, weeklyVisits: [0, 0, 0, 0] })
    expect(status.label).toBe('On track')
    expect(status.tone).toBe('success')
  })

  it('returns "Stay engaged" when no next appointment but recent visits exist', () => {
    const status = getCareStatus({
      nextAppointmentInDays: null,
      weeklyVisits: [0, 0, 1, 1],
    })
    expect(status.label).toBe('Stay engaged')
    expect(status.tone).toBe('soft')
  })

  it('returns "Time to book" when no next appointment and no recent visits', () => {
    const status = getCareStatus({
      nextAppointmentInDays: null,
      weeklyVisits: [0, 0, 0, 0],
    })
    expect(status.label).toBe('Time to book')
    expect(status.tone).toBe('warning')
  })

  it('treats an empty weekly series as no recent visits', () => {
    const status = getCareStatus({ nextAppointmentInDays: null, weeklyVisits: [] })
    expect(status.label).toBe('Time to book')
  })

  it('ignores visits that sit outside the trailing recency window', () => {
    // 8-week series, visits only in the two oldest buckets. The trailing
    // 3-bucket window is empty, so the badge must nudge toward booking
    // rather than celebrate stale engagement.
    const status = getCareStatus({
      nextAppointmentInDays: null,
      weeklyVisits: [1, 1, 0, 0, 0, 0, 0, 0],
    })
    expect(status.label).toBe('Time to book')
  })
})

describe('<PatientCarePulse />', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the visit cadence sparkline with an accessible label', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[1, 2, 3, 4, 5, 6, 7, 8]}
        careTeamSize={2}
        nextAppointmentInDays={2}
      />,
    )
    expect(screen.getByRole('img', { name: /visit cadence/i })).toBeInTheDocument()
  })

  it('shows the on-track countdown sentence when a next appointment is booked', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[0, 1, 2, 3]}
        careTeamSize={1}
        nextAppointmentInDays={5}
      />,
    )
    expect(screen.getByText(/on track/i)).toBeInTheDocument()
    expect(screen.getByText(/next visit in 5 days/i)).toBeInTheDocument()
  })

  it('uses singular "1 provider" copy when the care team has one member', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[1, 2, 3]}
        careTeamSize={1}
        nextAppointmentInDays={null}
      />,
    )
    expect(screen.getByText('1 provider')).toBeInTheDocument()
  })

  it('uses plural "3 providers" copy when the care team has multiple members', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[1, 2, 3]}
        careTeamSize={3}
        nextAppointmentInDays={null}
      />,
    )
    expect(screen.getByText('3 providers')).toBeInTheDocument()
  })

  it('renders the "Stay engaged" badge when there are recent visits but no next', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[0, 0, 1, 1]}
        careTeamSize={1}
        nextAppointmentInDays={null}
      />,
    )
    expect(screen.getByText(/stay engaged/i)).toBeInTheDocument()
  })

  it('renders the "Time to book" badge when there is no next and no recent visits', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[0, 0, 0, 0]}
        careTeamSize={0}
        nextAppointmentInDays={null}
      />,
    )
    expect(screen.getByText(/time to book/i)).toBeInTheDocument()
  })

  it('omits the trend chip when the weekly series is too short to compute a delta', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[3]}
        careTeamSize={1}
        nextAppointmentInDays={1}
      />,
    )
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('hides the sparkline and swaps the headline when every weekly count is zero', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[0, 0, 0, 0, 0, 0, 0, 0]}
        careTeamSize={0}
        nextAppointmentInDays={null}
      />,
    )
    expect(screen.queryByRole('img', { name: /visit cadence/i })).toBeNull()
    expect(screen.getByText(/no recent visits/i)).toBeInTheDocument()
  })

  it('shows "Next visit today" when the next appointment is in 0 days', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[1, 2]}
        careTeamSize={1}
        nextAppointmentInDays={0}
      />,
    )
    expect(screen.getByText(/next visit today/i)).toBeInTheDocument()
  })

  it('shows "Next visit tomorrow" when the next appointment is in 1 day', () => {
    render(
      <PatientCarePulse
        weeklyVisits={[1, 2]}
        careTeamSize={1}
        nextAppointmentInDays={1}
      />,
    )
    expect(screen.getByText(/next visit tomorrow/i)).toBeInTheDocument()
  })

  it('accepts a className override on the outer panel', () => {
    const { container } = render(
      <PatientCarePulse
        weeklyVisits={[1, 2, 3]}
        careTeamSize={1}
        nextAppointmentInDays={2}
        className="custom-class"
      />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
