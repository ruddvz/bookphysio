import {
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
} from '../appointments/appointments-utils'

export function getNextAppointment(appointments: AppointmentItem[]): AppointmentItem | null {
  const now = Date.now()

  return (
    appointments
      .filter((appointment) => {
        const startsAt = appointment.availabilities?.starts_at
        if (!startsAt) {
          return false
        }

        if (appointment.status === 'cancelled' || appointment.status === 'completed' || appointment.status === 'no_show') {
          return false
        }

        return Date.parse(startsAt) >= now
      })
      .sort((left, right) => {
        const leftTime = Date.parse(left.availabilities?.starts_at ?? '')
        const rightTime = Date.parse(right.availabilities?.starts_at ?? '')
        return leftTime - rightTime
      })[0] ?? null
  )
}

export function getPatientAppointmentProviderName(appointment: AppointmentItem): string {
  return providerDisplayName(appointment)
}

export function getPatientAppointmentVisitLabel(appointment: AppointmentItem): string {
  return appointment.visit_type === 'home_visit' ? 'Home session' : 'Clinic visit'
}

export function formatAppointmentDateTime(iso: string): string {
  return formatApptDate(iso)
}
