import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProviderMessagesV2 } from './ProviderMessagesV2'

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

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

const conversationResponse = {
  conversations: [
    {
      id: 'conv-1',
      other_user: {
        id: 'uid-2',
        role: 'patient',
        full_name: 'Ravi Kumar',
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

describe('ProviderMessagesV2', () => {
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
    vi.unstubAllGlobals()
  })

  it('returns null when v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(withProvider(<ProviderMessagesV2 />))
    expect(container.firstChild).toBeNull()
  })

  it('renders v2-messages-root when flag is on', async () => {
    render(withProvider(<ProviderMessagesV2 />))
    const root = await screen.findByTestId('v2-messages-root')
    expect(root).toHaveAttribute('data-ui-version', 'v2')
  })

  it('renders conversation sidebar', async () => {
    render(withProvider(<ProviderMessagesV2 />))
    expect(await screen.findByTestId('v2-conversation-sidebar')).toBeInTheDocument()
  })

  it('shows empty inbox when there are no conversations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/conversations?limit=50')) {
          return new Response(JSON.stringify({ conversations: [], total: 0 }), { status: 200 })
        }
        return new Response(JSON.stringify({}), { status: 200 })
      })
    )
    render(withProvider(<ProviderMessagesV2 />))
    expect(await screen.findByTestId('v2-empty-inbox')).toBeInTheDocument()
  })

  it('renders unread badge for conversation with unread_count > 0', async () => {
    render(withProvider(<ProviderMessagesV2 />))
    await screen.findByText('Ravi Kumar')
    const badge = await screen.findByTestId('v2-unread-badge-conv-1')
    expect(badge).toHaveTextContent('3')
  })

  it('shows send button when a conversation is selected', async () => {
    render(withProvider(<ProviderMessagesV2 />))
    const name = await screen.findByText('Ravi Kumar')
    fireEvent.click(name.closest('button')!)
    expect(await screen.findByTestId('v2-send-btn')).toBeInTheDocument()
  })
})
