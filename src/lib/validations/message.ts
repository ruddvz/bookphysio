import { z } from 'zod'

export const messageRequestSchema = z.object({
  receiver_id: z.string().uuid('Invalid receiver ID'),
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long'),
})

export const markConversationReadSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
})

const conversationsLimitSchema = z.coerce.number().int().min(1).max(100).default(20)
const messagesLimitSchema = z.coerce.number().int().min(1).max(200).default(50)
const offsetSchema = z.coerce.number().int().min(0).default(0)

export const getConversationsSchema = z.object({
  limit: conversationsLimitSchema,
  offset: offsetSchema,
})

export const getMessagesSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  limit: messagesLimitSchema,
  offset: offsetSchema,
})

export type MessageRequest = z.infer<typeof messageRequestSchema>
export type MarkConversationRead = z.infer<typeof markConversationReadSchema>
export type GetConversations = z.infer<typeof getConversationsSchema>
export type GetMessages = z.infer<typeof getMessagesSchema>
