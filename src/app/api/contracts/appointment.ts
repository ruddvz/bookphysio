import type { ProviderCard, ProviderLocation } from './provider'
import type { PaymentStatus } from './payment'
import type { UserProfile } from './user'

export type VisitType = 'in_clinic' | 'home_visit'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface AppointmentSlot {
  id: string
  starts_at: string
  ends_at: string
  slot_duration_mins: number
  location_id: string | null
}

export interface Appointment {
  id: string
  patient: Pick<UserProfile, 'id' | 'full_name' | 'phone' | 'avatar_url'>
  provider: ProviderCard
  slot: AppointmentSlot
  location: ProviderLocation | null
  visit_type: VisitType
  status: AppointmentStatus
  fee_inr: number
  notes: string | null
  provider_notes?: string | null
  patient_reason?: string | null
  home_visit_address?: string | null
  legacy_notes?: string | null
  payment_status?: PaymentStatus | null
  payment_amount_inr?: number | null
  payment_gst_amount_inr?: number | null
  created_at: string
}

export interface BookingRequest {
  provider_id: string
  availability_id: string
  location_id?: string
  visit_type: VisitType
  notes?: string
  patient_address?: string
}
