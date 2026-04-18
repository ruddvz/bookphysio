import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  nameInitials,
  unreadBadgeVariant,
  lastMessagePreview,
  groupMessagesByDay,
  conversationSortKey,
} from './messages-v2-utils'
import type { MessageItem, ConversationItem } from './messages-v2-utils'
import { PatientMessagesV2 } from './PatientMessagesV2'

// ── jsdom shim ─────────────────────────────────────────────────────────────
// jsdom does not implement scrollIntoView — shim it to avoid uncaught errors
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

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

// ── Pure utility tests ─────────────────────────────────────────────────────

describe('nameInitials', () => {
  it('returns ? for empty/null', () => {
    expect(nameInitials(null)).toBe('?')
    expect(nameInitials(undefined)).toBe('?')
    expect(nameInitials('')).toBe('?')
  })

  it('returns single initial for single word', () => {
    expect(nameInitials('Priya')).toBe('P')
  })

  it('returns first + last initial for multi-word name', () => {
    expect(nameInitials('Dr. Meera Iyer')).toBe('DI')
  })
})

describe('unreadBadgeVariant', () => {
  it('returns soft for zero unread', () => {
    expect(unreadBadgeVariant(0)).toBe('soft')
  })

  it('returns success for 1-4 unread', () => {
    expect(unreadBadgeVariant(1)).toBe('success')
    expect(unreadBadgeVariant(4)).toBe('success')
  })

  it('returns warning for 5+ unread', () => {
    expect(unreadBadgeVariant(5)).toBe('warning')
    expect(unreadBadgeVariant(99)).toBe('warning')
  })
})

describe('lastMessagePreview', () => {
  it('returns "No messages yet" for empty', () => {
    expect(lastMessagePreview(null)).toBe('No messages yet')
    expect(lastMessagePreview(undefined)).toBe('No messages yet')
  })

  it('returns full content when ≤ 60 chars', () => {
    expect(lastMessagePreview('Hello!')).toBe('Hello!')
  })

  it('truncates long content with ellipsis', () => {
    const long = 'A'.repeat(70)
    const result = lastMessagePreview(long)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBeLessThan(70)
  })
})

describe('groupMessagesByDay', () => {
  const NOW = '2026-04-18T10:00:00.000Z' // IST: 2026-04-18 15:30

  it('returns empty array for no messages', () => {
    expect(groupMessagesByDay([], NOW)).toEqual([])
  })

  it('labels messages from today as "Today"', () => {
    const msgs: MessageItem[] = [
      {
        id: 'm1',
        sender_id: 'u1',
        receiver_id: 'u2',
        content: 'Hi',
        created_at: '2026-04-18T06:00:00.000Z', // IST: 11:30
      },
    ]
    const groups = groupMessagesByDay(msgs, NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Today')
    expect(groups[0].messages).toHaveLength(1)
  })

  it('labels messages from yesterday as "Yesterday"', () => {
    const msgs: MessageItem[] = [
      {
        id: 'm2',
        sender_id: 'u1',
        receiver_id: 'u2',
        content: 'Yesterday msg',
        created_at: '2026-04-17T06:00:00.000Z', // IST: previous day
      },
    ]
    const groups = groupMessagesByDay(msgs, NOW)
    expect(groups[0].label).toBe('Yesterday')
  })

  it('groups multiple messages on the same IST day together', () => {
    const msgs: MessageItem[] = [
      { id: 'm1', sender_id: 'u1', receiver_id: 'u2', content: 'A', created_at: '2026-04-18T06:00:00.000Z' },
      { id: 'm2', sender_id: 'u2', receiver_id: 'u1', content: 'B', created_at: '2026-04-18T08:00:00.000Z' },
    ]
    const groups = groupMessagesByDay(msgs, NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].messages).toHaveLength(2)
  })
})

describe('conversationSortKey', () => {
  it('returns a negative number for recent conversations', () => {
    const c: ConversationItem = {
      id: 'c1',
      last_message_at: '2026-04-18T10:00:00Z',
      created_at: '2026-04-01T10:00:00Z',
      unread_count: 0,
    }
    expect(conversationSortKey(c)).toBeLessThan(0)
  })

  it('falls back to created_at when last_message_at is absent', () => {
    const c: ConversationItem = {
      id: 'c1',
      created_at: '2026-04-01T10:00:00Z',
      unread_count: 0,
    }
    expect(conversationSortKey(c)).toBeLessThan(0)
  })
})

// ── Component rendering tests ──────────────────────────────────────────────

const conversationResponse = {
  conversations: [
    {
      id: 'conv-1',
      other_user: {
        id: 'uid-2',
        role: 'provider',
        full_name: 'Dr. Meera Iyer',
        phone: '+919876543210',
        avatar_url: null,
        created_at: '2026-04-01T10:00:00Z',
      },
      last_message: null,
      unread_count: 3,
      last_message_at: '2026-04-18T10:00:00Z',
      created_at: '2026-04-01T09:00:00Z',
      updated_at: '2026-04-18T10:00:00Z',
    },
  ],
  total: 1,
}

describe('PatientMessagesV2 component', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/conversations?limit=50')) {
          return new Response(JSON.stringify(conversationResponse), { status: 200 })
        }
        if (url.includes('/api/conversations/')) {
          return new Response(JSON.stringify({ messages: [], total: 0 }), { status: 200 })
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
    const { container } = render(withProvider(<PatientMessagesV2 />))
    expect(container.firstChild).toBeNull()
  })

  it('renders the v2 messages root when v2 flag is on', async () => {
    render(withProvider(<PatientMessagesV2 />))
    const root = await screen.findByTestId('v2-messages-root')
    expect(root).toBeInTheDocument()
    expect(root).toHaveAttribute('data-ui-version', 'v2')
  })

  it('renders conversation rows with unread Badge', async () => {
    render(withProvider(<PatientMessagesV2 />))
    await screen.findByText('Dr. Meera Iyer')
    const badge = await screen.findByTestId('v2-unread-badge-conv-1')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('3')
  })

  it('renders the total unread header Badge', async () => {
    render(withProvider(<PatientMessagesV2 />))
    const badge = await screen.findByTestId('v2-total-unread-badge')
    expect(badge).toHaveTextContent('3 unread')
  })

  it('shows the empty thread state before selecting a conversation', async () => {
    render(withProvider(<PatientMessagesV2 />))
    await screen.findByTestId('v2-messages-root')
    expect(screen.getByTestId('v2-empty-thread')).toBeInTheDocument()
  })

  it('loads the thread and shows Available Badge when a conversation is selected', async () => {
    render(withProvider(<PatientMessagesV2 />))
    const name = await screen.findByText('Dr. Meera Iyer')
    fireEvent.click(name.closest('button')!)
    const onlineBadge = await screen.findByTestId('v2-online-badge')
    expect(onlineBadge).toHaveTextContent('Available')
  })

  it('renders day-grouped empty "No messages yet" message in the thread body', async () => {
    render(withProvider(<PatientMessagesV2 />))
    const name = await screen.findByText('Dr. Meera Iyer')
    fireEvent.click(name.closest('button')!)
    await waitFor(() => {
      expect(screen.getByTestId('v2-messages-body')).toBeInTheDocument()
      expect(screen.getByText('No messages yet. Say hello!')).toBeInTheDocument()
    })
  })
})
