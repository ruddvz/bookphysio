import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientSearchV2Rail } from './PatientSearchV2Rail'

const mockV2 = vi.fn(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2(),
}))

describe('slice 16.22 — PatientSearchV2Rail', () => {
  beforeEach(() => {
    mockV2.mockReturnValue(true)
  })

  it('renders null when v2 is off', () => {
    mockV2.mockReturnValue(false)
    const { container } = render(<PatientSearchV2Rail />)
    expect(container.firstChild).toBeNull()
  })

  it('renders patient-search-v2-rail when v2 is on', () => {
    render(<PatientSearchV2Rail />)
    expect(screen.getByTestId('patient-search-v2-rail')).toBeInTheDocument()
  })

  it('hides active-filter count when no filters', () => {
    render(<PatientSearchV2Rail />)
    expect(screen.queryByTestId('active-filter-count')).not.toBeInTheDocument()
  })

  it('shows 1 filter when one specialty selected', () => {
    render(<PatientSearchV2Rail selectedSpecialty="back-pain" />)
    expect(screen.getByTestId('active-filter-count')).toHaveTextContent('1 filter')
  })

  it('calls onSpecialtyChange with slug when chip clicked', () => {
    const onSpecialtyChange = vi.fn()
    render(<PatientSearchV2Rail onSpecialtyChange={onSpecialtyChange} />)
    fireEvent.click(screen.getByTestId('specialty-chip-back-pain'))
    expect(onSpecialtyChange).toHaveBeenCalledWith('back-pain')
  })

  it('calls onSpecialtyChange(null) when active specialty clicked again', () => {
    const onSpecialtyChange = vi.fn()
    render(
      <PatientSearchV2Rail selectedSpecialty="back-pain" onSpecialtyChange={onSpecialtyChange} />,
    )
    fireEvent.click(screen.getByTestId('specialty-chip-back-pain'))
    expect(onSpecialtyChange).toHaveBeenCalledWith(null)
  })

  it('pincode input has maxLength 6 and aria-label', () => {
    render(<PatientSearchV2Rail />)
    const input = screen.getByTestId('pincode-input')
    expect(input).toHaveAttribute('maxLength', '6')
    expect(input).toHaveAttribute('aria-label', 'Filter by 6-digit Indian pincode')
  })
})
