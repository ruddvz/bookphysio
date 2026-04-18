import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProviderEarningsV2 } from './ProviderEarningsV2'
import { buildEarningsSparkline, formatInrPv, pctChange } from './earnings-v2-utils'

const mockV2 = vi.fn(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2(),
}))

describe('slice 16.26 — provider earnings v2', () => {
  beforeEach(() => {
    mockV2.mockReturnValue(true)
  })

  it('ProviderEarningsV2 renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<ProviderEarningsV2 transactions={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders data-testid when v2 is on', () => {
    render(<ProviderEarningsV2 transactions={[]} />)
    expect(screen.getByTestId('provider-earnings-v2')).toBeInTheDocument()
  })

  it('shows ₹0 gross when transactions is empty', () => {
    render(<ProviderEarningsV2 transactions={[]} />)
    expect(screen.getByTestId('kpi-gross')).toHaveTextContent('₹0')
  })

  it('formatInrPv(1234) returns ₹1,234', () => {
    expect(formatInrPv(1234)).toBe('₹1,234')
  })

  it('pctChange(120, 100) returns 20', () => {
    expect(pctChange(120, 100)).toBe(20)
  })

  it('pctChange(100, 0) returns null', () => {
    expect(pctChange(100, 0)).toBeNull()
  })

  it('buildEarningsSparkline returns array of length 6', () => {
    expect(buildEarningsSparkline([], Date.now())).toHaveLength(6)
  })
})
