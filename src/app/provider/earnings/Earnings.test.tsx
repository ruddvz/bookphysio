import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProviderEarnings from './page'

const appointmentsResponse = {
  appointments: [
    {
      id: '1',
      fee_inr: 800,
      status: 'completed',
      created_at: '2026-03-28T10:00:00.000Z',
      visit_type: 'in_clinic',
      payment_status: 'paid',
      payment_amount_inr: 944,
      payment_gst_amount_inr: 144,
      patient: { full_name: 'Rahul Sharma', avatar_url: null },
      availabilities: { starts_at: '2026-03-28T10:00:00.000Z' },
    },
    {
      id: '2',
      fee_inr: 1200,
      status: 'confirmed',
      created_at: '2026-03-27T11:30:00.000Z',
      visit_type: 'home_visit',
      payment_status: 'created',
      payment_amount_inr: 1416,
      payment_gst_amount_inr: 216,
      patient: { full_name: 'Priya Patel', avatar_url: null },
      availabilities: { starts_at: '2026-03-27T11:30:00.000Z' },
    },
    {
      id: '3',
      fee_inr: 800,
      status: 'completed',
      created_at: '2026-03-25T09:00:00.000Z',
      visit_type: 'in_clinic',
      payment_status: 'paid',
      payment_amount_inr: 944,
      payment_gst_amount_inr: 144,
      patient: { full_name: 'Amit Kumar', avatar_url: null },
      availabilities: { starts_at: '2026-03-25T09:00:00.000Z' },
    },
    {
      id: '4',
      fee_inr: 1500,
      status: 'completed',
      created_at: '2026-03-24T17:00:00.000Z',
      visit_type: 'home_visit',
      payment_status: 'paid',
      payment_amount_inr: 1770,
      payment_gst_amount_inr: 270,
      patient: { full_name: 'Sneha Gupta', avatar_url: null },
      availabilities: { starts_at: '2026-03-24T17:00:00.000Z' },
    },
    {
      id: '5',
      fee_inr: 1000,
      status: 'completed',
      created_at: '2026-03-22T16:00:00.000Z',
      visit_type: 'in_clinic',
      payment_status: 'paid',
      payment_amount_inr: 1180,
      payment_gst_amount_inr: 180,
      patient: { full_name: 'Vikram Singh', avatar_url: null },
      availabilities: { starts_at: '2026-03-22T16:00:00.000Z' },
    },
  ],
}

const profileResponse = {
  full_name: 'Dr Priya Iyer',
  consultation_fee_inr: 900,
  iap_registration_no: 'IAP-2026-44',
}

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <ProviderEarnings />
    </QueryClientProvider>
  )
}

function getBillPreview() {
  const previewRoot = screen.getByText(/Dr Priya Iyer/i).closest('.print-bill')

  expect(previewRoot).not.toBeNull()

  return within(previewRoot as HTMLElement)
}

describe('ProviderEarnings', () => {
  beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {})

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: string | URL | Request) => {
        const url = typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url

        if (url === '/api/appointments') {
          return Promise.resolve({
            ok: true,
            json: async () => appointmentsResponse,
          })
        }

        if (url === '/api/profile') {
          return Promise.resolve({
            ok: true,
            json: async () => profileResponse,
          })
        }

        return Promise.reject(new Error(`Unhandled fetch request in test: ${url}`))
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders summary stats with correct formatting', async () => {
    renderWithQueryClient()

    await screen.findByText(/total revenue/i)
    expect(screen.getAllByText('₹4,100')).toHaveLength(2)
    expect(screen.getByText('₹738')).toBeInTheDocument()

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/appointments')
    })
  })

  it('renders transaction list with correct data', async () => {
    renderWithQueryClient()

    expect(await screen.findByText(/Rahul Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/28 Mar 2026/i)).toBeInTheDocument()
    expect(screen.getAllByText(/₹800/i)[0]).toBeInTheDocument()
  })

  it('displays status badges correctly', async () => {
    renderWithQueryClient()

    const paidBadges = await screen.findAllByText(/Paid/i)
    const pendingBadges = screen.getAllByText(/Pending/i)

    expect(paidBadges.length).toBeGreaterThan(0)
    expect(pendingBadges.length).toBeGreaterThan(0)
  })

  it('shows chart placeholder', async () => {
    renderWithQueryClient()

    expect(await screen.findByText(/Revenue Growth/i)).toBeInTheDocument()
    expect(screen.getByText(/Interactive charts coming soon/i)).toBeInTheDocument()
  })

  it('links to the bill generator page', async () => {
    renderWithQueryClient()
    const link = await screen.findByRole('link', { name: /generate bill/i })
    expect(link).toHaveAttribute('href', '/provider/bills/new')
  })
})
