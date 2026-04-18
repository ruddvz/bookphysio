import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaiV2Shell } from './PaiV2Shell'
import { MotioV2Shell } from '../motio/MotioV2Shell'

const mockV2 = vi.fn(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2(),
}))

describe('slice 16.21 — PAI + Motio v2 shells', () => {
  beforeEach(() => {
    mockV2.mockReturnValue(true)
  })

  it('PaiV2Shell renders null when useUiV2 returns false', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<PaiV2Shell />)
    expect(container.firstChild).toBeNull()
  })

  it('PaiV2Shell renders data-testid when v2 is on', () => {
    render(<PaiV2Shell />)
    expect(screen.getByTestId('pai-v2-shell')).toBeInTheDocument()
  })

  it('PaiV2Shell shows the Specialist AI Badge text', () => {
    render(<PaiV2Shell />)
    expect(screen.getByText('Specialist AI')).toBeInTheDocument()
  })

  it('MotioV2Shell renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<MotioV2Shell />)
    expect(container.firstChild).toBeNull()
  })

  it('MotioV2Shell renders data-testid when v2 is on', () => {
    render(<MotioV2Shell />)
    expect(screen.getByTestId('motio-v2-shell')).toBeInTheDocument()
  })

  it('MotioV2Shell shows the Patient AI Badge text', () => {
    render(<MotioV2Shell />)
    expect(screen.getByText('Patient AI')).toBeInTheDocument()
  })
})
