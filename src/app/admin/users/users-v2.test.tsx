import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RoleBadge } from './UsersV2'
import AdminUsers from './page'

const useUiV2Mock = vi.fn<() => boolean>(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

function renderAdminUsers() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={client}>
      <AdminUsers />
    </QueryClientProvider>,
  )
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('RoleBadge', () => {
  it('renders Patient as soft tone 1', () => {
    render(<RoleBadge role="Patient" />)
    expect(screen.getByTestId('role-badge-patient')).toHaveTextContent('Patient')
  })

  it('renders Provider as success', () => {
    render(<RoleBadge role="Provider" />)
    expect(screen.getByTestId('role-badge-provider')).toHaveTextContent('Provider')
  })

  it('renders Pending as warning', () => {
    render(<RoleBadge role="Pending" />)
    expect(screen.getByTestId('role-badge-pending')).toHaveTextContent('Pending')
  })

  it('renders Suspended as danger', () => {
    render(<RoleBadge role="Suspended" />)
    expect(screen.getByTestId('role-badge-suspended')).toHaveTextContent('Suspended')
  })
})

describe('AdminUsers ui-v2', () => {
  beforeEach(() => {
    useUiV2Mock.mockReset()
    vi.stubGlobal('fetch', vi.fn((input: string | URL | Request) => {
      const url = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url

      if (url.includes('/api/admin/users')) {
        return Promise.resolve(jsonResponse({
          users: [
            {
              id: 'patient-12345678',
              full_name: 'Priya Sharma',
              phone: '+91 98765 43210',
              role: 'patient',
              created_at: '2026-04-18T09:00:00.000Z',
            },
            {
              id: 'provider-87654321',
              full_name: 'Dr. Arjun Mehta',
              phone: '+91 99887 77665',
              role: 'provider',
              created_at: '2026-04-17T09:00:00.000Z',
            },
            {
              id: 'pending-13572468',
              full_name: 'Dr. Neha Rao',
              phone: '+91 91234 55667',
              role: 'provider_pending',
              created_at: '2026-04-16T09:00:00.000Z',
            },
          ],
          total: 3,
          page: 1,
          limit: 50,
        }))
      }

      if (url.includes('/api/admin/stats')) {
        return Promise.resolve(jsonResponse({
          activeProviders: 1,
          pendingApprovals: 1,
          totalPatients: 1,
          gmvMtd: 0,
        }))
      }

      return Promise.reject(new Error(`Unhandled fetch: ${url}`))
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows live registry data and role badges when flag on', async () => {
    useUiV2Mock.mockReturnValue(true)
    renderAdminUsers()

    expect(await screen.findByText('Priya Sharma')).toBeInTheDocument()
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/admin/users?page=1')
    expect(screen.getByTestId('role-badge-patient')).toBeInTheDocument()
    expect(screen.queryByText('Rahul Verma')).not.toBeInTheDocument()
    expect(screen.queryByText('USER OPERATIONS')).not.toBeInTheDocument()
    expect(screen.queryByText(/Manage patient profiles/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pending' }))
    expect(await screen.findByText('Dr. Neha Rao')).toBeInTheDocument()
    expect(screen.getByTestId('role-badge-pending')).toBeInTheDocument()
  })

  it('hides RoleBadge when flag off', async () => {
    useUiV2Mock.mockReturnValue(false)
    renderAdminUsers()

    expect(await screen.findByText('Priya Sharma')).toBeInTheDocument()
    expect(screen.queryByTestId('role-badge-patient')).toBeNull()
    expect(screen.queryByTestId('role-badge-pending')).toBeNull()
  })
})
