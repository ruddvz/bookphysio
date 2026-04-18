import { z } from 'zod'

const deprecatedInsuranceField = z.any().optional().refine((value) => value === undefined, {
  message: 'insurance_id is no longer supported',
})

export const createAppointmentSchema = z.object({
  provider_id: z.string().uuid(),
  availability_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit']),
  patient_address: z.string().trim().min(10).max(250).optional(),
  notes: z.string().max(500).optional(),
  insurance_id: deprecatedInsuranceField,
}).transform(({ insurance_id, ...booking }) => {
  void insurance_id
  return booking
})

export const cancelAppointmentSchema = z.object({
  action: z.literal('cancel'),
  reason: z.string().min(1).max(200).optional(),
})

export const rescheduleAppointmentSchema = z.object({
  action: z.literal('reschedule'),
  new_availability_id: z.string().uuid(),
})

export const updateNotesSchema = z.object({
  action: z.literal('update_notes'),
  notes: z.string().max(2000),
})

/** Provider-only: set appointment outcome after the scheduled start time (or confirm a pending request). */
export const providerSetStatusSchema = z.object({
  action: z.literal('provider_set_status'),
  status: z.enum(['confirmed', 'completed', 'no_show']),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
