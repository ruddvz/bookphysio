import type { UserProfile } from './user'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id_1: string
  user_id_2: string
  other_user: UserProfile
  last_message: Message | null
  unread_count: number
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface MessageRequest {
  receiver_id: string
  content: string
}

export interface MessageResponse {
  message: Message
}

export interface ConversationsResponse {
  conversations: Conversation[]
  total: number
}

export interface MessagesResponse {
  messages: Message[]
  total: number
}
