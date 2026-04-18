import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { AdminPulseRail } from './AdminPulseRail'

const BASE_STATS = {
  activeProviders: 342,
  pendingApprovals: 12,
  totalPatients: 8921,
  gmvMtd: 1_240_000,
}

describe('AdminPulseRail', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the four KPI labels', () => {
    render(<AdminPulseRail {...BASE_STATS} />)
    expect(screen.getByText(/active providers/i)).toBeInTheDocument()
    expect(screen.getByText(/pending approvals/i)).toBeInTheDocument()
    expect(screen.getByText(/total patients/i)).toBeInTheDocument()
    expect(screen.getByText(/completed gmv/i)).toBeInTheDocument()
  })

  it('formats headline numbers with the en-IN locale', () => {
    render(<AdminPulseRail {...BASE_STATS} />)
    expect(screen.getByText('342')).toBeInTheDocument()
    expect(screen.getByText('8,921')).toBeInTheDocument()
  })

  it('formats GMV with a compact lakh/thousand suffix using integer rupees', () => {
    render(<AdminPulseRail {...BASE_STATS} />)
    expect(screen.getByText('₹12L')).toBeInTheDocument()
  })

  it('compacts GMV values below one lakh with a K suffix (integer only)', () => {
    render(<AdminPulseRail {...BASE_STATS} gmvMtd={42_500} />)
    expect(screen.getByText('₹42K')).toBeInTheDocument()
  })

  it('truncates fractional rupees before formatting so no paise leak through', () => {
    render(<AdminPulseRail {...BASE_STATS} gmvMtd={999.5} />)
    expect(screen.getByText('₹999')).toBeInTheDocument()
  })

  it('renders the primary review CTA pointing to the approval queue', () => {
    render(<AdminPulseRail {...BASE_STATS} />)
    const cta = screen.getByRole('link', { name: /open verification queue/i })
    expect(cta).toHaveAttribute('href', '/admin/listings')
  })

  it('respects a custom reviewHref override', () => {
    render(<AdminPulseRail {...BASE_STATS} reviewHref="/admin/listings?tab=new" />)
    const cta = screen.getByRole('link', { name: /open verification queue/i })
    expect(cta).toHaveAttribute('href', '/admin/listings?tab=new')
  })

  it('shows the action badge when approvals are pending', () => {
    render(<AdminPulseRail {...BASE_STATS} pendingApprovals={5} />)
    expect(screen.getByText(/action/i)).toBeInTheDocument()
  })

  it('omits the action badge when the approval queue is clear', () => {
    render(<AdminPulseRail {...BASE_STATS} pendingApprovals={0} />)
    expect(screen.queryByText(/action/i)).toBeNull()
  })

  it('renders sparklines with accessible labels for each KPI', () => {
    render(<AdminPulseRail {...BASE_STATS} />)
    expect(screen.getByRole('img', { name: /active providers trend/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /pending approvals trend/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /total patients trend/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /completed gmv trend/i })).toBeInTheDocument()
  })
})
