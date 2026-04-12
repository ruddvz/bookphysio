import { describe, expect, it } from 'vitest'
import { metadata as adminMetadata, viewport as adminViewport } from '@/app/admin/layout'
import { metadata as patientMetadata, viewport as patientViewport } from '@/app/patient/layout'
import { metadata as providerMetadata, viewport as providerViewport } from '@/app/provider/layout'

describe('dashboard manifest metadata', () => {
  it('uses a patient-specific manifest and install title', () => {
    expect(patientMetadata.manifest).toBe('/manifest-patient.json')
    expect(
      patientMetadata.appleWebApp && typeof patientMetadata.appleWebApp === 'object'
        ? patientMetadata.appleWebApp.title
        : undefined,
    ).toBe('BookPhysio Patient')
    expect(patientViewport.themeColor).toBe('#1e40af')
  })

  it('uses a provider-specific manifest and install title', () => {
    expect(providerMetadata.manifest).toBe('/manifest-provider.json')
    expect(
      providerMetadata.appleWebApp && typeof providerMetadata.appleWebApp === 'object'
        ? providerMetadata.appleWebApp.title
        : undefined,
    ).toBe('BookPhysio Provider')
    expect(providerViewport.themeColor).toBe('#7c3aed')
  })

  it('uses an admin-specific manifest and install title', () => {
    expect(adminMetadata.manifest).toBe('/manifest-admin.json')
    expect(
      adminMetadata.appleWebApp && typeof adminMetadata.appleWebApp === 'object'
        ? adminMetadata.appleWebApp.title
        : undefined,
    ).toBe('BookPhysio Admin')
    expect(adminViewport.themeColor).toBe('#1a1a2e')
  })
})
