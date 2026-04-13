import { z } from 'zod'

const deprecatedInsuranceField = z.any().optional().refine((value) => value === undefined, {
  message: 'insurance_id is no longer supported',
})

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  specialty_id: z.string().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit']).optional(),
  sort: z.enum(['relevance', 'availability', 'price', 'distance', 'rating']).optional(),
  available_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  min_rating: z.coerce.number().min(1).max(5).optional(),
  max_fee_inr: z.coerce.number().min(0).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius_km: z.coerce.number().min(1).default(50),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  insurance_id: deprecatedInsuranceField,
}).transform(({ insurance_id, ...filters }) => {
  void insurance_id
  return filters
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>
