import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AdminDashboardHome from './page'

describe('AdminDashboardHome', () => {
  it('renders all KPI cards with correct stats', () => {
    render(<AdminDashboardHome />)
    expect(screen.getByText(/Active Providers/i)).toBeInTheDocument()
    expect(screen.getByText('1,204')).toBeInTheDocument()
    
    expect(screen.getByText(/Pending Approvals/i)).toBeInTheDocument()
    expect(screen.getByText('342')).toBeInTheDocument()
    
    expect(screen.getByText(/Total Patients/i)).toBeInTheDocument()
    expect(screen.getByText('8,921')).toBeInTheDocument()
    
    expect(screen.getByText(/GMV \(MTD\)/i)).toBeInTheDocument()
    expect(screen.getByText('₹12.4L')).toBeInTheDocument()
  })

  it('renders chart placeholders', () => {
    render(<AdminDashboardHome />)
    expect(screen.getByText(/Bookings Growth/i)).toBeInTheDocument()
    expect(screen.getByText(/Top Specialties/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Requires Recharts library/i).length).toBe(2)
  })

  it('has buttons with correct design tokens', () => {
    render(<AdminDashboardHome />)
    const viewReportBtn = screen.getByRole('button', { name: /View Report/i })
    expect(viewReportBtn).toHaveClass('rounded-[24px]')
    expect(viewReportBtn).toHaveClass('text-[#00766C]')
  })
})
