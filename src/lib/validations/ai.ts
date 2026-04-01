import { z } from 'zod'

export const aiMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
})

export const aiChatRequestSchema = z.object({
  messages: z.array(aiMessageSchema).min(1).max(30),
})

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>