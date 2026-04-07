import { z } from 'zod'

export const genderSchema = z.enum(['male', 'female', 'other'])

export const addPatientSchema = z.object({
  patient_name: z.string().trim().min(2).max(100),
  patient_phone: z.string().trim().max(20).optional().nullable(),
  patient_age: z.number().int().min(0).max(130).optional().nullable(),
  patient_gender: genderSchema.optional().nullable(),
  chief_complaint: z.string().trim().max(500).optional().nullable(),
})

export const updateProfileSchema = z.object({
  patient_name: z.string().trim().min(2).max(100).optional(),
  patient_phone: z.string().trim().max(20).nullable().optional(),
  patient_age: z.number().int().min(0).max(130).nullable().optional(),
  patient_gender: genderSchema.nullable().optional(),
  chief_complaint: z.string().trim().max(500).nullable().optional(),
  medical_history: z.string().trim().max(2000).nullable().optional(),
  contraindications: z.string().trim().max(1000).nullable().optional(),
  treatment_goals: z.string().trim().max(1000).nullable().optional(),
})

export const createVisitSchema = z.object({
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const scheduleVisitSchema = z.object({
  profile_id: z.string().uuid(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visit_time: z.string().regex(/^\d{2}:\d{2}$/),
  fee_inr: z.number().int().min(0).max(1000000).optional().nullable(),
})

export type ScheduleVisitInput = z.infer<typeof scheduleVisitSchema>

export interface ScheduleEntry {
  visit_id: string
  profile_id: string
  patient_name: string
  visit_date: string
  visit_time: string
  fee_inr: number | null
  visit_number: number
}

export const upsertSoapSchema = z.object({
  subjective: z.string().trim().max(2000).nullable().optional(),
  pain_scale: z.number().int().min(0).max(10).nullable().optional(),
  range_of_motion: z.string().trim().max(1000).nullable().optional(),
  functional_tests: z.string().trim().max(1000).nullable().optional(),
  objective_notes: z.string().trim().max(2000).nullable().optional(),
  assessment: z.string().trim().max(2000).nullable().optional(),
  plan: z.string().trim().max(2000).nullable().optional(),
  patient_summary: z.string().trim().max(1000).nullable().optional(),
})

export interface ClinicalProfile {
  id: string
  provider_id: string
  patient_user_id: string | null
  patient_name: string
  patient_phone: string | null
  patient_age: number | null
  patient_gender: 'male' | 'female' | 'other' | null
  chief_complaint: string | null
  medical_history: string | null
  contraindications: string | null
  treatment_goals: string | null
  created_at: string
  updated_at: string
}

export interface ClinicalNote {
  id: string
  visit_id: string
  provider_id: string
  profile_id: string
  subjective: string | null
  pain_scale: number | null
  range_of_motion: string | null
  functional_tests: string | null
  objective_notes: string | null
  assessment: string | null
  plan: string | null
  patient_summary: string | null
  created_at: string
  updated_at: string
}

export interface PatientVisit {
  id: string
  profile_id: string
  provider_id: string
  visit_number: number
  visit_date: string
  created_at: string
  note?: ClinicalNote | null
}

export interface PatientRosterRow {
  profile_id: string
  patient_name: string
  patient_phone: string | null
  patient_age: number | null
  chief_complaint: string | null
  visit_count: number
  last_visit_date: string | null
}

export interface PatientChart {
  profile: ClinicalProfile
  visits: PatientVisit[]
}

export interface PatientFacingRecord {
  visit_id: string
  visit_number: number
  visit_date: string
  provider_name: string
  plan: string | null
  patient_summary: string | null
}

export const billLineItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  visit_count: z.number().int().min(1).max(999),
  rate_inr: z.number().int().min(0).max(1000000),
})

export const generateBillSchema = z.object({
  patient_name: z.string().trim().min(2).max(100),
  patient_phone: z.string().trim().max(20).optional().nullable(),
  patient_address: z.string().trim().max(300).optional().nullable(),
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  invoice_number: z.string().trim().min(1).max(40),
  line_items: z.array(billLineItemSchema).min(1).max(20),
  include_gst: z.boolean(),
  notes: z.string().trim().max(500).optional().nullable(),
  provider_name: z.string().trim().min(1).max(120),
  provider_phone: z.string().trim().max(20).optional().nullable(),
  provider_email: z.string().trim().max(120).optional().nullable(),
  provider_specialization: z.string().trim().max(120).optional().nullable(),
  provider_clinic_address: z.string().trim().max(300).optional().nullable(),
  provider_registration_no: z.string().trim().max(60).optional().nullable(),
})

export type BillLineItem = z.infer<typeof billLineItemSchema>
export type GenerateBillInput = z.infer<typeof generateBillSchema>
