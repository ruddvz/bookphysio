import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboardHome from './page'

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <AdminDashboardHome />
    </QueryClientProvider>
  )

  return { queryClient }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('AdminDashboardHome page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows the unavailable state when admin stats cannot be loaded', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: 'forbidden' }, 403))

    renderDashboard()

    expect(await screen.findByText("We couldn't load platform metrics")).toBeInTheDocument()
    expect(screen.queryByText('Completed GMV')).not.toBeInTheDocument()
    expect(screen.queryByText('PLATFORM')).not.toBeInTheDocument()
    expect(screen.queryByText('Live admin stats are temporarily unavailable.')).not.toBeInTheDocument()
  })

  it('hides cached admin metrics when the dashboard refresh fails', async () => {
    let mode: 'success' | 'stale' = 'success'

    vi.mocked(fetch).mockImplementation(() => {
      if (mode === 'stale') {
        return Promise.resolve(jsonResponse({ error: 'offline' }, 500))
      }

      return Promise.resolve(jsonResponse({
        activeProviders: 14,
        pendingApprovals: 3,
        totalPatients: 120,
        gmvMtd: 980000,
      }))
    })

    const { queryClient } = renderDashboard()

    expect(await screen.findByText('Completed GMV / provider')).toBeInTheDocument()

    mode = 'stale'
    await queryClient.invalidateQueries()

    expect(await screen.findByText("We couldn't load platform metrics")).toBeInTheDocument()
    expect(screen.queryAllByText('14')).toHaveLength(0)
  })

  it('renders the primary heading immediately while stats load', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}))

    renderDashboard()

    expect(screen.getByRole('heading', { name: 'Platform overview' })).toBeInTheDocument()
    expect(screen.queryByText('PLATFORM')).not.toBeInTheDocument()
  })
})