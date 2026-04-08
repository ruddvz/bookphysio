import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { GenerateBillInput } from '@/lib/clinical/types'
import { BillPdfDocument } from './BillPdfDocument'

vi.mock('@react-pdf/renderer', async () => {
  const React = await import('react')

  type MockProps = React.PropsWithChildren<Record<string, unknown>>

  function normalizeProps(props: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(props).filter(([key]) => key !== 'style' && key !== 'fixed')
    )
  }

  return {
    Document: ({ children, ...props }: MockProps) => React.createElement('div', { ...normalizeProps(props), 'data-testid': 'pdf-document' }, children),
    Page: ({ children, ...props }: MockProps) => React.createElement('div', normalizeProps(props), children),
    Text: ({ children, ...props }: MockProps) => React.createElement('span', normalizeProps(props), children),
    View: ({ children, ...props }: MockProps) => React.createElement('div', normalizeProps(props), children),
    Image: ({ src, ...props }: { src: string } & Record<string, unknown>) => React.createElement('img', { ...normalizeProps(props), src, alt: 'BookPhysio logo', 'data-testid': 'bill-logo' }),
    StyleSheet: { create: <T,>(value: T) => value },
  }
})

const sampleBill: GenerateBillInput = {
  patient_name: 'Rahul Sharma',
  patient_phone: '+91 98765 43210',
  patient_address: 'Mumbai, Maharashtra',
  invoice_date: '2026-04-07',
  invoice_number: 'INV-2026-001',
  line_items: [
    { description: 'Initial assessment', visit_count: 1, rate_inr: 950 },
    { description: 'Follow-up session', visit_count: 2, rate_inr: 525 },
  ],
  include_gst: true,
  notes: 'Continue home exercise plan for two weeks.',
  provider_name: 'Dr Priya Iyer',
  provider_phone: '+91 99887 77665',
  provider_email: 'priya@example.com',
  provider_specialization: 'Sports Physiotherapist',
  provider_clinic_address: 'Andheri West, Mumbai',
  provider_registration_no: 'IAP-2026-44',
}

describe('BillPdfDocument', () => {
  it('renders the branded invoice template with the BookPhysio logo', () => {
    render(<BillPdfDocument bill={sampleBill} logoSrc="data:image/png;base64,abc123" />)

    expect(screen.getByTestId('bill-logo')).toHaveAttribute('src', 'data:image/png;base64,abc123')
    expect(screen.getByText(/Physiotherapy invoice/i)).toBeInTheDocument()
    expect(screen.getByText(/Invoice #: INV-2026-001/i)).toBeInTheDocument()
    expect(screen.getByText(/Rahul Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/Dr Priya Iyer/i)).toBeInTheDocument()
    expect(screen.getByText('₹360')).toBeInTheDocument()
    expect(screen.getByText('₹2,360')).toBeInTheDocument()
  })

  it('falls back to text branding and omits GST rows when GST is disabled', () => {
    render(
      <BillPdfDocument
        bill={{
          ...sampleBill,
          include_gst: false,
          notes: null,
        }}
      />
    )

    expect(screen.getByText('BookPhysio.in')).toBeInTheDocument()
    expect(screen.queryByText(/GST \(18%\)/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('₹2,000')).toHaveLength(2)
  })
})