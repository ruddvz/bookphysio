import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ProviderV2TrustStrip } from './ProviderV2TrustStrip'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('ProviderV2TrustStrip', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
  })

  afterEach(() => {
    setUiV2Cookie(false)
    cleanup()
  })

  it('renders nothing when the ui-v2 flag is off', () => {
    setUiV2Cookie(false)
    const { container } = render(
      <ProviderV2TrustStrip bookingHref="#booking-card-section" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the trust strip wrapper with the v2 data attribute when ui-v2 is on', () => {
    render(<ProviderV2TrustStrip bookingHref="#booking-card-section" />)
    const strip = screen.getByTestId('provider-v2-trust-strip')
    expect(strip).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows "IAP verified" when verified is true', () => {
    render(<ProviderV2TrustStrip bookingHref="#booking-card-section" verified />)
    expect(screen.getByText(/iap verified/i)).toBeInTheDocument()
  })

  it('shows "Profile in review" when verified is false or omitted', () => {
    render(<ProviderV2TrustStrip bookingHref="#booking-card-section" />)
    expect(screen.getByText(/profile in review/i)).toBeInTheDocument()
  })

  it('shows the next slot label when one is provided', () => {
    render(
      <ProviderV2TrustStrip
        bookingHref="#booking-card-section"
        nextSlotLabel="Today, 4:30 PM"
      />,
    )
    expect(screen.getByText(/next slot · today, 4:30 pm/i)).toBeInTheDocument()
  })

  it('falls back to "Check availability" when nextSlotLabel is null', () => {
    render(
      <ProviderV2TrustStrip bookingHref="#booking-card-section" nextSlotLabel={null} />,
    )
    expect(screen.getByText(/check availability/i)).toBeInTheDocument()
  })

  it('renders the location when provided and omits it when not', () => {
    const { rerender } = render(
      <ProviderV2TrustStrip bookingHref="#booking-card-section" location="Bandra, Mumbai" />,
    )
    expect(screen.getByText('Bandra, Mumbai')).toBeInTheDocument()

    rerender(<ProviderV2TrustStrip bookingHref="#booking-card-section" />)
    expect(screen.queryByText('Bandra, Mumbai')).toBeNull()
  })

  it('renders the primary "Book in 60s" CTA pointing at bookingHref', () => {
    render(<ProviderV2TrustStrip bookingHref="/book/abc-123" />)
    const cta = screen.getByTestId('provider-v2-book-cta')
    expect(cta).toHaveAttribute('href', '/book/abc-123')
    expect(cta).toHaveTextContent(/book in 60s/i)
  })
})
