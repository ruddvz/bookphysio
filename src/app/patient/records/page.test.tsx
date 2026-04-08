import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PatientRecordsPage from './page'

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <PatientRecordsPage />
    </QueryClientProvider>
  )
}

describe('PatientRecordsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders visit summaries without exposing provider-only SOAP labels', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({
        records: [
          {
            visit_id: 'visit-3',
            visit_number: 3,
            visit_date: '2026-04-06',
            provider_name: 'Dr. Meera Iyer',
            patient_summary: 'Your shoulder is moving more freely this week.',
            plan: 'Keep doing the band routine once daily.',
          },
        ],
      }), { status: 200 })
    )

    renderWithQueryClient()

    expect(await screen.findByText('Dr. Meera Iyer')).toBeInTheDocument()
    expect(screen.getByText('Visit 3')).toBeInTheDocument()
    expect(screen.getByText('Your shoulder is moving more freely this week.')).toBeInTheDocument()
    expect(screen.getByText("What's next")).toBeInTheDocument()
    expect(screen.getByText('Keep doing the band routine once daily.')).toBeInTheDocument()
    expect(screen.queryByText(/clinical assessment/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/subjective/i)).not.toBeInTheDocument()
  })

  it('shows the empty state when no records are returned', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ records: [] }), { status: 200 })
    )

    renderWithQueryClient()

    expect(await screen.findByText('No visit summaries yet')).toBeInTheDocument()
    expect(screen.getByText(/After your next physio session/i)).toBeInTheDocument()
  })

  it('shows the shared-summary placeholder when the provider has not published one yet', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({
        records: [
          {
            visit_id: 'visit-2',
            visit_number: 2,
            visit_date: '2026-04-05',
            provider_name: 'Dr. Arjun Patel',
            patient_summary: null,
            plan: null,
          },
        ],
      }), { status: 200 })
    )

    renderWithQueryClient()

    expect(await screen.findByText('Dr. Arjun Patel')).toBeInTheDocument()
    expect(screen.getByText(/hasn't shared a summary for this visit yet/i)).toBeInTheDocument()
  })

  it('shows the error state when the fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'boom' }), { status: 500 })
    )

    renderWithQueryClient()

    expect(await screen.findByText("We couldn't load your care summary")).toBeInTheDocument()
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/patient/records')
    })
  })
})