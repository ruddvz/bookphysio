import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderEarningsV2Chrome } from './ProviderEarningsV2Chrome'

const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('ProviderEarningsV2Chrome', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
  })

  const monthKeys = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'] as const

  it('returns null when ui-v2 is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(
      <ProviderEarningsV2Chrome
        monthlySettled={[1000, 1200, 1100, 1300, 1250, 1400]}
        monthKeys={monthKeys}
        totalSettledInr={7250}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders pulse strip when ui-v2 is on', () => {
    render(
      <ProviderEarningsV2Chrome
        monthlySettled={[1000, 1200, 1100, 1300, 1250, 1400]}
        monthKeys={monthKeys}
        totalSettledInr={7250}
      />,
    )
    expect(screen.getByTestId('provider-earnings-v2-chrome')).toBeInTheDocument()
    expect(screen.getByLabelText('Monthly settled net trend')).toBeInTheDocument()
    expect(screen.getByText(/₹7,?250/)).toBeInTheDocument()
    expect(screen.getByText('Weekly payout · Thu')).toBeInTheDocument()
  })
})
