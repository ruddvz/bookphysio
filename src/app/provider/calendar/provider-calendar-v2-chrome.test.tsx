import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderCalendarV2Chrome } from './ProviderCalendarV2Chrome'

const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('ProviderCalendarV2Chrome', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
  })

  it('returns null when ui-v2 is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(<ProviderCalendarV2Chrome bookingsPerDay={[1, 2, 1, 0, 0, 1, 2]} weekTotalRupees={5000} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders pulse strip when ui-v2 is on', () => {
    render(<ProviderCalendarV2Chrome bookingsPerDay={[1, 2, 1, 0, 0, 1, 2]} weekTotalRupees={8000} />)
    expect(screen.getByTestId('provider-calendar-v2-chrome')).toBeInTheDocument()
    expect(screen.getByLabelText('Weekly booking load')).toBeInTheDocument()
    expect(screen.getByText(/₹8,?000/)).toBeInTheDocument()
  })
})
