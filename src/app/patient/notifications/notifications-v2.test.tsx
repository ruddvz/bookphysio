import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  notificationBadgeVariant,
  notificationTypeLabel,
  groupNotificationsByDay,
  formatRelativeTime,
  type NotificationItem,
} from './notifications-v2-utils'
import { PatientNotificationsV2 } from './PatientNotificationsV2'

// ── Hook mock ──────────────────────────────────────────────────────────────
const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

// ── Helpers ────────────────────────────────────────────────────────────────

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function withProvider(node: React.ReactNode, qc?: QueryClient) {
  const client = qc ?? makeQC()
  return <QueryClientProvider client={client}>{node}</QueryClientProvider>
}

const NOW = '2026-04-18T10:00:00.000Z' // IST 2026-04-18

// ── Pure utility tests ─────────────────────────────────────────────────────

describe('notificationBadgeVariant', () => {
  it('returns soft for read notifications regardless of type', () => {
    expect(notificationBadgeVariant('appointment_confirmed', true)).toBe('soft')
    expect(notificationBadgeVariant('appointment_cancelled', true)).toBe('soft')
    expect(notificationBadgeVariant('payment_success', true)).toBe('soft')
  })

  it('returns danger for unread appointment_cancelled', () => {
    expect(notificationBadgeVariant('appointment_cancelled', false)).toBe('danger')
  })

  it('returns success for unread appointment_confirmed and payment_success', () => {
    expect(notificationBadgeVariant('appointment_confirmed', false)).toBe('success')
    expect(notificationBadgeVariant('payment_success', false)).toBe('success')
  })

  it('returns warning for unread new_message', () => {
    expect(notificationBadgeVariant('new_message', false)).toBe('warning')
  })

  it('returns soft for unknown type', () => {
    expect(notificationBadgeVariant('unknown_type', false)).toBe('soft')
  })
})

describe('notificationTypeLabel', () => {
  it('maps each known type to a label', () => {
    expect(notificationTypeLabel('appointment_confirmed')).toBe('Confirmed')
    expect(notificationTypeLabel('appointment_cancelled')).toBe('Cancelled')
    expect(notificationTypeLabel('payment_success')).toBe('Payment')
    expect(notificationTypeLabel('new_message')).toBe('Message')
    expect(notificationTypeLabel('account_verified')).toBe('Verified')
  })

  it('returns "Update" for unknown types', () => {
    expect(notificationTypeLabel('something_else')).toBe('Update')
  })
})

describe('groupNotificationsByDay', () => {
  it('returns empty array for no notifications', () => {
    expect(groupNotificationsByDay([], NOW)).toEqual([])
  })

  it('groups today\'s notifications under "Today"', () => {
    const items: NotificationItem[] = [
      {
        id: 'n1',
        type: 'payment_success',
        title: 'Paid',
        body: 'Session confirmed',
        read: false,
        created_at: '2026-04-18T06:00:00Z',
      },
    ]
    const groups = groupNotificationsByDay(items, NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Today')
    expect(groups[0].items).toHaveLength(1)
  })

  it('groups yesterday\'s notifications under "Yesterday"', () => {
    const items: NotificationItem[] = [
      {
        id: 'n2',
        type: 'new_message',
        title: 'Msg',
        body: 'Check your messages',
        read: true,
        created_at: '2026-04-17T06:00:00Z',
      },
    ]
    const groups = groupNotificationsByDay(items, NOW)
    expect(groups[0].label).toBe('Yesterday')
  })

  it('sorts groups newest first', () => {
    const items: NotificationItem[] = [
      {
        id: 'n1',
        type: 'new_message',
        title: 'Old',
        body: '',
        read: true,
        created_at: '2026-04-16T06:00:00Z',
      },
      {
        id: 'n2',
        type: 'payment_success',
        title: 'Today',
        body: '',
        read: false,
        created_at: '2026-04-18T06:00:00Z',
      },
    ]
    const groups = groupNotificationsByDay(items, NOW)
    // Newest day first
    expect(groups[0].label).toBe('Today')
    // Older day has a non-Today/Yesterday label (e.g. formatted date)
    expect(groups[1].label).not.toBe('Today')
    expect(groups[1].label).not.toBe('Yesterday')
  })

  it('merges multiple items on the same IST day', () => {
    const items: NotificationItem[] = [
      { id: 'n1', type: 'payment_success', title: 'A', body: '', read: false, created_at: '2026-04-18T04:00:00Z' },
      { id: 'n2', type: 'new_message', title: 'B', body: '', read: true, created_at: '2026-04-18T08:00:00Z' },
    ]
    const groups = groupNotificationsByDay(items, NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].items).toHaveLength(2)
  })
})

describe('formatRelativeTime', () => {
  it('returns a relative time string', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const result = formatRelativeTime(twoMinutesAgo)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ── Component rendering tests ──────────────────────────────────────────────

const notificationsResponse = {
  notifications: [
    {
      id: 'n1',
      type: 'appointment_confirmed',
      title: 'Appointment confirmed',
      body: 'Your session with Dr. Priya is confirmed for tomorrow.',
      read: false,
      created_at: '2026-04-18T06:00:00Z',
    },
    {
      id: 'n2',
      type: 'new_message',
      title: 'New message',
      body: 'Dr. Priya sent you a message.',
      read: true,
      created_at: '2026-04-17T09:00:00Z',
    },
  ],
}

describe('PatientNotificationsV2 component', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/notifications') && !url.includes('/read')) {
          return new Response(JSON.stringify(notificationsResponse), { status: 200 })
        }
        return new Response(JSON.stringify({}), { status: 200 })
      })
    )
  })

  afterEach(() => {
    useUiV2Mock.mockReset()
  })

  it('returns null when v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(withProvider(<PatientNotificationsV2 />))
    expect(container.firstChild).toBeNull()
  })

  it('renders the v2 root with data-ui-version="v2"', async () => {
    render(withProvider(<PatientNotificationsV2 />))
    const root = await screen.findByTestId('v2-notifications-root')
    expect(root).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows the unread count Badge when there are unread notifications', async () => {
    render(withProvider(<PatientNotificationsV2 />))
    const badge = await screen.findByTestId('v2-unread-count-badge')
    expect(badge).toHaveTextContent('1 unread')
  })

  it('shows "Mark all read" button only when unread > 0', async () => {
    render(withProvider(<PatientNotificationsV2 />))
    await screen.findByTestId('v2-notifications-root')
    expect(await screen.findByTestId('v2-mark-all-read-btn')).toBeInTheDocument()
  })

  it('renders notification rows with type Badge chips', async () => {
    render(withProvider(<PatientNotificationsV2 />))
    const n1Badge = await screen.findByTestId('v2-notification-badge-n1')
    expect(n1Badge).toHaveTextContent('Confirmed')
    const n2Badge = await screen.findByTestId('v2-notification-badge-n2')
    expect(n2Badge).toHaveTextContent('Message')
  })

  it('shows unread dot only for unread notifications', async () => {
    render(withProvider(<PatientNotificationsV2 />))
    await screen.findByTestId('v2-notifications-root')
    expect(await screen.findByTestId('v2-unread-dot-n1')).toBeInTheDocument()
    expect(screen.queryByTestId('v2-unread-dot-n2')).toBeNull()
  })

  it('calls PATCH /api/notifications on "Mark all read"', async () => {
    render(withProvider(<PatientNotificationsV2 />))
    const btn = await screen.findByTestId('v2-mark-all-read-btn')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notifications', { method: 'PATCH' })
    })
  })

  it('shows empty state when there are no notifications', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ notifications: [] }), { status: 200 })
      )
    )
    render(withProvider(<PatientNotificationsV2 />))
    expect(await screen.findByTestId('v2-empty-notifications')).toBeInTheDocument()
  })
})
