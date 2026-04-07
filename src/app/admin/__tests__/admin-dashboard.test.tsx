import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AdminDashboardHome from '../page'

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response
}

describe('AdminDashboardHome', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('uses live pending approval counts instead of the old hardcoded values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      activeProviders: 5000,
      pendingApprovals: 42,
      totalPatients: 12000,
      gmvMtd: 500000,
    })))

    render(<AdminDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('Pending Approvals').closest('a')).toHaveTextContent('42')
    })

    expect(screen.queryByText('18 pending')).toBeNull()
  })

  it('shows the live GMV card value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      activeProviders: 5000,
      pendingApprovals: 42,
      totalPatients: 12000,
      gmvMtd: 500000,
    })))

    render(<AdminDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('GMV This Month').closest('a')).toHaveTextContent('₹5.0L')
    })

    expect(screen.queryByText(/illustrative/i)).toBeNull()
    expect(screen.getByText('Platform Revenue')).toBeInTheDocument()
  })

  it('links the queue preview to the full listings screen', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      activeProviders: 5000,
      pendingApprovals: 42,
      totalPatients: 12000,
      gmvMtd: 500000,
    })))

    render(<AdminDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('Active Providers').closest('a')).toHaveTextContent('5,000')
    })

    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/admin/listings')
  })

  it('shows an explicit warning when live admin stats fail to load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failed')))

    render(<AdminDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText(/Live admin stats unavailable/i)).toBeInTheDocument()
    })

    expect(screen.getByText('Active Providers').closest('a')).toHaveTextContent('—')
    expect(screen.getByText('Platform Overview')).toBeInTheDocument()
  })
})