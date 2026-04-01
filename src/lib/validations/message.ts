import { z } from 'zod'

export const messageRequestSchema = z.object({
  receiver_id: z.string().uuid('Invalid receiver ID'),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long'),
})

export const markConversationReadSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
})

export const getConversationsSchema = z.object({
  limit: z.string().optional().default('20').pipe(z.coerce.number().min(1).max(100)),
  offset: z.string().optional().default('0').pipe(z.coerce.number().min(0)),
})

export const getMessagesSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  limit: z.string().optional().default('50').pipe(z.coerce.number().min(1).max(200)),
  offset: z.string().optional().default('0').pipe(z.coerce.number().min(0)),
})

export type MessageRequest = z.infer<typeof messageRequestSchema>
export type MarkConversationRead = z.infer<typeof markConversationReadSchema>
export type GetConversations = z.infer<typeof getConversationsSchema>
export type GetMessages = z.infer<typeof getMessagesSchema>
