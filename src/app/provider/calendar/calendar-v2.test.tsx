import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CalendarV2Header } from './CalendarV2Header'
import { AvailabilityV2StatusBar } from '../availability/AvailabilityV2StatusBar'

const mockV2 = vi.fn(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2(),
}))

describe('slice 16.25 — calendar + availability v2 chrome', () => {
  beforeEach(() => {
    mockV2.mockReturnValue(true)
  })

  it('CalendarV2Header renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<CalendarV2Header />)
    expect(container.firstChild).toBeNull()
  })

  it('CalendarV2Header renders data-testid when v2 is on', () => {
    render(<CalendarV2Header />)
    expect(screen.getByTestId('calendar-v2-header')).toBeInTheDocument()
  })

  it('shows Clinical Calendar heading', () => {
    render(<CalendarV2Header />)
    expect(screen.getByRole('heading', { name: /Clinical Calendar/i })).toBeInTheDocument()
  })

  it('shows IST badge', () => {
    render(<CalendarV2Header />)
    expect(screen.getByText('IST')).toBeInTheDocument()
  })

  it('AvailabilityV2StatusBar renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<AvailabilityV2StatusBar />)
    expect(container.firstChild).toBeNull()
  })

  it('AvailabilityV2StatusBar renders data-testid when v2 is on', () => {
    render(<AvailabilityV2StatusBar />)
    expect(screen.getByTestId('availability-v2-status-bar')).toBeInTheDocument()
  })
})
