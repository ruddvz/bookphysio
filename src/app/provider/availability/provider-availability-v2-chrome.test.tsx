import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderAvailabilityV2Chrome } from './ProviderAvailabilityV2Chrome'
import {
  cloneProviderMultiSlotSchedule,
  DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE,
} from '@/lib/provider-availability'

const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('ProviderAvailabilityV2Chrome', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
  })

  it('returns null when ui-v2 is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const schedule = cloneProviderMultiSlotSchedule(DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE)
    const { container } = render(<ProviderAvailabilityV2Chrome schedule={schedule} durationMinutes={30} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders template pulse when ui-v2 is on', () => {
    const schedule = cloneProviderMultiSlotSchedule(DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE)
    render(<ProviderAvailabilityV2Chrome schedule={schedule} durationMinutes={30} />)
    expect(screen.getByTestId('provider-availability-v2-chrome')).toBeInTheDocument()
    expect(screen.getByLabelText('Availability windows per day')).toBeInTheDocument()
    expect(screen.getByText('30m cadence')).toBeInTheDocument()
  })
})
