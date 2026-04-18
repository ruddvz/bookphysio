/**
 * Slice 16.17 — v2 patient payments ledger tests.
 * Covers pure utility functions (groupPaymentsByMonth, statusBadgeVariant,
 * formatInr) and the PatientPaymentsLedger rendering paths.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'

// ── flag mock ──────────────────────────────────────────────────────────────
let mockV2 = false
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => mockV2 }))
function setV2(value: boolean) { mockV2 = value }

// ── Next.js Link mock ──────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children?: unknown; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children as never}</a>
  ),
}))

import {
  groupPaymentsByMonth,
  statusBadgeVariant,
  formatInr,
  providerDisplayName,
  visitTypeLabel,
  type PaymentItem,
} from './payments-utils'
import { PatientPaymentsLedger } from './PatientPaymentsLedger'

// ── helpers ────────────────────────────────────────────────────────────────
function makePayment(overrides: Partial<PaymentItem> & { id: string }): PaymentItem {
  return {
    id: overrides.id,
    appointment_id: overrides.appointment_id ?? `appt-${overrides.id}`,
    amount_inr: overrides.amount_inr ?? 1180,
    gst_amount_inr: overrides.gst_amount_inr ?? 180,
    status: overrides.status ?? 'paid',
    razorpay_payment_id: overrides.razorpay_payment_id ?? null,
    created_at: overrides.created_at ?? '2026-04-10T10:00:00.000Z',
    visit_type: overrides.visit_type ?? 'in_clinic',
    // Use 'provider_name' in overrides check to allow explicit null
    provider_name: 'provider_name' in overrides ? overrides.provider_name ?? null : 'Priya Sharma',
    starts_at: overrides.starts_at ?? '2026-04-10T09:00:00.000Z',
  }
}

beforeEach(() => { mockV2 = false })
afterEach(() => cleanup())

// ── pure utility tests ─────────────────────────────────────────────────────
describe('statusBadgeVariant', () => {
  it('returns success for paid', () => expect(statusBadgeVariant('paid')).toBe('success'))
  it('returns danger for failed', () => expect(statusBadgeVariant('failed')).toBe('danger'))
  it('returns soft for refunded', () => expect(statusBadgeVariant('refunded')).toBe('soft'))
  it('returns warning for created/pending', () => expect(statusBadgeVariant('created')).toBe('warning'))
  it('returns warning for unknown status', () => expect(statusBadgeVariant('unknown')).toBe('warning'))
})

describe('formatInr', () => {
  it('formats zero as ₹0', () => expect(formatInr(0)).toBe('₹0'))
  it('formats 1180 with en-IN grouping', () => expect(formatInr(1180)).toBe('₹1,180'))
  it('rounds non-integer amounts', () => expect(formatInr(999.7)).toBe('₹1,000'))
})

describe('providerDisplayName', () => {
  it('prefixes Dr. when missing', () =>
    expect(providerDisplayName(makePayment({ id: 'x', provider_name: 'Priya Sharma' }))).toBe('Dr. Priya Sharma'))
  it('does not double-prefix', () =>
    expect(providerDisplayName(makePayment({ id: 'x', provider_name: 'Dr. Mehta' }))).toBe('Dr. Mehta'))
  it('falls back to Provider when null', () =>
    expect(providerDisplayName(makePayment({ id: 'x', provider_name: null }))).toBe('Provider'))
})

describe('visitTypeLabel', () => {
  it('maps in_clinic', () => expect(visitTypeLabel('in_clinic')).toBe('Clinic visit'))
  it('maps home_visit', () => expect(visitTypeLabel('home_visit')).toBe('Home session'))
  it('maps video', () => expect(visitTypeLabel('video')).toBe('Video visit'))
})

describe('groupPaymentsByMonth', () => {
  it('returns empty array for no payments', () => {
    expect(groupPaymentsByMonth([])).toHaveLength(0)
  })

  it('groups a single payment into one month bucket', () => {
    const groups = groupPaymentsByMonth([makePayment({ id: 'p1', created_at: '2026-04-10T10:00:00.000Z' })])
    expect(groups).toHaveLength(1)
    expect(groups[0].key).toBe('2026-04')
    expect(groups[0].items).toHaveLength(1)
  })

  it('places payments in separate buckets for different months', () => {
    const payments = [
      makePayment({ id: 'p1', created_at: '2026-04-10T10:00:00.000Z' }),
      makePayment({ id: 'p2', created_at: '2026-03-15T10:00:00.000Z' }),
    ]
    const groups = groupPaymentsByMonth(payments)
    expect(groups).toHaveLength(2)
    expect(groups[0].key).toBe('2026-04') // newest first
    expect(groups[1].key).toBe('2026-03')
  })

  it('computes totalPaid only from paid items', () => {
    const payments = [
      makePayment({ id: 'p1', amount_inr: 1180, gst_amount_inr: 180, status: 'paid' }),
      makePayment({ id: 'p2', amount_inr: 800,  gst_amount_inr: 122, status: 'created' }),
    ]
    const [group] = groupPaymentsByMonth(payments)
    expect(group.totalPaid).toBe(1180)
    expect(group.gstTotal).toBe(180)
  })

  it('handles a late-night UTC timestamp that belongs to the next IST day correctly', () => {
    // 2026-03-31T19:00:00Z = 2026-04-01T00:30:00 IST → April bucket
    const groups = groupPaymentsByMonth([
      makePayment({ id: 'p1', created_at: '2026-03-31T19:00:00.000Z' }),
    ])
    expect(groups[0].key).toBe('2026-04')
  })
})

// ── component rendering tests ──────────────────────────────────────────────
describe('PatientPaymentsLedger', () => {
  it('returns null in v1 mode', () => {
    setV2(false)
    const { container } = render(
      <PatientPaymentsLedger payments={[makePayment({ id: 'p1' })]} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when payments list is empty in v2 mode', () => {
    setV2(true)
    const { container } = render(<PatientPaymentsLedger payments={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the ledger with data-ui-version="v2" in v2 mode', () => {
    setV2(true)
    render(<PatientPaymentsLedger payments={[makePayment({ id: 'p1' })]} />)
    expect(screen.getByTestId('patient-payments-ledger')).toHaveAttribute('data-ui-version', 'v2')
  })

  it('renders one ledger-row per payment', () => {
    setV2(true)
    const payments = [
      makePayment({ id: 'p1', created_at: '2026-04-10T10:00:00.000Z' }),
      makePayment({ id: 'p2', created_at: '2026-04-12T10:00:00.000Z' }),
    ]
    render(<PatientPaymentsLedger payments={payments} />)
    expect(screen.getAllByTestId('ledger-row')).toHaveLength(2)
  })

  it('shows the month total for paid items', () => {
    setV2(true)
    render(
      <PatientPaymentsLedger
        payments={[makePayment({ id: 'p1', amount_inr: 1180, gst_amount_inr: 180, status: 'paid' })]}
      />,
    )
    expect(screen.getByTestId('month-total').textContent).toContain('1,180')
  })

  it('shows the GST line when gst_amount_inr > 0', () => {
    setV2(true)
    render(
      <PatientPaymentsLedger
        payments={[makePayment({ id: 'p1', amount_inr: 1180, gst_amount_inr: 180 })]}
      />,
    )
    expect(screen.getByTestId('gst-line').textContent).toContain('180')
  })

  it('omits the GST line when gst_amount_inr is zero', () => {
    setV2(true)
    render(
      <PatientPaymentsLedger
        payments={[makePayment({ id: 'p1', amount_inr: 1000, gst_amount_inr: 0 })]}
      />,
    )
    expect(screen.queryByTestId('gst-line')).toBeNull()
  })

  it('renders the correct status badge label (Paid)', () => {
    setV2(true)
    render(<PatientPaymentsLedger payments={[makePayment({ id: 'p1', status: 'paid' })]} />)
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })

  it('renders the correct status badge label (Refunded)', () => {
    setV2(true)
    render(<PatientPaymentsLedger payments={[makePayment({ id: 'p1', status: 'refunded' })]} />)
    expect(screen.getByText('Refunded')).toBeInTheDocument()
  })

  it('links the "View →" to the correct appointment page', () => {
    setV2(true)
    render(
      <PatientPaymentsLedger
        payments={[makePayment({ id: 'p1', appointment_id: 'appt-xyz' })]}
      />,
    )
    const link = screen.getByRole('link', { name: /view appointment/i })
    expect(link).toHaveAttribute('href', '/patient/appointments/appt-xyz')
  })

  it('groups payments across months into separate sections', () => {
    setV2(true)
    const payments = [
      makePayment({ id: 'p1', created_at: '2026-04-10T10:00:00.000Z', status: 'paid', amount_inr: 1180, gst_amount_inr: 180 }),
      makePayment({ id: 'p2', created_at: '2026-03-05T10:00:00.000Z', status: 'paid', amount_inr: 590,  gst_amount_inr: 90 }),
    ]
    render(<PatientPaymentsLedger payments={payments} />)
    const ledger = screen.getByTestId('patient-payments-ledger')
    const sections = within(ledger).getAllByRole('listitem')
    expect(sections).toHaveLength(2)
  })
})
