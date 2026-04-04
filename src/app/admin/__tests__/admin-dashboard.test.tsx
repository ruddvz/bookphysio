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
      expect(screen.getByText('42 pending')).toBeInTheDocument()
    })

    expect(screen.queryByText('18 pending')).toBeNull()
    expect(screen.getByText('Profiles waiting on review').closest('div')).toHaveTextContent('42')
  })

  it('shows the illustrative revenue label', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      activeProviders: 5000,
      pendingApprovals: 42,
      totalPatients: 12000,
      gmvMtd: 500000,
    })))

    render(<AdminDashboardHome />)

    await waitFor(() => {
      expect(screen.getAllByText(/illustrative/i).length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Confirmed sessions this week').closest('div')).toHaveTextContent('Illustrative')
    expect(screen.getByText('Profiles waiting on review').closest('div')).toHaveTextContent('Live')
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
      expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/admin/listings')
    })
  })

  it('shows an explicit error state when live admin stats fail to load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failed')))

    render(<AdminDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('Admin stats unavailable')).toBeInTheDocument()
    })
  })
})