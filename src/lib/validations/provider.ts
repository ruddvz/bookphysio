import { z } from 'zod'

const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode')

export const providerProfileSchema = z.object({
  title: z.enum(['Dr.', 'PT', 'BPT', 'MPT']),
  bio: z.string().max(2000).optional(),
  experience_years: z.number().int().min(0).max(60),
  consultation_fee_inr: z.number().int().min(0),
  specialty_ids: z.array(z.string().uuid()).min(1),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  qualification: z.enum(['BPT', 'MPT', 'PhD', 'DPT']).optional(),
  certifications: z.array(z.string().min(1).max(100)).max(20).optional(),
  equipment_tags: z.array(z.string().min(1).max(100)).max(30).optional(),
})

/** Schema for the private IAP member ID — used only in admin/owner-restricted routes. */
export const providerIapSchema = z.object({
  iap_member_id: z.string().min(1).max(50),
})

export const locationSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: pincodeSchema,
  visit_type: z.array(z.enum(['in_clinic', 'home_visit'])).min(1),
})

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>
export type LocationInput = z.infer<typeof locationSchema>
