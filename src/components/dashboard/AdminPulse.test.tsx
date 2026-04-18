import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import {
  AdminPulse,
  computePlatformTrend,
  getPlatformStatus,
} from './AdminPulse'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('computePlatformTrend', () => {
  it('returns undefined for series shorter than 2 values', () => {
    expect(computePlatformTrend([])).toBeUndefined()
    expect(computePlatformTrend([42])).toBeUndefined()
  })

  it('computes a positive percentage delta when appointments are rising', () => {
    expect(computePlatformTrend([1, 1, 3, 3])).toBe(200)
  })

  it('computes a negative percentage delta when appointments are falling', () => {
    expect(computePlatformTrend([4, 4, 1, 1])).toBe(-75)
  })

  it('returns undefined when the first-half baseline is zero', () => {
    expect(computePlatformTrend([0, 0, 2, 3])).toBeUndefined()
  })

  it('handles odd-length series by splitting at the midpoint', () => {
    expect(computePlatformTrend([2, 2, 2, 4, 4])).toBe(67)
  })
})

describe('getPlatformStatus', () => {
  it('returns "No activity" when the platform has zero appointments', () => {
    const status = getPlatformStatus({
      monthlyAppointments: [0, 0, 0, 0, 0, 0, 0],
      completionRate: 0,
      totalAppointments: 0,
    })
    expect(status.label).toBe('No activity')
    expect(status.tone).toBe('warning')
  })

  it('returns "Watch list" when completion rate is below the threshold', () => {
    const status = getPlatformStatus({
      monthlyAppointments: [10, 12, 11, 13, 14, 12, 13],
      completionRate: 42,
      totalAppointments: 300,
    })
    expect(status.label).toBe('Watch list')
    expect(status.tone).toBe('warning')
  })

  it('returns "Cooling" when volume is trending sharply down despite healthy completion', () => {
    const status = getPlatformStatus({
      monthlyAppointments: [20, 18, 16, 10, 8, 6, 4],
      completionRate: 88,
      totalAppointments: 500,
    })
    expect(status.label).toBe('Cooling')
    expect(status.tone).toBe('soft')
  })

  it('returns "Healthy" when volume is rising and completion is strong', () => {
    const status = getPlatformStatus({
      monthlyAppointments: [2, 3, 4, 6, 8, 10, 12],
      completionRate: 91,
      totalAppointments: 200,
    })
    expect(status.label).toBe('Healthy')
    expect(status.tone).toBe('success')
  })

  it('returns "Steady" for flat, healthy operations', () => {
    const status = getPlatformStatus({
      monthlyAppointments: [10, 10, 10, 10, 10, 10, 10],
      completionRate: 85,
      totalAppointments: 500,
    })
    expect(status.label).toBe('Steady')
    expect(status.tone).toBe('success')
  })

  it('prioritises "Watch list" over "Cooling" when completion rate is the real problem', () => {
    const status = getPlatformStatus({
      monthlyAppointments: [20, 18, 16, 10, 8, 6, 4],
      completionRate: 40,
      totalAppointments: 500,
    })
    expect(status.label).toBe('Watch list')
  })
})

describe('<AdminPulse />', () => {
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
      <AdminPulse
        monthlyAppointments={[1, 2, 3, 4, 5, 6, 7]}
        completionRate={90}
        totalAppointments={100}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the appointment volume sparkline with an accessible label', () => {
    render(
      <AdminPulse
        monthlyAppointments={[1, 2, 3, 4, 5, 6, 7]}
        completionRate={88}
        totalAppointments={28}
      />,
    )
    expect(screen.getByRole('img', { name: /appointment volume/i })).toBeInTheDocument()
  })

  it('shows the "Healthy" badge and rising copy when growth is strong', () => {
    render(
      <AdminPulse
        monthlyAppointments={[2, 3, 4, 6, 8, 10, 12]}
        completionRate={92}
        totalAppointments={45}
      />,
    )
    expect(screen.getByText(/healthy/i)).toBeInTheDocument()
    expect(screen.getByText(/rising/i)).toBeInTheDocument()
  })

  it('renders the completion rate with one decimal precision', () => {
    render(
      <AdminPulse
        monthlyAppointments={[3, 3, 3, 3, 3, 3, 3]}
        completionRate={87.25}
        totalAppointments={42}
      />,
    )
    expect(screen.getByText(/87\.3%/)).toBeInTheDocument()
  })

  it('renders the "No activity" badge and hides the sparkline when nothing has happened yet', () => {
    render(
      <AdminPulse
        monthlyAppointments={[0, 0, 0, 0, 0, 0, 0]}
        completionRate={0}
        totalAppointments={0}
      />,
    )
    expect(screen.getByText(/no activity/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /appointment volume/i })).toBeNull()
    expect(screen.getByText(/onboard providers/i)).toBeInTheDocument()
  })

  it('omits the trend chip when the monthly series is too short to compute a delta', () => {
    render(
      <AdminPulse
        monthlyAppointments={[5]}
        completionRate={80}
        totalAppointments={5}
      />,
    )
    // The "vs prior window" caption lives next to the trend chip, so
    // its absence is the clearest signal that the chip was suppressed.
    expect(screen.queryByText(/vs prior window/i)).toBeNull()
  })

  it('renders the "Watch list" badge when completion rate is low', () => {
    render(
      <AdminPulse
        monthlyAppointments={[10, 11, 12, 13, 14, 15, 16]}
        completionRate={35}
        totalAppointments={200}
      />,
    )
    expect(screen.getByText(/watch list/i)).toBeInTheDocument()
  })

  it('renders the "Cooling" badge when volume is falling sharply', () => {
    render(
      <AdminPulse
        monthlyAppointments={[20, 18, 15, 9, 7, 5, 3]}
        completionRate={85}
        totalAppointments={400}
      />,
    )
    expect(screen.getByText(/cooling/i)).toBeInTheDocument()
  })

  it('accepts a className override on the outer panel', () => {
    const { container } = render(
      <AdminPulse
        monthlyAppointments={[5, 6, 7, 8, 9, 10, 11]}
        completionRate={80}
        totalAppointments={100}
        className="custom-class"
      />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
