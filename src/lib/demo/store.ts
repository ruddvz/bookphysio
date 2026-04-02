import type { Conversation, Message } from '@/app/api/contracts/message'
import type { UserProfile } from '@/app/api/contracts/user'
import type { DemoRole } from '@/lib/demo/session'
import { getDemoProfileById } from '@/lib/demo/session'

interface DemoConversationRow {
  id: string
  user_id_1: string
  user_id_2: string
  created_at: string
  updated_at: string
  last_message_at: string | null
}

function isoFromNow(hoursOffset: number): string {
  return new Date(Date.now() + hoursOffset * 60 * 60 * 1000).toISOString()
}

function makeConversationId(suffix: string): string {
  return `11111111-1111-4111-8111-${suffix}`
}

function makeMessageId(seed: number): string {
  const tail = seed.toString(16).padStart(12, '0').slice(-12)
  return `22222222-2222-4222-8222-${tail}`
}

const PRIMARY_CONVERSATION_ID = makeConversationId('000000000001')

const INITIAL_CONVERSATIONS: DemoConversationRow[] = [
  {
    id: PRIMARY_CONVERSATION_ID,
    user_id_1: '00000000-0000-4000-8000-000000000001',
    user_id_2: '00000000-0000-4000-8000-000000000002',
    created_at: isoFromNow(-48),
    updated_at: isoFromNow(-0.33),
    last_message_at: isoFromNow(-0.33),
  },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: makeMessageId(1),
    conversation_id: PRIMARY_CONVERSATION_ID,
    sender_id: '00000000-0000-4000-8000-000000000002',
    receiver_id: '00000000-0000-4000-8000-000000000001',
    content: 'Hi Aarav, remember your ankle mobility drills tonight.',
    read_at: null,
    created_at: isoFromNow(-2),
    updated_at: isoFromNow(-2),
  },
  {
    id: makeMessageId(2),
    conversation_id: PRIMARY_CONVERSATION_ID,
    sender_id: '00000000-0000-4000-8000-000000000001',
    receiver_id: '00000000-0000-4000-8000-000000000002',
    content: 'Done. Swelling is down and walking feels better today.',
    read_at: isoFromNow(-1.25),
    created_at: isoFromNow(-1.5),
    updated_at: isoFromNow(-1.5),
  },
  {
    id: makeMessageId(3),
    conversation_id: PRIMARY_CONVERSATION_ID,
    sender_id: '00000000-0000-4000-8000-000000000002',
    receiver_id: '00000000-0000-4000-8000-000000000001',
    content: 'Great. Keep the compression sleeve on after your evening walk.',
    read_at: null,
    created_at: isoFromNow(-0.33),
    updated_at: isoFromNow(-0.33),
  },
]

interface DemoSessionState {
  conversations: DemoConversationRow[]
  messages: Message[]
}

const demoSessionStore = new Map<string, DemoSessionState>()

function createInitialState(): DemoSessionState {
  return {
    conversations: INITIAL_CONVERSATIONS.map((conversation) => ({ ...conversation })),
    messages: INITIAL_MESSAGES.map((message) => ({ ...message })),
  }
}

function getSessionState(sessionId: string): DemoSessionState {
  const existingState = demoSessionStore.get(sessionId)

  if (existingState) {
    return existingState
  }

  const nextState = createInitialState()
  demoSessionStore.set(sessionId, nextState)
  return nextState
}

function getConversationRow(sessionId: string, userA: string, userB: string): DemoConversationRow | undefined {
  const state = getSessionState(sessionId)

  return state.conversations.find(
    (conversation) =>
      (conversation.user_id_1 === userA && conversation.user_id_2 === userB) ||
      (conversation.user_id_1 === userB && conversation.user_id_2 === userA)
  )
}

function toUserProfile(userId: string): UserProfile | null {
  const profile = getDemoProfileById(userId)

  if (!profile) {
    return null
  }

  return {
    id: profile.id,
    role: profile.role,
    full_name: profile.fullName,
    phone: profile.phone,
    avatar_url: profile.avatarUrl,
    created_at: profile.createdAt,
  }
}

export function getDemoAppointments(role: DemoRole) {
  if (role === 'provider') {
    return [
      {
        id: 'demo-provider-appt-1',
        status: 'confirmed',
        visit_type: 'in_clinic',
        fee_inr: 1200,
        availabilities: {
          starts_at: isoFromNow(2),
          ends_at: isoFromNow(2.75),
        },
        patient: { full_name: 'Aarav Kapoor' },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'demo-provider-appt-2',
        status: 'confirmed',
        visit_type: 'home_visit',
        fee_inr: 1500,
        availabilities: {
          starts_at: isoFromNow(5),
          ends_at: isoFromNow(5.75),
        },
        patient: { full_name: 'Nisha Rao' },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'demo-provider-appt-3',
        status: 'completed',
        visit_type: 'in_clinic',
        fee_inr: 1000,
        availabilities: {
          starts_at: isoFromNow(-72),
          ends_at: isoFromNow(-71.25),
        },
        patient: { full_name: 'Rahul Sharma' },
        locations: { city: 'Mumbai' },
      },
    ]
  }

  if (role === 'patient') {
    return [
      {
        id: 'demo-patient-appt-1',
        status: 'confirmed',
        visit_type: 'in_clinic',
        fee_inr: 1200,
        availabilities: { starts_at: isoFromNow(2) },
        providers: {
          users: { full_name: 'Dr. Meera Iyer' },
          specialties: [{ name: 'Sports Physiotherapy' }],
        },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'demo-patient-appt-2',
        status: 'pending',
        visit_type: 'home_visit',
        fee_inr: 1500,
        availabilities: { starts_at: isoFromNow(26) },
        providers: {
          users: { full_name: 'Dr. Meera Iyer' },
          specialties: [{ name: 'Mobility Rehabilitation' }],
        },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'demo-patient-appt-3',
        status: 'completed',
        visit_type: 'in_clinic',
        fee_inr: 1000,
        availabilities: { starts_at: isoFromNow(-72) },
        providers: {
          users: { full_name: 'Dr. Meera Iyer' },
          specialties: [{ name: 'Sports Physiotherapy' }],
        },
        locations: { city: 'Mumbai' },
      },
    ]
  }

  return []
}

export function getDemoConversations(sessionId: string, userId: string): Conversation[] {
  const state = getSessionState(sessionId)

  return state.conversations
    .filter((conversation) => conversation.user_id_1 === userId || conversation.user_id_2 === userId)
    .map((conversation) => {
      const otherUserId = conversation.user_id_1 === userId ? conversation.user_id_2 : conversation.user_id_1
      const otherUser = toUserProfile(otherUserId)
      const conversationMessages = state.messages
        .filter((message) => message.conversation_id === conversation.id)
        .sort((left, right) => left.created_at.localeCompare(right.created_at))

      return {
        id: conversation.id,
        user_id_1: conversation.user_id_1,
        user_id_2: conversation.user_id_2,
        other_user: otherUser as UserProfile,
        last_message: conversationMessages.at(-1) ?? null,
        unread_count: conversationMessages.filter(
          (message) => message.receiver_id === userId && !message.read_at
        ).length,
        last_message_at: conversation.last_message_at,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      }
    })
    .sort((left, right) => {
      const leftDate = left.last_message_at ?? left.created_at
      const rightDate = right.last_message_at ?? right.created_at
      return rightDate.localeCompare(leftDate)
    })
}

export function getDemoMessages(sessionId: string, currentUserId: string, otherUserId: string, limit: number, offset: number) {
  const state = getSessionState(sessionId)
  const conversation = getConversationRow(sessionId, currentUserId, otherUserId)

  if (!conversation) {
    return {
      messages: [] as Message[],
      total: 0,
    }
  }

  const messages = state.messages
    .filter((message) => message.conversation_id === conversation.id)
    .sort((left, right) => left.created_at.localeCompare(right.created_at))

  return {
    messages: messages.slice(offset, offset + limit),
    total: messages.length,
  }
}

export function markDemoConversationRead(sessionId: string, currentUserId: string, otherUserId: string) {
  const now = new Date().toISOString()
  const state = getSessionState(sessionId)

  state.messages = state.messages.map((message) => {
    if (message.sender_id !== otherUserId || message.receiver_id !== currentUserId || message.read_at) {
      return message
    }

    return {
      ...message,
      read_at: now,
      updated_at: now,
    }
  })
}

export function sendDemoMessage(sessionId: string, senderId: string, receiverId: string, content: string): Message {
  const now = new Date().toISOString()
  const state = getSessionState(sessionId)
  const existingConversation = getConversationRow(sessionId, senderId, receiverId)
  const conversationId = existingConversation?.id ?? makeConversationId(Date.now().toString().slice(-12).padStart(12, '0'))

  if (!existingConversation) {
    const nextConversation: DemoConversationRow = {
      id: conversationId,
      user_id_1: senderId,
      user_id_2: receiverId,
      created_at: now,
      updated_at: now,
      last_message_at: now,
    }

    state.conversations = [...state.conversations, nextConversation]
  } else {
    state.conversations = state.conversations.map((conversation) =>
      conversation.id === existingConversation.id
        ? {
            ...conversation,
            updated_at: now,
            last_message_at: now,
          }
        : conversation
    )
  }

  const nextMessage: Message = {
    id: makeMessageId(Date.now()),
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    read_at: null,
    created_at: now,
    updated_at: now,
  }

  state.messages = [...state.messages, nextMessage]
  return nextMessage
}

export function getDemoAdminStats() {
  return {
    activeProviders: 128,
    pendingApprovals: 12,
    totalPatients: 1840,
    gmvMtd: 1240000,
  }
}

export function getDemoAdminAnalytics() {
  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (6 - index))
    return date.toLocaleString('en-IN', { month: 'short' })
  })

  const monthlyRevenueValues = [420000, 465000, 498000, 512000, 556000, 603000, 648000]
  const monthlyAppointmentValues = [118, 126, 132, 141, 149, 158, 171]
  const totalGmv = monthlyRevenueValues.reduce((sum, value) => sum + value, 0)

  return {
    kpis: {
      totalGmv,
      totalGmvFormatted: `₹${(totalGmv / 100000).toFixed(1)}L`,
      activePatients: 1840,
      completionRate: 92.6,
      totalProviders: 128,
      totalAppointments: monthlyAppointmentValues.reduce((sum, value) => sum + value, 0),
    },
    monthlyRevenue: labels.map((label, index) => ({
      label,
      revenue: monthlyRevenueValues[index],
    })),
    monthlyAppointments: labels.map((label, index) => ({
      label,
      count: monthlyAppointmentValues[index],
    })),
  }
}