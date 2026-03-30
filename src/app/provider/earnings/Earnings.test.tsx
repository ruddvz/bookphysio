import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProviderEarnings from './page'

describe('ProviderEarnings', () => {
  it('renders summary stats with correct formatting', () => {
    render(<ProviderEarnings />)
    // Check for "This Month" value. Mock TRANSACTIONS total is 5300.
    expect(screen.getByText(/₹5300/i)).toBeInTheDocument()
    // Check for "GST Collected" value. Mock TRANSACTIONS GST total is 954.
    expect(screen.getByText(/₹954/i)).toBeInTheDocument()
  })

  it('renders transaction list with correct data', () => {
    render(<ProviderEarnings />)
    expect(screen.getByText(/Rahul Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/28 Mar 2026/i)).toBeInTheDocument()
    // Check for net earning with teal text/bold
    const netEarning = screen.getAllByText(/₹656/i)[0] // Rahul's net
    expect(netEarning).toBeInTheDocument()
  })

  it('displays status badges correctly', () => {
    render(<ProviderEarnings />)
    const paidBadges = screen.getAllByText(/Paid/i)
    const pendingBadges = screen.getAllByText(/Pending/i)
    
    expect(paidBadges.length).toBeGreaterThan(0)
    expect(pendingBadges.length).toBeGreaterThan(0)
  })

  it('shows chart placeholder', () => {
    render(<ProviderEarnings />)
    expect(screen.getByText(/Revenue Growth/i)).toBeInTheDocument()
    expect(screen.getByText(/Interactive charts arriving in Phase 9/i)).toBeInTheDocument()
  })
})
