import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientSearchFiltersRail } from './PatientSearchFiltersRail'

const push = vi.fn()
const replace = vi.fn()
let mockParams = new URLSearchParams('')

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => mockParams,
}))

describe('PatientSearchFiltersRail', () => {
  beforeEach(() => {
    push.mockClear()
    replace.mockClear()
    mockParams = new URLSearchParams('')
  })

  it('renders the v2 rail test id', () => {
    render(<PatientSearchFiltersRail />)
    expect(screen.getByTestId('patient-search-filters-rail-v2')).toBeInTheDocument()
  })

  it('pushes specialty when a specialty is chosen from the pill', () => {
    render(<PatientSearchFiltersRail />)
    fireEvent.click(screen.getByRole('button', { name: /specialty/i }))
    fireEvent.click(screen.getByRole('option', { name: 'Sports' }))
    expect(push).toHaveBeenCalledWith(expect.stringContaining('specialty=Sports'))
  })

  it('commits a valid 6-digit pincode on blur', () => {
    mockParams = new URLSearchParams('')
    render(<PatientSearchFiltersRail />)
    const input = screen.getByLabelText(/pincode/i)
    fireEvent.change(input, { target: { value: '560001' } })
    fireEvent.blur(input)
    expect(push).toHaveBeenCalledWith(expect.stringContaining('pincode=560001'))
  })

  it('does not push an invalid partial pincode on blur', () => {
    render(<PatientSearchFiltersRail />)
    const input = screen.getByLabelText(/pincode/i)
    fireEvent.change(input, { target: { value: '56000' } })
    fireEvent.blur(input)
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByText(/valid 6-digit pincode/i)).toBeInTheDocument()
  })

  it('sets visit_type in the URL when Home Visit is selected', () => {
    render(<PatientSearchFiltersRail />)
    fireEvent.click(screen.getByRole('button', { name: 'Home Visit' }))
    expect(push).toHaveBeenCalledWith(expect.stringContaining('visit_type=home_visit'))
  })

  it('sets sort=availability when Soonest slot is selected', () => {
    render(<PatientSearchFiltersRail />)
    fireEvent.click(screen.getByRole('button', { name: 'Soonest slot' }))
    expect(push).toHaveBeenCalledWith(expect.stringContaining('sort=availability'))
  })
})
