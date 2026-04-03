import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const PATIENT_ID = '00000000-0000-4000-8000-000000000001'
const PROVIDER_ID = '00000000-0000-4000-8000-000000000002'

const createClientMock = vi.fn()
const adminFromMock = vi.fn()
const hasMessagingCareRelationshipMock = vi.fn()
const getDemoSessionFromCookiesMock = vi.fn()
const getDemoProfileByIdMock = vi.fn()
const sendDemoMessageMock = vi.fn()
const getDemoConversationsMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => adminFromMock(...args),
  },
}))

vi.mock('@/lib/messaging/access', () => ({
  hasMessagingCareRelationship: (...args: unknown[]) => hasMessagingCareRelationshipMock(...args),
}))

vi.mock('@/lib/demo/session', () => ({
  getDemoSessionFromCookies: (...args: unknown[]) => getDemoSessionFromCookiesMock(...args),
  getDemoProfileById: (...args: unknown[]) => getDemoProfileByIdMock(...args),
}))

vi.mock('@/lib/demo/store', () => ({
  sendDemoMessage: (...args: unknown[]) => sendDemoMessageMock(...args),
  getDemoConversations: (...args: unknown[]) => getDemoConversationsMock(...args),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
}))

function createUserRoleChain(role: 'patient' | 'provider' | 'admin') {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue({ data: { role }, error: null }),
  }

  return chain
}

describe('Messages API', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getDemoSessionFromCookiesMock.mockResolvedValue(null)
    getDemoProfileByIdMock.mockReturnValue(null)
    getDemoConversationsMock.mockReturnValue([])
    sendDemoMessageMock.mockReturnValue({ id: 'demo-msg' })
    hasMessagingCareRelationshipMock.mockResolvedValue(true)

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: PATIENT_ID,
              email: 'patient@example.com',
            },
          },
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return createUserRoleChain('patient')
        }

        throw new Error(`Unhandled table: ${table}`)
      }),
    })
  })

  it('POST /api/messages sends a message and creates a conversation if needed', async () => {
    const conversationCreateSelectChain = {
      select: vi.fn(() => conversationCreateSelectChain),
      single: vi.fn().mockResolvedValue({ data: { id: 'conv-1' }, error: null }),
    }
    const conversationUpdateChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    }
    const messageInsertChain = {
      select: vi.fn(() => messageInsertChain),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'msg-1',
          conversation_id: 'conv-1',
          sender_id: PATIENT_ID,
          receiver_id: PROVIDER_ID,
          content: 'Hello from test',
          read_at: null,
          created_at: '2026-04-01T10:00:00.000Z',
          updated_at: '2026-04-01T10:00:00.000Z',
        },
        error: null,
      }),
    }
    let conversationCall = 0

    adminFromMock.mockImplementation((table: string) => {
      if (table === 'users') {
        const receiverUserChain = {
          select: vi.fn(() => receiverUserChain),
          eq: vi.fn(() => receiverUserChain),
          single: vi.fn().mockResolvedValue({
            data: { id: PROVIDER_ID, role: 'provider', full_name: 'Provider Two' },
            error: null,
          }),
        }

        return receiverUserChain
      }

      if (table === 'conversations') {
        conversationCall += 1

        if (conversationCall === 1) {
          const conversationLookupChain = {
            select: vi.fn(() => conversationLookupChain),
            or: vi.fn(() => conversationLookupChain),
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }

          return conversationLookupChain
        }

        if (conversationCall === 2) {
          const conversationCreateChain = {
            insert: vi.fn(() => conversationCreateSelectChain),
          }

          return conversationCreateChain
        }

        const conversationUpdateTable = {
          update: vi.fn(() => conversationUpdateChain),
        }

        return conversationUpdateTable
      }

      if (table === 'messages') {
        return {
          insert: vi.fn(() => messageInsertChain),
        }
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })

    const { POST } = await import('../messages/route')
    const req = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver_id: PROVIDER_ID,
        content: 'Hello from test',
      }),
    })

    const res = await POST(req)

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({
      message: {
        conversation_id: 'conv-1',
        content: 'Hello from test',
      },
    })
    expect(hasMessagingCareRelationshipMock).toHaveBeenCalledWith(
      expect.any(Object),
      PATIENT_ID,
      'patient',
      PROVIDER_ID,
      'provider',
    )
  })

  it('GET /api/conversations returns user conversations', async () => {
    const conversationList = [
      {
        id: 'conv-1',
        user_id_1: PATIENT_ID,
        user_id_2: PROVIDER_ID,
        last_message_at: '2026-04-01T10:00:00.000Z',
        created_at: '2026-04-01T09:00:00.000Z',
        updated_at: '2026-04-01T10:00:00.000Z',
      },
    ]
    let messageCall = 0

    adminFromMock.mockImplementation((table: string) => {
      if (table === 'conversations') {
        const conversationListChain = {
          select: vi.fn(() => conversationListChain),
          or: vi.fn(() => conversationListChain),
          order: vi.fn().mockResolvedValue({ data: conversationList, error: null }),
        }

        return conversationListChain
      }

      if (table === 'appointments') {
        const relationshipChain = {
          select: vi.fn(() => relationshipChain),
          eq: vi.fn().mockResolvedValue({
            data: [{ provider_id: PROVIDER_ID }],
            error: null,
          }),
        }

        return relationshipChain
      }

      if (table === 'users') {
        const otherUsersChain = {
          select: vi.fn(() => otherUsersChain),
          in: vi.fn().mockResolvedValue({
            data: [{
              id: PROVIDER_ID,
              role: 'provider',
              full_name: 'Provider Two',
              avatar_url: null,
              created_at: '2026-04-01T08:00:00.000Z',
            }],
            error: null,
          }),
        }

        return otherUsersChain
      }

      if (table === 'messages') {
        messageCall += 1

        if (messageCall === 1) {
          const lastMessagesChain = {
            select: vi.fn(() => lastMessagesChain),
            in: vi.fn(() => lastMessagesChain),
            order: vi.fn().mockResolvedValue({
              data: [{
                id: 'msg-1',
                conversation_id: 'conv-1',
                sender_id: PROVIDER_ID,
                receiver_id: PATIENT_ID,
                content: 'Hello from provider',
                read_at: null,
                created_at: '2026-04-01T10:00:00.000Z',
                updated_at: '2026-04-01T10:00:00.000Z',
              }],
              error: null,
            }),
          }

          return lastMessagesChain
        }

        const unreadMessagesChain = {
          select: vi.fn(() => unreadMessagesChain),
          in: vi.fn(() => unreadMessagesChain),
          eq: vi.fn(() => unreadMessagesChain),
          is: vi.fn().mockResolvedValue({ data: [{ conversation_id: 'conv-1' }], error: null }),
        }

        return unreadMessagesChain
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })

    const { GET } = await import('../conversations/route')
    const req = new NextRequest('http://localhost/api/conversations?limit=20')
    const res = await GET(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      conversations: [
        {
          id: 'conv-1',
          other_user: {
            id: PROVIDER_ID,
            full_name: 'Provider Two',
            phone: null,
          },
          unread_count: 1,
        },
      ],
      total: 1,
    })
  })

  it('GET /api/conversations paginates after relationship filtering', async () => {
    const unrelatedProviderId = '00000000-0000-4000-8000-000000000099'
    const conversationList = [
      {
        id: 'conv-stale',
        user_id_1: PATIENT_ID,
        user_id_2: unrelatedProviderId,
        last_message_at: '2026-04-02T10:00:00.000Z',
        created_at: '2026-04-02T09:00:00.000Z',
        updated_at: '2026-04-02T10:00:00.000Z',
      },
      {
        id: 'conv-1',
        user_id_1: PATIENT_ID,
        user_id_2: PROVIDER_ID,
        last_message_at: '2026-04-01T10:00:00.000Z',
        created_at: '2026-04-01T09:00:00.000Z',
        updated_at: '2026-04-01T10:00:00.000Z',
      },
    ]
    let messageCall = 0

    adminFromMock.mockImplementation((table: string) => {
      if (table === 'conversations') {
        const conversationListChain = {
          select: vi.fn(() => conversationListChain),
          or: vi.fn(() => conversationListChain),
          order: vi.fn().mockResolvedValue({ data: conversationList, error: null }),
        }

        return conversationListChain
      }

      if (table === 'appointments') {
        const relationshipChain = {
          select: vi.fn(() => relationshipChain),
          eq: vi.fn().mockResolvedValue({
            data: [{ provider_id: PROVIDER_ID }],
            error: null,
          }),
        }

        return relationshipChain
      }

      if (table === 'users') {
        const otherUsersChain = {
          select: vi.fn(() => otherUsersChain),
          in: vi.fn().mockResolvedValue({
            data: [{
              id: PROVIDER_ID,
              role: 'provider',
              full_name: 'Provider Two',
              avatar_url: null,
              created_at: '2026-04-01T08:00:00.000Z',
            }],
            error: null,
          }),
        }

        return otherUsersChain
      }

      if (table === 'messages') {
        messageCall += 1

        if (messageCall === 1) {
          const lastMessagesChain = {
            select: vi.fn(() => lastMessagesChain),
            in: vi.fn(() => lastMessagesChain),
            order: vi.fn().mockResolvedValue({
              data: [{
                id: 'msg-1',
                conversation_id: 'conv-1',
                sender_id: PROVIDER_ID,
                receiver_id: PATIENT_ID,
                content: 'Hello from provider',
                read_at: null,
                created_at: '2026-04-01T10:00:00.000Z',
                updated_at: '2026-04-01T10:00:00.000Z',
              }],
              error: null,
            }),
          }

          return lastMessagesChain
        }

        const unreadMessagesChain = {
          select: vi.fn(() => unreadMessagesChain),
          in: vi.fn(() => unreadMessagesChain),
          eq: vi.fn(() => unreadMessagesChain),
          is: vi.fn().mockResolvedValue({ data: [], error: null }),
        }

        return unreadMessagesChain
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })

    const { GET } = await import('../conversations/route')
    const req = new NextRequest('http://localhost/api/conversations?limit=1&offset=0')
    const res = await GET(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      conversations: [
        {
          id: 'conv-1',
        },
      ],
      total: 1,
    })
  })

  it('returns 401 when user is not authenticated', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    })
    getDemoSessionFromCookiesMock.mockResolvedValue(null)

    const { POST } = await import('../messages/route')
    const req = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver_id: PROVIDER_ID,
        content: 'Hello from test',
      }),
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns 400 with validation error for invalid payload', async () => {
    const { POST } = await import('../messages/route')
    const req = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver_id: 'invalid-uuid',
        content: '',
      }),
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('rejects whitespace-only messages', async () => {
    const { POST } = await import('../messages/route')
    const req = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver_id: PROVIDER_ID,
        content: '   ',
      }),
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('blocks messages when the users do not share an appointment relationship', async () => {
    hasMessagingCareRelationshipMock.mockResolvedValue(false)

    adminFromMock.mockImplementation((table: string) => {
      if (table === 'users') {
        const receiverUserChain = {
          select: vi.fn(() => receiverUserChain),
          eq: vi.fn(() => receiverUserChain),
          single: vi.fn().mockResolvedValue({
            data: { id: PROVIDER_ID, role: 'provider', full_name: 'Provider Two' },
            error: null,
          }),
        }

        return receiverUserChain
      }

      throw new Error(`Unhandled admin table: ${table}`)
    })

    const { POST } = await import('../messages/route')
    const req = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver_id: PROVIDER_ID,
        content: 'Hello from test',
      }),
    })

    const res = await POST(req)

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({
      error: 'Messaging is only available for connected patient-provider pairs.',
    })
  })
})
