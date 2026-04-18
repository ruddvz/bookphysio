import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { BookingV2TrustStrip } from './BookingV2TrustStrip'

const originalUiV2Env = process.env.NEXT_PUBLIC_UI_V2

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('BookingV2TrustStrip', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
  })

  afterEach(() => {
    setUiV2Cookie(false)
    cleanup()
  })

  afterAll(() => {
    if (originalUiV2Env === undefined) {
      delete process.env.NEXT_PUBLIC_UI_V2
    } else {
      process.env.NEXT_PUBLIC_UI_V2 = originalUiV2Env
    }
  })

  it('renders nothing when the ui-v2 flag is off', () => {
    setUiV2Cookie(false)
    const { container } = render(<BookingV2TrustStrip step={1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing on the success step (3) even when v2 is on', () => {
    const { container } = render(<BookingV2TrustStrip step={3} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the trust strip wrapper with the v2 data attribute on step 1', () => {
    render(<BookingV2TrustStrip step={1} />)
    const strip = screen.getByTestId('booking-v2-trust-strip')
    expect(strip).toHaveAttribute('data-ui-version', 'v2')
  })

  it('renders all three trust chips on step 2', () => {
    render(<BookingV2TrustStrip step={2} />)
    expect(screen.getByText(/iap verified provider/i)).toBeInTheDocument()
    expect(screen.getByText(/gst-invoiced/i)).toBeInTheDocument()
    expect(screen.getByText(/encrypted upi \/ card/i)).toBeInTheDocument()
  })

  it('swaps the provider chip label when providerVerified is false', () => {
    render(<BookingV2TrustStrip step={1} providerVerified={false} />)
    expect(screen.getByText(/provider in review/i)).toBeInTheDocument()
    expect(screen.queryByText(/iap verified provider/i)).toBeNull()
  })

  it('renders the median booking caption with the supplied seconds', () => {
    render(<BookingV2TrustStrip step={1} medianBookingSeconds={42} />)
    expect(screen.getByText(/avg booking 42s/i)).toBeInTheDocument()
  })

  it('uses the default median (58s) when none is provided', () => {
    render(<BookingV2TrustStrip step={1} />)
    expect(screen.getByText(/avg booking 58s/i)).toBeInTheDocument()
  })

  it('renders a TrendDelta chip showing the booking-time delta (inverse)', () => {
    // Negative delta with `inverse` is semantically good → emerald colour.
    const { container } = render(<BookingV2TrustStrip step={1} deltaPct={-18} />)
    expect(container.textContent).toMatch(/-?18%/)
    const deltaChip = container.querySelector('.text-emerald-700')
    expect(deltaChip).not.toBeNull()
  })
})
