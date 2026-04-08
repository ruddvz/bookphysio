import { describe, expect, it } from 'vitest'
import {
  formatAppointmentDateTime,
  getNextAppointment,
  getPatientAppointmentProviderName,
  getPatientAppointmentVisitLabel,
} from './dashboard-utils'

const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
const tomorrow = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString()
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

describe('patient dashboard next appointment helpers', () => {
  it('selects the nearest upcoming appointment and ignores past visits', () => {
    const nextAppointment = getNextAppointment([
      {
        id: 'past-visit',
        status: 'completed',
        visit_type: 'in_clinic',
        fee_inr: 800,
        availabilities: { starts_at: yesterday },
        providers: { users: { full_name: 'Dr. Meera Iyer' }, specialties: [] },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'tomorrow-visit',
        status: 'pending',
        visit_type: 'home_visit',
        fee_inr: 1100,
        availabilities: { starts_at: tomorrow },
        providers: { users: { full_name: 'Dr. Meera Iyer' }, specialties: [] },
        locations: { city: 'Mumbai' },
      },
      {
        id: 'soonest-visit',
        status: 'confirmed',
        visit_type: 'in_clinic',
        fee_inr: 950,
        availabilities: { starts_at: inTwoHours },
        providers: { users: { full_name: 'Meera Iyer' }, specialties: [] },
        locations: { city: 'Mumbai' },
      },
    ])

    expect(nextAppointment?.id).toBe('soonest-visit')
  })

  it('returns null when there is no upcoming appointment', () => {
    expect(
      getNextAppointment([
        {
          id: 'past-only',
          status: 'completed',
          visit_type: 'in_clinic',
          fee_inr: 800,
          availabilities: { starts_at: yesterday },
          providers: { users: { full_name: 'Dr. Meera Iyer' }, specialties: [] },
          locations: { city: 'Mumbai' },
        },
      ])
    ).toBeNull()
  })

  it('formats provider and visit details for the appointment card', () => {
    const appointment = {
      id: 'soonest-visit',
      status: 'confirmed',
      visit_type: 'home_visit',
      fee_inr: 900,
      availabilities: { starts_at: inTwoHours },
      providers: { users: { full_name: 'Meera Iyer' }, specialties: [] },
      locations: { city: 'Mumbai' },
    }

    expect(getPatientAppointmentProviderName(appointment)).toBe('Dr. Meera Iyer')
    expect(getPatientAppointmentVisitLabel(appointment)).toBe('Home session')
    expect(formatAppointmentDateTime(inTwoHours)).toMatch(/\d{1,2} \w{3}/)
  })
})