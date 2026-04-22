import { describe, expect, it } from 'vitest'
import {
  buildAppointmentNotes,
  collectVisitTypes,
  getVisitTypeConsultationFee,
  parseAppointmentNotes,
  updateProviderAppointmentNotes,
} from './policy'

describe('booking policy helpers', () => {
  it('aggregates visit types across every provider location', () => {
    expect(
      collectVisitTypes([
        { visit_type: ['in_clinic'] },
        { visit_type: ['home_visit', 'in_clinic'] },
      ]),
    ).toEqual(['in_clinic', 'home_visit'])
  })

  it('applies the home-visit surcharge consistently', () => {
    expect(getVisitTypeConsultationFee(1200, 'in_clinic')).toBe(1200)
    expect(getVisitTypeConsultationFee(1200, 'home_visit')).toBe(1560)
  })

  it('stores booking metadata separately from provider notes', () => {
    const notes = buildAppointmentNotes({
      visitType: 'home_visit',
      patientAddress: '12 Palm Street, Bengaluru',
      notes: 'Bring previous MRI report',
    })

    expect(parseAppointmentNotes(notes)).toEqual({
      homeVisitAddress: '12 Palm Street, Bengaluru',
      patientReason: 'Bring previous MRI report',
      providerNotes: null,
      legacyNotes: null,
    })
  })

  it('preserves booking metadata when provider notes are updated later', () => {
    const notes = buildAppointmentNotes({
      visitType: 'home_visit',
      patientAddress: '12 Palm Street, Bengaluru',
      notes: 'Bring previous MRI report',
    })

    expect(parseAppointmentNotes(updateProviderAppointmentNotes(notes, 'Manual therapy completed'))).toEqual({
      homeVisitAddress: '12 Palm Street, Bengaluru',
      patientReason: 'Bring previous MRI report',
      providerNotes: 'Manual therapy completed',
      legacyNotes: null,
    })
  })

  it('round-trips patient notes even when they contain the legacy sentinel text', () => {
    const notes = buildAppointmentNotes({
      visitType: 'home_visit',
      patientAddress: '12 Palm Street, Bengaluru',
      notes: 'Patient mentioned [/BookPhysioMeta] in an old export.',
    })

    expect(parseAppointmentNotes(notes)).toEqual({
      homeVisitAddress: '12 Palm Street, Bengaluru',
      patientReason: 'Patient mentioned [/BookPhysioMeta] in an old export.',
      providerNotes: null,
      legacyNotes: null,
    })
  })

  it('preserves legacy plain-text notes without reclassifying them', () => {
    expect(parseAppointmentNotes('Bring previous MRI report')).toEqual({
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: null,
      legacyNotes: 'Bring previous MRI report',
    })
  })

  it('stores provider-only notes as structured provider notes', () => {
    expect(parseAppointmentNotes(updateProviderAppointmentNotes(null, 'Manual therapy completed'))).toEqual({
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: 'Manual therapy completed',
      legacyNotes: null,
    })
  })

  it('keeps legacy plain-text notes alongside new provider notes', () => {
    expect(parseAppointmentNotes(updateProviderAppointmentNotes('Bring previous MRI report', 'Manual therapy completed'))).toEqual({
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: 'Manual therapy completed',
      legacyNotes: 'Bring previous MRI report',
    })
  })
})