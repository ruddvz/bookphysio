import { z } from 'zod'

export const createOrderSchema = z.object({
  appointment_id: z.string().uuid(),
})

export const razorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        amount: z.number(),
        status: z.string(),
      }),
    }).optional(),
    subscription: z.object({
      entity: z.object({
        id: z.string(),
        status: z.string(),
      }),
    }).optional(),
  }),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
