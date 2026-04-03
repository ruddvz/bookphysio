import { z } from 'zod'

export const createAppointmentSchema = z.object({
  provider_id: z.string().uuid(),
  availability_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit']),
  insurance_id: z.string().uuid().optional(),
  patient_address: z.string().trim().min(10).max(250).optional(),
  notes: z.string().max(500).optional(),
})

export const cancelAppointmentSchema = z.object({
  action: z.literal('cancel'),
  reason: z.string().min(1).max(200).optional(),
})

export const updateNotesSchema = z.object({
  action: z.literal('update_notes'),
  notes: z.string().max(2000),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
