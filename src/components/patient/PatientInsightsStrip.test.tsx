import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { PatientInsightsStrip } from './PatientInsightsStrip'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

const BASE = {
  upcomingVisits: 2,
  careTeam: 3,
  publishedSummaries: 5,
}

// Fixed "now" anchor for stable gap calculations.
const NOW = new Date('2026-04-17T12:00:00+05:30').getTime()

describe('PatientInsightsStrip', () => {
  let prevUiV2: string | undefined

  beforeEach(() => {
    prevUiV2 = process.env.NEXT_PUBLIC_UI_V2
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    if (prevUiV2 === undefined) delete process.env.NEXT_PUBLIC_UI_V2
    else process.env.NEXT_PUBLIC_UI_V2 = prevUiV2
    setUiV2Cookie(false)
    vi.useRealTimers()
    cleanup()
  })

  it('renders nothing when the ui-v2 flag is off', () => {
    setUiV2Cookie(false)
    const { container } = render(<PatientInsightsStrip {...BASE} />)
    expect(container.firstChild).toBeNull()
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
