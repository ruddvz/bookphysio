import { describe, it, expect } from 'vitest'
import { mapProviderRowForTimeline, groupProviderAppointmentsByDay } from './provider-appointments-utils'
import type { AppointmentItem } from '@/app/patient/appointments/appointments-utils'

describe('provider-appointments-utils', () => {
  it('maps registry row with patient name for providerDisplayName', () => {
    const item = mapProviderRowForTimeline({
      id: 'a1',
      status: 'confirmed',
      visit_type: 'in_clinic',
      fee_inr: 800,
      availabilities: { starts_at: '2026-06-01T10:00:00.000+05:30', ends_at: '2026-06-01T10:30:00.000+05:30' },
      locations: { city: 'Mumbai', name: 'Clinic' },
      patient: { full_name: 'Priya Nair', avatar_url: null },
    })
    expect(item.providers?.users?.full_name).toBe('Priya Nair')
    expect(item.locations?.city).toBe('Mumbai')
  })

  it('groups by day for upcoming tab ascending', () => {
    const a: AppointmentItem = {
      id: '1',
      status: 'confirmed',
      visit_type: 'in_clinic',
      fee_inr: 500,
      payment_status: null,
      availabilities: { starts_at: '2026-06-02T10:00:00.000+05:30' },
      providers: { users: { full_name: 'A' } },
      locations: { city: 'Pune' },
    }
    const b: AppointmentItem = {
      id: '2',
      status: 'confirmed',
      visit_type: 'in_clinic',
      fee_inr: 500,
      payment_status: null,
      availabilities: { starts_at: '2026-06-01T10:00:00.000+05:30' },
      providers: { users: { full_name: 'B' } },
      locations: { city: 'Pune' },
    }
    const days = groupProviderAppointmentsByDay([a, b], 'upcoming', Date.parse('2026-05-01T12:00:00.000+05:30'))
    expect(days.length).toBeGreaterThanOrEqual(1)
    const firstDay = days[0]
    expect(firstDay.items[0].id).toBe('2')
  })
})
