import type { AppointmentItem, AppointmentTab } from '@/app/patient/appointments/appointments-utils'
import { groupApptsByDay } from '@/app/patient/appointments/appointments-utils'

export type ProviderApptTab = 'upcoming' | 'completed' | 'cancelled'

/** Map provider registry row to shared `AppointmentItem` for day-grouping (patient name in `providers.users`). */
export function mapProviderRowForTimeline(appt: {
  id: string
  status: string
  visit_type: string
  fee_inr: number
  availabilities: { starts_at: string; ends_at: string } | null
  locations: { city: string; name: string } | null
  patient: { full_name: string; avatar_url: string | null } | null
}): AppointmentItem {
  return {
    id: appt.id,
    status: appt.status,
    visit_type: appt.visit_type as AppointmentItem['visit_type'],
    fee_inr: appt.fee_inr,
    payment_status: null,
    availabilities: appt.availabilities,
    providers: {
      users: { full_name: appt.patient?.full_name ?? 'Patient' },
    },
    locations: appt.locations ? { city: appt.locations.city } : null,
  }
}

export function groupProviderAppointmentsByDay(
  appointments: AppointmentItem[],
  tab: ProviderApptTab,
  nowMs: number,
) {
  const timelineTab: AppointmentTab = tab === 'upcoming' ? 'upcoming' : 'past'
  return groupApptsByDay(appointments, timelineTab, nowMs)
}
