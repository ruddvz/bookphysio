import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { DashboardContextStrip } from './DashboardContextStrip'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

// Fixed instant: Friday, 17 Apr 2026 (IST).
const FIXED_DATE = new Date('2026-04-17T09:00:00+05:30')

describe('DashboardContextStrip', () => {
  let prevUiV2: string | undefined

  beforeEach(() => {
    prevUiV2 = process.env.NEXT_PUBLIC_UI_V2
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
  })

  afterEach(() => {
    if (prevUiV2 === undefined) delete process.env.NEXT_PUBLIC_UI_V2
    else process.env.NEXT_PUBLIC_UI_V2 = prevUiV2
    setUiV2Cookie(false)
    cleanup()
  })

  it('renders nothing when the ui-v2 flag is off', () => {
    setUiV2Cookie(false)
    const { container } = render(<DashboardContextStrip role="patient" now={FIXED_DATE} />)
    expect(container.firstChild).toBeNull()
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
