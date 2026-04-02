import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PatientMessages from './page'

const conversationResponse = {
  conversations: [
    {
      id: 'conv-1',
      user_id_1: '00000000-0000-4000-8000-000000000001',
      user_id_2: '00000000-0000-4000-8000-000000000002',
      other_user: {
        id: '00000000-0000-4000-8000-000000000002',
        role: 'provider',
        full_name: 'Dr. Meera Iyer',
        phone: '+919876543210',
        avatar_url: null,
        created_at: '2026-04-01T10:00:00.000Z',
      },
      last_message: null,
      unread_count: 0,
      last_message_at: '2026-04-01T10:00:00.000Z',
      created_at: '2026-04-01T09:00:00.000Z',
      updated_at: '2026-04-01T10:00:00.000Z',
    },
  ],
  total: 1,
}

describe('PatientMessages', () => {
  beforeEach(() => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes('/api/conversations?limit=50')) {
        return new Response(JSON.stringify(conversationResponse), { status: 200 })
      }

      if (url.includes('/api/conversations/')) {
        return new Response(JSON.stringify({ messages: [], total: 0 }), { status: 200 })
      }

      return new Response(JSON.stringify({}), { status: 200 })
    })

    vi.stubGlobal('fetch', fetchMock)
  })

  it('loads a thread using the other participant id instead of the conversation id', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <PatientMessages />
      </QueryClientProvider>
    )

    const name = await screen.findByText('Dr. Meera Iyer', {}, { timeout: 10000 })
    fireEvent.click(name.closest('button') as HTMLButtonElement)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/conversations/00000000-0000-4000-8000-000000000002/messages?limit=100')
    }, { timeout: 10000 })
  }, 15000)
})