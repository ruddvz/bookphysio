import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoConversations } from '@/lib/demo/store'
import { getDemoSessionFromCookies } from '@/lib/demo/session'
import { getConversationsSchema } from '@/lib/validations/message'
import type { Conversation } from '@/app/api/contracts/message'
import type { UserProfile } from '@/app/api/contracts/user'
import type { Message } from '@/app/api/contracts/message'

type MessagingRole = 'patient' | 'provider'
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

type ConversationRow = {
  id: string
  user_id_1: string
  user_id_2: string
  last_message_at: string | null
  created_at: string
  updated_at: string
}

type ConversationUserRow = {
  id: string
  role: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

type AppointmentRelationshipRow = {
  patient_id?: string | null
  provider_id?: string | null
}

type MessageRow = Message & {
  conversation_id: string
}

function isMessagingRole(role: string | null | undefined): role is MessagingRole {
  return role === 'patient' || role === 'provider'
}

function getOtherParticipantId(conversation: ConversationRow, currentUserId: string): string {
  return conversation.user_id_1 === currentUserId ? conversation.user_id_2 : conversation.user_id_1
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)]
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const parsed = getConversationsSchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { limit, offset } = parsed.data
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession) {
    if (demoSession.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot access patient-provider messaging.' }, { status: 403 })
    }

    const conversations = getDemoConversations(demoSession.sessionId, demoSession.userId)
    return NextResponse.json(
      {
        conversations: conversations.slice(offset, offset + limit),
        total: conversations.length,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    )
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    return NextResponse.json({ error: 'Admin accounts cannot access patient-provider messaging.' }, { status: 403 })
  }

  if (profile?.role !== 'patient' && profile?.role !== 'provider') {
    return NextResponse.json({ error: 'Only patient and provider accounts can access messaging.' }, { status: 403 })
  }

  const currentRole = profile.role as MessagingRole

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Get conversations where user is participant
  const { data: conversations, error: convError } = await supabaseAdmin
    .from('conversations')
    .select(
      `
      id,
      user_id_1,
      user_id_2,
      last_message_at,
      created_at,
      updated_at
      `
    )
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (convError) {
    console.error('[api/conversations] GET error:', convError)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  const allConversations = (conversations ?? []) as ConversationRow[]

  if (allConversations.length === 0) {
    return NextResponse.json({ conversations: [], total: 0 }, { status: 200, headers: NO_STORE_HEADERS })
  }

  const relationshipLookupField = currentRole === 'patient' ? 'provider_id' : 'patient_id'
  const relationshipFilterField = currentRole === 'patient' ? 'patient_id' : 'provider_id'
  const { data: relationshipRows, error: relationshipError } = await supabaseAdmin
    .from('appointments')
    .select(relationshipLookupField)
    .eq(relationshipFilterField, user.id)

  if (relationshipError) {
    console.error('[api/conversations] Relationship lookup failed:', relationshipError)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  const allowedParticipantIds = new Set(
    ((relationshipRows ?? []) as AppointmentRelationshipRow[])
      .map((row) => currentRole === 'patient' ? row.provider_id : row.patient_id)
      .filter((participantId): participantId is string => Boolean(participantId)),
  )

  if (allowedParticipantIds.size === 0) {
    return NextResponse.json({ conversations: [], total: 0 }, { status: 200, headers: NO_STORE_HEADERS })
  }

  const allowedConversations = allConversations.filter((conversation) => (
    allowedParticipantIds.has(getOtherParticipantId(conversation, user.id))
  ))

  if (allowedConversations.length === 0) {
    return NextResponse.json({ conversations: [], total: 0 }, { status: 200, headers: NO_STORE_HEADERS })
  }

  const otherParticipantIds = uniqueValues(
    allowedConversations.map((conversation) => getOtherParticipantId(conversation, user.id)),
  )

  const { data: otherUsers, error: otherUsersError } = await supabaseAdmin
    .from('users')
    .select('id, role, full_name, avatar_url, created_at')
    .in('id', otherParticipantIds)

  if (otherUsersError) {
    console.error('[api/conversations] Other user lookup failed:', otherUsersError)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  const otherUserById = new Map(
    ((otherUsers ?? []) as ConversationUserRow[]).map((otherUser) => [otherUser.id, otherUser]),
  )

  const visibleConversations = allowedConversations.filter((conversation) => {
    const otherUser = otherUserById.get(getOtherParticipantId(conversation, user.id))
    return Boolean(otherUser && isMessagingRole(otherUser.role) && otherUser.role !== currentRole)
  })

  const total = visibleConversations.length
  const pagedConversations = visibleConversations.slice(offset, offset + limit)

  if (pagedConversations.length === 0) {
    return NextResponse.json({ conversations: [], total }, { status: 200, headers: NO_STORE_HEADERS })
  }

  const conversationIds = pagedConversations.map((conversation) => conversation.id)
  const { data: lastMessages, error: lastMessagesError } = await supabaseAdmin
    .from('messages')
    .select('id, conversation_id, sender_id, receiver_id, content, read_at, created_at, updated_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })

  if (lastMessagesError) {
    console.error('[api/conversations] Last message lookup failed:', lastMessagesError)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  const lastMessageByConversation = new Map<string, Message>()
  for (const lastMessage of (lastMessages ?? []) as MessageRow[]) {
    if (!lastMessageByConversation.has(lastMessage.conversation_id)) {
      lastMessageByConversation.set(lastMessage.conversation_id, lastMessage)
    }
  }

  const { data: unreadMessages, error: unreadMessagesError } = await supabaseAdmin
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .eq('receiver_id', user.id)
    .is('read_at', null)

  if (unreadMessagesError) {
    console.error('[api/conversations] Unread message lookup failed:', unreadMessagesError)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  const unreadCountByConversation = new Map<string, number>()
  for (const unreadMessage of (unreadMessages ?? []) as Array<{ conversation_id: string }>) {
    unreadCountByConversation.set(
      unreadMessage.conversation_id,
      (unreadCountByConversation.get(unreadMessage.conversation_id) ?? 0) + 1,
    )
  }

  const enrichedConversations: Conversation[] = pagedConversations.map((conversation) => {
    const otherUserId = getOtherParticipantId(conversation, user.id)
    const otherUser = otherUserById.get(otherUserId)

    return {
      id: conversation.id,
      user_id_1: conversation.user_id_1,
      user_id_2: conversation.user_id_2,
      other_user: {
        id: otherUser?.id ?? otherUserId,
        role: currentRole === 'patient' ? 'provider' : 'patient',
        full_name: otherUser?.full_name ?? null,
        phone: null,
        avatar_url: otherUser?.avatar_url ?? null,
        created_at: otherUser?.created_at ?? conversation.created_at,
      } as UserProfile,
      last_message: lastMessageByConversation.get(conversation.id) ?? null,
      unread_count: unreadCountByConversation.get(conversation.id) ?? 0,
      last_message_at: conversation.last_message_at,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
    }
  })

  return NextResponse.json(
    { conversations: enrichedConversations, total },
    { status: 200, headers: NO_STORE_HEADERS }
  )
}
