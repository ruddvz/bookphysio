import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StepPayment } from './StepPayment'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/book/test-id',
  useSearchParams: () => new URLSearchParams(),
}))

describe('StepPayment', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not continue to success when appointment creation is unauthorized', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const onSuccess = vi.fn()

    render(
      <StepPayment
        doctorId="provider-1"
        slotId="slot-1"
        locationId="location-1"
        visitType="in_clinic"
        feeInr={1200}
        patient={{
          fullName: 'Aarav Kapoor',
          phone: '+919876543210',
          email: 'aarav@example.com',
          reason: 'Knee pain',
          homeVisitAddress: '',
          painLocation: '',
          painSeverity: undefined,
          painDuration: '',
        }}
        onBack={() => {}}
        onSuccess={onSuccess}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(screen.getByText(/sign in to complete your booking/i)).toBeInTheDocument()
  })

  it('includes the patient home address when confirming a home visit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'appt-123456' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <StepPayment
        doctorId="provider-1"
        slotId="slot-1"
        locationId="location-1"
        visitType="home_visit"
        feeInr={1560}
        patient={{
          fullName: 'Aarav Kapoor',
          phone: '+919876543210',
          email: 'aarav@example.com',
          reason: 'Post-op recovery',
          homeVisitAddress: '12 Palm Street, Bengaluru',
          painLocation: 'knee',
          painSeverity: 7,
          painDuration: '1_3_months',
        }}
        onBack={() => {}}
        onSuccess={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      patient_address: '12 Palm Street, Bengaluru',
      visit_type: 'home_visit',
    })
  })

  it('omits the optional notes field when the patient leaves booking notes blank', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'appt-123456' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <StepPayment
        doctorId="provider-1"
        slotId="slot-1"
        locationId="location-1"
        visitType="in_clinic"
        feeInr={1200}
        patient={{
          fullName: 'Aarav Kapoor',
          phone: '+919876543210',
          email: 'aarav@example.com',
          reason: '   ',
          homeVisitAddress: '',
          painLocation: '',
          painSeverity: undefined,
          painDuration: '',
        }}
        onBack={() => {}}
        onSuccess={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).not.toHaveProperty('notes')
  })
})