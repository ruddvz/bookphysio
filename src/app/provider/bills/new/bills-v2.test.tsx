import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GstLineItemChips, BillV2Sidebar } from './BillsV2'

describe('GstLineItemChips', () => {
  it('renders GST chips when includeGst is true', () => {
    render(<GstLineItemChips subtotal={1000} includeGst />)
    expect(screen.getByText(/GST 18%/)).toBeInTheDocument()
    expect(screen.getByText(/Total/)).toBeInTheDocument()
  })

  it('renders GST waived chip when includeGst is false', () => {
    render(<GstLineItemChips subtotal={500} includeGst={false} />)
    expect(screen.getByText('GST waived')).toBeInTheDocument()
  })

  it('shows correct subtotal amount', () => {
    render(<GstLineItemChips subtotal={12345} includeGst />)
    expect(screen.getByText(/Subtotal ₹12,345/)).toBeInTheDocument()
  })

  it('shows total as subtotal + GST when GST applies', () => {
    const subtotal = 1000
    const gst = Math.round(subtotal * 0.18)
    render(<GstLineItemChips subtotal={subtotal} includeGst />)
    expect(screen.getByText(new RegExp(`Total ₹${(subtotal + gst).toLocaleString('en-IN')}`))).toBeInTheDocument()
  })
})

describe('BillV2Sidebar', () => {
  it('renders invoice number', () => {
    render(<BillV2Sidebar invoiceNumber="BP-202604-1234" patientName="Test" />)
    expect(screen.getByTestId('bill-sidebar-invoice')).toHaveTextContent('BP-202604-1234')
  })

  it('renders patient name', () => {
    render(<BillV2Sidebar invoiceNumber="INV-1" patientName="Priya Sharma" />)
    expect(screen.getByTestId('bill-sidebar-patient')).toHaveTextContent('Priya Sharma')
  })
})
