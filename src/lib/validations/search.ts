import { z } from 'zod'

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  specialty_id: z.string().uuid().optional(),
  insurance_id: z.string().uuid().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit', 'online']).optional(),
  available_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  min_rating: z.coerce.number().min(1).max(5).optional(),
  max_fee_inr: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>
