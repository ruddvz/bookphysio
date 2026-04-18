import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HowItWorksPage from './page'

vi.mock('@/components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}))

vi.mock('@/components/Footer', () => ({
  default: () => <div>Footer</div>,
}))

// The real useUiV2 hook reads from env / cookie / query via useSyncExternalStore.
// We stub it here so each test can flip the flag deterministically.
const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

function setV2(enabled: boolean) {
  useUiV2Mock.mockReturnValue(enabled)
}

describe('HowItWorksPage — v2 (slice 16.13)', () => {
  beforeEach(() => {
    setV2(false)
  })

  afterEach(() => {
    useUiV2Mock.mockReset()
  })

  it('keeps v1 behaviour when the flag is off — no timeline strip, no stats', () => {
    setV2(false)
    render(<HowItWorksPage />)

    expect(screen.queryByTestId('v2-timeline-strip')).toBeNull()
    expect(screen.queryByTestId('v2-cta-footer')).toBeNull()
    expect(screen.queryByTestId('v2-cta-stats')).toBeNull()
    expect(screen.queryByTestId('v2-step-badge-1')).toBeNull()
  })

  it('renders the 4-step timeline strip when v2 is on', () => {
    setV2(true)
    render(<HowItWorksPage />)

    const strip = screen.getByTestId('v2-timeline-strip')
    expect(strip).toHaveAttribute('aria-label', 'Booking progress timeline')
    expect(within(strip).getAllByRole('listitem')).toHaveLength(4)
  })

  it('renders a v2 Badge + progress sparkline on each step card', () => {
    setV2(true)
    render(<HowItWorksPage />)

    // 4 steps → 4 Badges
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByTestId(`v2-step-badge-${i}`)).toBeInTheDocument()
    }

    // Sparkline is accessible via its aria-label on each step
    expect(screen.getByLabelText(/Search progress/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Choose Provider progress/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Pick a Slot progress/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Book Instantly progress/i)).toBeInTheDocument()
  })

  it('switches the timeline labels when the role tab flips to provider', () => {
    setV2(true)
    render(<HowItWorksPage />)

    expect(screen.getByLabelText(/Search progress/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /for providers/i }))

    expect(screen.queryByLabelText(/Search progress/i)).toBeNull()
    expect(screen.getByLabelText(/Register Practice progress/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Set Availability progress/i)).toBeInTheDocument()
  })

  it('renders the v2 CTA footer with role-aware proof stats', () => {
    setV2(true)
    render(<HowItWorksPage />)

    expect(screen.getByTestId('v2-cta-footer')).toBeInTheDocument()
    const stats = screen.getByTestId('v2-cta-stats')
    expect(within(stats).getByText('10,240')).toBeInTheDocument()
    expect(within(stats).getByText(/Patient bookings this month/i)).toBeInTheDocument()
    expect(within(stats).getByText('58 sec')).toBeInTheDocument()
  })

  it('rotates CTA stats to provider-specific proof when the tab flips', () => {
    setV2(true)
    render(<HowItWorksPage />)

    fireEvent.click(screen.getByRole('button', { name: /for providers/i }))

    const stats = screen.getByTestId('v2-cta-stats')
    expect(within(stats).getByText('1,120')).toBeInTheDocument()
    expect(within(stats).getByText(/Providers live on platform/i)).toBeInTheDocument()
    expect(within(stats).getByText('4 days')).toBeInTheDocument()
  })

  it('tags the v2 step cards and CTA with data-ui-version="v2" for CSS targeting', () => {
    setV2(true)
    const { container } = render(<HowItWorksPage />)

    const v2Cards = container.querySelectorAll('[data-hiw-step][data-ui-version="v2"]')
    expect(v2Cards.length).toBe(4)

    const v2Section = container.querySelector('section [data-testid="v2-cta-footer"]')
    expect(v2Section).not.toBeNull()
  })

  it('preserves the primary CTA destinations across v1 and v2', () => {
    setV2(true)
    render(<HowItWorksPage />)

    expect(screen.getByRole('link', { name: /start searching/i })).toHaveAttribute('href', '/search')

    fireEvent.click(screen.getByRole('button', { name: /for providers/i }))
    expect(screen.getByRole('link', { name: /join as a provider/i })).toHaveAttribute('href', '/doctor-signup')
  })
})
