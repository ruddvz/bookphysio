import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PatientDashboardHome from './page'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      user_metadata: {
        full_name: 'Riya Sharma',
      },
    },
  }),
}))

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <PatientDashboardHome />
    </QueryClientProvider>
  )

  return { queryClient }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('PatientDashboardHome page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('counts only patient-facing summaries in the dashboard metrics', async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)

      if (url === '/api/patient/records?view=dashboard') {
        return Promise.resolve(jsonResponse({
          records: [
            {
              visit_id: 'visit-1',
              visit_number: 1,
              visit_date: '2026-04-10',
              provider_name: 'Dr. Meera Iyer',
              patient_summary: null,
              plan: 'Continue home stretches daily.',
            },
            {
              visit_id: 'visit-2',
              visit_number: 2,
              visit_date: '2026-04-12',
              provider_name: 'Dr. Meera Iyer',
              patient_summary: 'Your shoulder movement has improved.',
              plan: 'Keep progressing resistance work.',
            },
          ],
        }))
      }

      return Promise.resolve(jsonResponse({ appointments: [] }))
    })

    renderDashboard()

    const summariesTile = await screen.findByText('Visit summaries')
    expect(summariesTile.parentElement).toHaveTextContent('1')

    const snapshotRow = screen.getByText('Published summaries')
    expect(snapshotRow.parentElement).toHaveTextContent('1')
  })

  it('shows the unavailable state when patient dashboard access fails', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: 'forbidden' }, 403))

    renderDashboard()

    expect(await screen.findByText("We couldn't load your latest care updates")).toBeInTheDocument()
  })

  it('hides cached patient data when the dashboard cannot be refreshed', async () => {
    let mode: 'success' | 'offline' = 'success'

    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)

      if (mode === 'offline') {
        return Promise.resolve(jsonResponse({ error: 'offline' }, 500))
      }

      if (url === '/api/patient/records?view=dashboard') {
        return Promise.resolve(jsonResponse({
          records: [
            {
              visit_id: 'visit-2',
              visit_number: 2,
              visit_date: '2026-04-12',
              provider_name: 'Dr. Meera Iyer',
              patient_summary: 'Your shoulder movement has improved.',
              plan: 'Keep progressing resistance work.',
            },
          ],
        }))
      }

      return Promise.resolve(jsonResponse({ appointments: [] }))
    })

    const { queryClient } = renderDashboard()

    expect((await screen.findAllByText('Dr. Meera Iyer')).length).toBeGreaterThan(0)

    mode = 'offline'
    await queryClient.invalidateQueries()

    expect(await screen.findByText("We couldn't load your latest care updates")).toBeInTheDocument()
    expect(screen.queryAllByText('Dr. Meera Iyer')).toHaveLength(0)
  })
})