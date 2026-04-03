import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminDashboardHome from './page'

const MOCK_STATS = {
  activeProviders: 1204,
  pendingApprovals: 342,
  totalPatients: 8921,
  gmvMtd: 1240000,
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: () => Promise.resolve(MOCK_STATS),
  }))
})

describe('AdminDashboardHome', () => {
  it('renders all KPI cards after data loads', async () => {
    render(<AdminDashboardHome />)
    await waitFor(() => expect(screen.getByText(/Active Providers/i)).toBeInTheDocument())

    expect(screen.getByText('1,204')).toBeInTheDocument()
    expect(screen.getByText(/Pending Approvals/i)).toBeInTheDocument()
    expect(screen.getByText('342')).toBeInTheDocument()
    expect(screen.getByText(/Total Patients/i)).toBeInTheDocument()
    expect(screen.getByText('8,921')).toBeInTheDocument()
    expect(screen.getByText(/GMV \(MTD\)/i)).toBeInTheDocument()
    expect(screen.getByText('₹12.4L')).toBeInTheDocument()
  })

  it('renders chart placeholders after data loads', async () => {
    render(<AdminDashboardHome />)
    await waitFor(() => expect(screen.getByText(/Bookings Growth/i)).toBeInTheDocument())
    expect(screen.getByText(/Top Specialties/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Requires Recharts library/i).length).toBe(2)
  })

  it('has buttons with correct design tokens after data loads', async () => {
    render(<AdminDashboardHome />)
    await waitFor(() => expect(screen.getByRole('button', { name: /View Report/i })).toBeInTheDocument())
    const viewReportBtn = screen.getByRole('button', { name: /View Report/i })
    expect(viewReportBtn).toHaveClass('rounded-[24px]')
    expect(viewReportBtn).toHaveClass('text-bp-accent')
  })
})
