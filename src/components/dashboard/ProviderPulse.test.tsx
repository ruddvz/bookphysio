import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import {
  computeLoadTrend,
  getBookingStatus,
  ProviderPulse,
} from './ProviderPulse'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('computeLoadTrend', () => {
  it('returns undefined for series shorter than 2 values', () => {
    expect(computeLoadTrend([])).toBeUndefined()
    expect(computeLoadTrend([3])).toBeUndefined()
  })

  it('computes a positive percentage delta when later weeks are busier', () => {
    expect(computeLoadTrend([1, 1, 3, 3])).toBe(200)
  })

  it('computes a negative percentage delta when later weeks are quieter', () => {
    expect(computeLoadTrend([4, 4, 1, 1])).toBe(-75)
  })

  it('returns undefined when the first-half baseline is zero', () => {
    expect(computeLoadTrend([0, 0, 2, 3])).toBeUndefined()
  })

  it('handles odd-length series by splitting at the midpoint', () => {
    expect(computeLoadTrend([2, 2, 2, 4, 4])).toBe(67)
  })
})

describe('getBookingStatus', () => {
  it('returns "In session" when visits remain today', () => {
    const status = getBookingStatus({ remainingToday: 3, weeklyLoad: [5, 4, 3, 2] })
    expect(status.label).toBe('In session')
    expect(status.tone).toBe('success')
  })

  it('returns "Busy week" when this week exceeds the heavy threshold and nothing is left today', () => {
    const status = getBookingStatus({ remainingToday: 0, weeklyLoad: [12, 4, 2, 1] })
    expect(status.label).toBe('Busy week')
    expect(status.tone).toBe('soft')
  })

  it('returns "Quiet week" when this week is empty but future weeks have bookings', () => {
    const status = getBookingStatus({ remainingToday: 0, weeklyLoad: [0, 3, 1, 2] })
    expect(status.label).toBe('Quiet week')
    expect(status.tone).toBe('soft')
  })

  it('returns "Open diary" when nothing is booked in the whole window', () => {
    const status = getBookingStatus({ remainingToday: 0, weeklyLoad: [0, 0, 0, 0] })
    expect(status.label).toBe('Open diary')
    expect(status.tone).toBe('warning')
  })

  it('returns "Steady" for a normal week with bookings', () => {
    const status = getBookingStatus({ remainingToday: 0, weeklyLoad: [4, 3, 2, 1] })
    expect(status.label).toBe('Steady')
    expect(status.tone).toBe('success')
  })

  it('prioritises "In session" over "Busy week" when today still has slots', () => {
    const status = getBookingStatus({ remainingToday: 2, weeklyLoad: [15, 0, 0, 0] })
    expect(status.label).toBe('In session')
  })
})

describe('<ProviderPulse />', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
  })

  afterEach(() => {
    setUiV2Cookie(false)
    cleanup()
  })

  it('renders nothing when ui-v2 is off', () => {
    setUiV2Cookie(false)
    const { container } = render(
      <ProviderPulse
        weeklyLoad={[4, 3, 2, 1]}
        remainingToday={2}
        firstVisitCount={1}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the weekly load sparkline with an accessible label', () => {
    render(
      <ProviderPulse
        weeklyLoad={[1, 2, 3, 4]}
        remainingToday={0}
        firstVisitCount={1}
      />,
    )
    expect(screen.getByRole('img', { name: /booking load/i })).toBeInTheDocument()
  })

  it('shows the in-session copy when remaining visits are left today', () => {
    render(
      <ProviderPulse
        weeklyLoad={[3, 2, 1, 0]}
        remainingToday={2}
        firstVisitCount={0}
      />,
    )
    expect(screen.getByText(/in session/i)).toBeInTheDocument()
    expect(screen.getByText(/2 more consults today/i)).toBeInTheDocument()
  })

  it('uses singular "1 first visit" copy when one new patient is booked', () => {
    render(
      <ProviderPulse
        weeklyLoad={[2, 2, 2, 2]}
        remainingToday={0}
        firstVisitCount={1}
      />,
    )
    expect(screen.getByText('1 first visit')).toBeInTheDocument()
  })

  it('uses plural "3 first visits" copy when multiple new patients are booked', () => {
    render(
      <ProviderPulse
        weeklyLoad={[2, 2, 2, 2]}
        remainingToday={0}
        firstVisitCount={3}
      />,
    )
    expect(screen.getByText('3 first visits')).toBeInTheDocument()
  })

  it('renders the "Quiet week" badge when this week is empty but later weeks are booked', () => {
    render(
      <ProviderPulse
        weeklyLoad={[0, 3, 2, 1]}
        remainingToday={0}
        firstVisitCount={0}
      />,
    )
    expect(screen.getByText(/quiet week/i)).toBeInTheDocument()
  })

  it('renders the "Open diary" badge and hides the sparkline when nothing is booked', () => {
    render(
      <ProviderPulse
        weeklyLoad={[0, 0, 0, 0]}
        remainingToday={0}
        firstVisitCount={0}
      />,
    )
    expect(screen.getByText(/open diary/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /booking load/i })).toBeNull()
    expect(screen.getByText(/share your profile/i)).toBeInTheDocument()
  })

  it('omits the trend chip when the weekly series is too short to compute a delta', () => {
    render(
      <ProviderPulse
        weeklyLoad={[3]}
        remainingToday={0}
        firstVisitCount={0}
      />,
    )
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('shows "1 more consult today" singular when only one slot remains', () => {
    render(
      <ProviderPulse
        weeklyLoad={[2, 1]}
        remainingToday={1}
        firstVisitCount={0}
      />,
    )
    expect(screen.getByText(/1 more consult today/i)).toBeInTheDocument()
  })

  it('accepts a className override on the outer panel', () => {
    const { container } = render(
      <ProviderPulse
        weeklyLoad={[2, 1, 1, 0]}
        remainingToday={0}
        firstVisitCount={0}
        className="custom-class"
      />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
