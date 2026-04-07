import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ProviderDashboardHome from '../page'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'provider-1',
      user_metadata: { full_name: 'Dr. Arun' },
    },
  }),
}))

vi.mock('@/components/ui/Skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
    <div>
      <p>{title}</p>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  ),
}))

type MockAppointment = {
  id: string
  patient_id?: string
  status: string
  visit_type: 'in_clinic' | 'home_visit'
  fee_inr: number
  notes?: string | null
  availabilities: { starts_at: string }
  patient: { id?: string; full_name: string | null } | null
  locations: { city: string }
}

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response
}

function buildAppointment(
  id: string,
  startsAt: string,
  patientName: string | null,
  overrides: Partial<MockAppointment> = {},
): MockAppointment {
  return {
    id,
    patient_id: `${id}-patient`,
    status: 'confirmed',
    visit_type: 'in_clinic',
    fee_inr: 900,
    notes: null,
    availabilities: { starts_at: startsAt },
    patient: patientName === null ? { full_name: null } : { id: `${id}-patient`, full_name: patientName },
    locations: { city: 'Mumbai' },
    ...overrides,
  }
}

describe('ProviderDashboardHome', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-04-15T09:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('shows only today appointments by default and reveals week appointments when the tab changes', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes('/api/appointments')) {
        return jsonResponse({
          appointments: [
            buildAppointment('today', '2026-04-15T10:30:00.000Z', 'Today Patient'),
            buildAppointment('week', '2026-04-17T12:30:00.000Z', 'Week Patient'),
          ],
        })
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<ProviderDashboardHome />)

    expect((await screen.findAllByText('Today Patient')).length).toBeGreaterThan(0)

    expect(fetchMock).toHaveBeenCalledWith('/api/appointments')
    expect(screen.queryByText('Week Patient')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'This Week' }))

    await waitFor(() => {
      expect(screen.getAllByText('Week Patient').length).toBeGreaterThan(0)
    })

    expect(screen.getByRole('button', { name: 'This Week' }).className).toContain('bg-white')
  }, 10000)

  it('uses India day boundaries when deciding what appears in the Today tab', async () => {
    vi.setSystemTime(new Date('2026-04-15T14:00:00.000Z'))

    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes('/api/appointments')) {
        return jsonResponse({
          appointments: [
            buildAppointment('today', '2026-04-15T12:00:00.000Z', 'Today Patient'),
            buildAppointment('tomorrow-ist', '2026-04-15T20:00:00.000Z', 'Tomorrow India Patient'),
          ],
        })
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<ProviderDashboardHome />)

    await waitFor(() => {
      expect(screen.getAllByText('Today Patient').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Next Session')).toBeInTheDocument()
    expect(screen.getAllByText('Tomorrow India Patient')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'This Week' }))

    await waitFor(() => {
      expect(screen.getAllByText('Tomorrow India Patient').length).toBeGreaterThan(1)
    })
  })

  it('computes earned revenue from completed sessions and keeps quick actions free of profile links', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes('/api/appointments')) {
        return jsonResponse({
          appointments: [
            buildAppointment('completed', '2026-04-15T08:30:00.000Z', 'Completed Patient', {
              status: 'completed',
              fee_inr: 1200,
            }),
          ],
        })
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)

    const { container } = render(<ProviderDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('₹1.2k')).toBeInTheDocument()
    })

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.queryByText('₹48,250')).toBeNull()
    expect(container.querySelectorAll('a[href="/provider/profile"]')).toHaveLength(0)
  })

  it('falls back gracefully when patient details are sparse', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes('/api/appointments')) {
        return jsonResponse({
          appointments: [
            buildAppointment('today', '2026-04-15T10:30:00.000Z', null, {
              notes: null,
              patient: { id: 'today-patient', full_name: null },
            }),
          ],
        })
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<ProviderDashboardHome />)

    await waitFor(() => {
      expect(screen.getAllByText('Patient').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Physiotherapy session')).toBeInTheDocument()
  })

  it('retries appointments loading from the error state', async () => {
    const appointmentResponses = [
      jsonResponse({ error: 'failed' }, false),
      jsonResponse({ appointments: [] }),
    ]

    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes('/api/appointments')) {
        const response = appointmentResponses.shift()

        if (!response) {
          throw new Error('Unexpected extra appointments fetch')
        }

        return response
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<ProviderDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('Clinical sync unavailable')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Retry Sync' }))

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/appointments'))).toHaveLength(2)
  })
})