import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatIndiaDate, formatIndiaDateInput, parseIndiaDate } from '@/lib/india-date'
import ProviderDashboardHome from './page'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      user_metadata: {
        full_name: 'Asha Rao',
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
      <ProviderDashboardHome />
    </QueryClientProvider>
  )

  return { queryClient }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

function getTodayAndTomorrowKeys(): { yesterdayKey: string; todayKey: string; tomorrowKey: string } {
  const todayKey = formatIndiaDateInput(new Date())
  const yesterdayKey = formatIndiaDateInput(new Date(parseIndiaDate(todayKey).getTime() - 24 * 60 * 60 * 1000))
  const tomorrowKey = formatIndiaDateInput(new Date(parseIndiaDate(todayKey).getTime() + 24 * 60 * 60 * 1000))
  return { yesterdayKey, todayKey, tomorrowKey }
}

describe('ProviderDashboardHome page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows the next consult from future schedule entries and keeps the most recent patient visible', async () => {
    const { yesterdayKey, tomorrowKey } = getTodayAndTomorrowKeys()
    const tomorrowLabel = `${formatIndiaDate(tomorrowKey, { day: 'numeric', month: 'short' })} at 9:00 AM`

    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)

      if (url.startsWith('/api/provider/schedule')) {
        return Promise.resolve(jsonResponse({
          entries: [
            {
              visit_id: 'past-visit',
              profile_id: 'profile-1',
              patient_name: 'Past Patient',
              visit_date: yesterdayKey,
              visit_time: '00:30',
              fee_inr: 900,
              visit_number: 2,
            },
            {
              visit_id: 'next-visit',
              profile_id: 'profile-2',
              patient_name: 'Tomorrow Patient',
              visit_date: tomorrowKey,
              visit_time: '09:00',
              fee_inr: 1100,
              visit_number: 1,
            },
          ],
        }))
      }

      return Promise.resolve(jsonResponse({
        patients: [
          { profile_id: 'patient-1', patient_name: 'Aman', visit_count: 2, last_visit_date: '2026-04-10' },
          { profile_id: 'patient-2', patient_name: 'Bhavna', visit_count: 3, last_visit_date: '2026-04-11' },
          { profile_id: 'patient-3', patient_name: 'Charu', visit_count: 1, last_visit_date: '2026-04-09' },
          { profile_id: 'patient-4', patient_name: 'Deepak', visit_count: 4, last_visit_date: '2026-04-08' },
          { profile_id: 'patient-5', patient_name: 'Esha', visit_count: 5, last_visit_date: '2026-04-07' },
          { profile_id: 'patient-6', patient_name: 'Latest Patient', visit_count: 1, last_visit_date: '2026-04-15' },
        ],
      }))
    })

    renderDashboard()

    expect(await screen.findByText('Tomorrow Patient')).toBeInTheDocument()
    expect(screen.getByText(tomorrowLabel)).toBeInTheDocument()
    expect(screen.getByText('Scheduled fees')).toBeInTheDocument()
    expect(screen.getByText('Latest Patient')).toBeInTheDocument()
  })

  it('replaces cached clinic data with an unavailable state when access is revoked', async () => {
    const { todayKey } = getTodayAndTomorrowKeys()
    let mode: 'success' | 'denied' = 'success'

    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)

      if (mode === 'denied') {
        return Promise.resolve(jsonResponse({ error: 'forbidden' }, 403))
      }

      if (url.startsWith('/api/provider/schedule')) {
        return Promise.resolve(jsonResponse({
          entries: [
            {
              visit_id: 'stale-visit',
              profile_id: 'profile-1',
              patient_name: 'Stale Patient',
              visit_date: todayKey,
              visit_time: '23:00',
              fee_inr: 900,
              visit_number: 2,
            },
          ],
        }))
      }

      return Promise.resolve(jsonResponse({
        patients: [
          { profile_id: 'patient-1', patient_name: 'Stale Patient', visit_count: 2, last_visit_date: '2026-04-15' },
        ],
      }))
    })

    const { queryClient } = renderDashboard()

    expect((await screen.findAllByText('Stale Patient')).length).toBeGreaterThan(0)

    mode = 'denied'
    await queryClient.invalidateQueries()

    expect(await screen.findByText("We couldn't load your latest schedule")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryAllByText('Stale Patient')).toHaveLength(0)
    })
  })

  it('hides cached clinic data when refresh fails after the initial load', async () => {
    const { todayKey } = getTodayAndTomorrowKeys()
    let mode: 'success' | 'offline' = 'success'

    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)

      if (mode === 'offline') {
        return Promise.resolve(jsonResponse({ error: 'offline' }, 500))
      }

      if (url.startsWith('/api/provider/schedule')) {
        return Promise.resolve(jsonResponse({
          entries: [
            {
              visit_id: 'live-visit',
              profile_id: 'profile-1',
              patient_name: 'Live Patient',
              visit_date: todayKey,
              visit_time: '23:00',
              fee_inr: 900,
              visit_number: 2,
            },
          ],
        }))
      }

      return Promise.resolve(jsonResponse({
        patients: [
          { profile_id: 'patient-1', patient_name: 'Live Patient', visit_count: 2, last_visit_date: todayKey },
        ],
      }))
    })

    const { queryClient } = renderDashboard()

    expect((await screen.findAllByText('Live Patient')).length).toBeGreaterThan(0)

    mode = 'offline'
    await queryClient.invalidateQueries()

    expect(await screen.findByText("We couldn't load your latest schedule")).toBeInTheDocument()
    expect(screen.queryAllByText('Live Patient')).toHaveLength(0)
  })
})
