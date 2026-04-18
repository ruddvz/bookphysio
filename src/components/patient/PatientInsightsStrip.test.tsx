import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { PatientInsightsStrip } from './PatientInsightsStrip'

const BASE = {
  upcomingVisits: 2,
  careTeam: 3,
  publishedSummaries: 5,
}

// Fixed "now" anchor for stable gap calculations.
const NOW = new Date('2026-04-17T12:00:00+05:30').getTime()

describe('PatientInsightsStrip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders the three insight tiles with their values', () => {
    render(<PatientInsightsStrip {...BASE} />)
    expect(screen.getByText(/upcoming visits/i)).toBeInTheDocument()
    expect(screen.getByText(/care team/i)).toBeInTheDocument()
    expect(screen.getByText(/visit summaries/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders an "on track" badge when the last visit was within 14 days', () => {
    const recent = new Date(NOW - 7 * 86_400_000).toISOString()
    render(<PatientInsightsStrip {...BASE} lastVisitIso={recent} />)
    expect(screen.getByText(/7d ago · on track/i)).toBeInTheDocument()
  })

  it('renders a "check in" badge when the last visit was 15-45 days ago', () => {
    const mid = new Date(NOW - 30 * 86_400_000).toISOString()
    render(<PatientInsightsStrip {...BASE} lastVisitIso={mid} />)
    expect(screen.getByText(/30d ago · check in/i)).toBeInTheDocument()
  })

  it('renders a "book soon" badge when the last visit was >45 days ago', () => {
    const stale = new Date(NOW - 90 * 86_400_000).toISOString()
    render(<PatientInsightsStrip {...BASE} lastVisitIso={stale} />)
    expect(screen.getByText(/90d ago · book soon/i)).toBeInTheDocument()
  })

  it('renders "no visits yet" when no last visit is available', () => {
    render(<PatientInsightsStrip {...BASE} lastVisitIso={null} />)
    expect(screen.getByText(/no visits yet/i)).toBeInTheDocument()
  })

  it('falls back to "no visits yet" for an unparseable ISO string', () => {
    render(<PatientInsightsStrip {...BASE} lastVisitIso="not-a-real-date" />)
    expect(screen.getByText(/no visits yet/i)).toBeInTheDocument()
  })

  it('falls back to "no visits yet" for a future timestamp', () => {
    const future = new Date(NOW + 5 * 86_400_000).toISOString()
    render(<PatientInsightsStrip {...BASE} lastVisitIso={future} />)
    expect(screen.getByText(/no visits yet/i)).toBeInTheDocument()
  })

  it('renders the book CTA with the expected href', () => {
    render(<PatientInsightsStrip {...BASE} />)
    const cta = screen.getByRole('link', { name: /book next session/i })
    expect(cta).toHaveAttribute('href', '/search')
  })

  it('respects a custom bookHref override', () => {
    render(<PatientInsightsStrip {...BASE} bookHref="/search?specialty=sports" />)
    const cta = screen.getByRole('link', { name: /book next session/i })
    expect(cta).toHaveAttribute('href', '/search?specialty=sports')
  })

  it('labels the cadence sparkline for assistive tech', () => {
    render(<PatientInsightsStrip {...BASE} />)
    expect(screen.getByRole('img', { name: /visits per week trend/i })).toBeInTheDocument()
  })
})
