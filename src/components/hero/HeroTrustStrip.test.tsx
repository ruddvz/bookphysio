import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { HeroTrustStrip } from './HeroTrustStrip'

describe('HeroTrustStrip', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the default label and a sparkline when no props are provided', () => {
    const { container } = render(<HeroTrustStrip />)
    expect(screen.getByText(/bookings this week/i)).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders the provided headline count with thousands separator', () => {
    render(<HeroTrustStrip total={1248} />)
    expect(screen.getByText('1,248')).toBeInTheDocument()
  })

  it('renders the trend delta when provided', () => {
    render(<HeroTrustStrip delta={8} />)
    expect(screen.getByText(/\+8%/)).toBeInTheDocument()
  })

  it('omits the delta chip when delta is undefined', () => {
    render(<HeroTrustStrip />)
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('renders a custom label when provided', () => {
    render(<HeroTrustStrip label="Sessions booked today" />)
    expect(screen.getByText('Sessions booked today')).toBeInTheDocument()
  })

  it('renders an accessible sparkline description', () => {
    render(<HeroTrustStrip values={[1, 2, 3, 4, 5]} />)
    const svg = screen.getByRole('img', { name: /trend/i })
    expect(svg).toBeInTheDocument()
  })
})
