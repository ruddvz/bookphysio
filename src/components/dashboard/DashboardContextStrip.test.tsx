import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { DashboardContextStrip } from './DashboardContextStrip'

// Fixed instant: Friday, 17 Apr 2026 (IST).
const FIXED_DATE = new Date('2026-04-17T09:00:00+05:30')

describe('DashboardContextStrip', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the patient copy when on the patient dashboard', () => {
    render(<DashboardContextStrip role="patient" now={FIXED_DATE} />)
    expect(screen.getByText(/your care/i)).toBeInTheDocument()
    expect(screen.getByText(/friday snapshot/i)).toBeInTheDocument()
    expect(screen.getByText(/pre-visit form/i)).toBeInTheDocument()
    expect(screen.getByText(/on track/i)).toBeInTheDocument()
  })

  it('renders the provider copy when on the provider dashboard', () => {
    render(<DashboardContextStrip role="provider" now={FIXED_DATE} />)
    expect(screen.getByText(/practice pulse/i)).toBeInTheDocument()
    expect(screen.getByText(/friday rundown/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-draft visit notes/i)).toBeInTheDocument()
    expect(screen.getByText(/all set/i)).toBeInTheDocument()
  })

  it('renders the admin copy when on the admin dashboard', () => {
    render(<DashboardContextStrip role="admin" now={FIXED_DATE} />)
    expect(screen.getByText(/ops console/i)).toBeInTheDocument()
    expect(screen.getByText(/friday review/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-refresh/i)).toBeInTheDocument()
    expect(screen.getByText(/live/i)).toBeInTheDocument()
  })

  it('formats the date in India locale', () => {
    render(<DashboardContextStrip role="patient" now={FIXED_DATE} />)
    expect(screen.getByText(/17 apr 2026/i)).toBeInTheDocument()
  })

  it('exposes an aria-labeled region', () => {
    render(<DashboardContextStrip role="patient" now={FIXED_DATE} />)
    expect(screen.getByRole('region', { name: /your care strip/i })).toBeInTheDocument()
  })
})
