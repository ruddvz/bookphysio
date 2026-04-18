/**
 * Slice 16.16 — v2 patient appointment detail component tests.
 * The v2 renderer is pure-UI: the parent page owns query / mutation / state.
 * These tests pin down the prop contract so the page can wire things up
 * without silent regressions.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { PatientAppointmentDetailV2 } from './PatientAppointmentDetailV2'

afterEach(() => cleanup())

function makeProps(
  overrides: Partial<ComponentProps<typeof PatientAppointmentDetailV2>> = {},
): ComponentProps<typeof PatientAppointmentDetailV2> {
  return {
    appt: {
      id: 'appt-1',
      provider_id: 'prov-1',
      visit_type: 'in_clinic',
      status: 'confirmed',
      fee_inr: 800,
      notes: null,
      provider_notes: null,
      patient_reason: null,
      home_visit_address: null,
      payment_status: null,
      payment_amount_inr: null,
      payment_gst_amount_inr: null,
      created_at: '2026-04-17T10:00:00.000Z',
      availabilities: {
        starts_at: '2026-04-18T06:30:00.000Z',
        ends_at: '2026-04-18T07:00:00.000Z',
        slot_duration_mins: 30,
      },
      locations: { name: 'Care Clinic', address: '12 MG Road', city: 'Mumbai' },
      providers: { users: { full_name: 'Dr. Priya Sharma', avatar_url: null } },
    },
    doctorName: 'Dr. Priya Sharma',
    refCode: 'BP-2026-ABC123',
    canReschedule: true,
    confirmCancel: false,
    onReschedule: vi.fn(),
    onRequestCancel: vi.fn(),
    onKeepIt: vi.fn(),
    onConfirmCancel: vi.fn(),
    cancelPending: false,
    ...overrides,
  }
}

describe('PatientAppointmentDetailV2', () => {
  it('renders the status badge using STATUS_LABEL copy', () => {
    render(<PatientAppointmentDetailV2 {...makeProps()} />)
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
  })

  it('renders the reference code in both the breadcrumb and the header', () => {
    render(<PatientAppointmentDetailV2 {...makeProps()} />)
    // Breadcrumb trail + header paragraph both surface the ref. The breadcrumb
    // prefixes "Ref" into a single span, while the header uses a sibling span.
    expect(screen.getByText('Ref BP-2026-ABC123')).toBeInTheDocument()
    expect(screen.getByText('BP-2026-ABC123')).toBeInTheDocument()
  })

  it('shows reschedule + cancel buttons when canReschedule is true', () => {
    render(<PatientAppointmentDetailV2 {...makeProps()} />)
    expect(
      screen.getByRole('button', { name: /Reschedule with Dr\. Priya Sharma/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel visit/i })).toBeInTheDocument()
  })

  it('hides reschedule + cancel buttons when canReschedule is false', () => {
    render(<PatientAppointmentDetailV2 {...makeProps({ canReschedule: false })} />)
    expect(
      screen.queryByRole('button', { name: /Reschedule with Dr\. Priya Sharma/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancel visit/i })).not.toBeInTheDocument()
  })

  it('fires onRequestCancel when the cancel button is clicked', () => {
    const onRequestCancel = vi.fn()
    render(<PatientAppointmentDetailV2 {...makeProps({ onRequestCancel })} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancel visit/i }))
    expect(onRequestCancel).toHaveBeenCalledTimes(1)
  })

  it('shows the confirm-cancel panel and fires onConfirmCancel on Yes', () => {
    const onConfirmCancel = vi.fn()
    render(
      <PatientAppointmentDetailV2
        {...makeProps({ confirmCancel: true, onConfirmCancel })}
      />,
    )
    expect(screen.getByText(/Cancel this visit/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Yes, cancel/i }))
    expect(onConfirmCancel).toHaveBeenCalledTimes(1)
  })

  it('disables the Yes button while cancelPending is true', () => {
    render(
      <PatientAppointmentDetailV2
        {...makeProps({ confirmCancel: true, cancelPending: true })}
      />,
    )
    const yesButton = screen.getByRole('button', { name: /Processing/i })
    expect(yesButton).toBeDisabled()
  })

  it('renders the correct payment summary when payment_status is "paid"', () => {
    render(
      <PatientAppointmentDetailV2
        {...makeProps({
          appt: {
            ...makeProps().appt,
            payment_status: 'paid',
            payment_amount_inr: 944,
            payment_gst_amount_inr: 144,
          },
        })}
      />,
    )
    expect(screen.getByText(/Total Paid/i)).toBeInTheDocument()
    expect(screen.getByText(/Paid online/i)).toBeInTheDocument()
    expect(screen.getByText('₹944')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Download receipt/i }),
    ).toBeInTheDocument()
  })

  it('renders a follow-up CTA for completed visits', () => {
    render(
      <PatientAppointmentDetailV2
        {...makeProps({
          appt: {
            ...makeProps().appt,
            status: 'completed',
          },
          canReschedule: false,
        })}
      />,
    )
    const link = screen.getByRole('link', { name: /Book follow-up with Dr\. Priya Sharma/i })
    expect(link).toHaveAttribute('href', '/book/prov-1')
  })
})
