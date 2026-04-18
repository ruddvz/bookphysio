import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProviderNotificationsV2 } from './ProviderNotificationsV2'

const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function withProvider(node: React.ReactNode, qc?: QueryClient) {
  const client = qc ?? makeQC()
  return <QueryClientProvider client={client}>{node}</QueryClientProvider>
}

const notificationsResponse = {
  notifications: [
    {
      id: 'n1',
      type: 'appointment_confirmed',
      title: 'Appointment confirmed',
      body: 'Session confirmed.',
      read: false,
      created_at: '2026-04-18T06:00:00Z',
    },
    {
      id: 'n2',
      type: 'new_message',
      title: 'New message',
      body: 'Patient sent a message.',
      read: true,
      created_at: '2026-04-17T09:00:00Z',
    },
  ],
}

describe('ProviderNotificationsV2', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url === '/api/notifications' && init?.method === 'PATCH') {
          return new Response(JSON.stringify({ ok: true }), { status: 200 })
        }
        if (url.includes('/api/notifications') && !url.includes('/read')) {
          return new Response(JSON.stringify(notificationsResponse), { status: 200 })
        }
        if (url.includes('/read')) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 })
        }
        return new Response(JSON.stringify({}), { status: 200 })
      })
    )
  })

  afterEach(() => {
    useUiV2Mock.mockReset()
    vi.unstubAllGlobals()
  })

  it('returns null when v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(withProvider(<ProviderNotificationsV2 />))
    expect(container.firstChild).toBeNull()
  })

  it('renders v2-notifications-root when flag is on', async () => {
    render(withProvider(<ProviderNotificationsV2 />))
    const root = await screen.findByTestId('v2-notifications-root')
    expect(root).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows unread count Badge when unread > 0', async () => {
    render(withProvider(<ProviderNotificationsV2 />))
    const badge = await screen.findByTestId('v2-unread-count-badge')
    expect(badge).toHaveTextContent('1 unread')
  })

  it('shows Mark all read when unread > 0', async () => {
    render(withProvider(<ProviderNotificationsV2 />))
    expect(await screen.findByTestId('v2-mark-all-read-btn')).toBeInTheDocument()
  })

  it('renders empty state when notifications list is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ notifications: [] }), { status: 200 }))
    )
    render(withProvider(<ProviderNotificationsV2 />))
    expect(await screen.findByTestId('v2-empty-notifications')).toBeInTheDocument()
  })

  it('calls markOneRead when clicking an unread notification row', async () => {
    render(withProvider(<ProviderNotificationsV2 />))
    const row = await screen.findByTestId('v2-notification-row-n1')
    fireEvent.click(row)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/notifications/n1/read',
        expect.objectContaining({ method: 'PATCH' })
      )
    })
  })
})
