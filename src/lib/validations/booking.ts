import { z } from 'zod'

export const createAppointmentSchema = z.object({
  provider_id: z.string().uuid(),
  availability_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit', 'online']),
  insurance_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
})

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1).max(200).optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
