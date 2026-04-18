import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { CityV2TrustChips } from './CityV2TrustChips'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('CityV2TrustChips', () => {
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
    const { container } = render(<CityV2TrustChips cityLabel="Mumbai" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the trust chip wrapper with the v2 data attribute when ui-v2 is on', () => {
    render(<CityV2TrustChips cityLabel="Mumbai" />)
    const chips = screen.getByTestId('city-v2-trust-chips')
    expect(chips).toHaveAttribute('data-ui-version', 'v2')
  })

  it('renders the three credential chips', () => {
    render(<CityV2TrustChips cityLabel="Mumbai" />)
    expect(screen.getByText(/iap verified/i)).toBeInTheDocument()
    expect(screen.getByText(/clinic \+ home visits/i)).toBeInTheDocument()
    expect(screen.getByText(/transparent ₹ pricing/i)).toBeInTheDocument()
  })

  it('renders the "Bookings this week" caption', () => {
    render(<CityV2TrustChips cityLabel="Mumbai" />)
    expect(screen.getByText(/bookings this week/i)).toBeInTheDocument()
  })

  it('renders a demand sparkline with a city-aware accessible label', () => {
    const { container } = render(
      <CityV2TrustChips cityLabel="Bangalore" demandValues={[5, 9, 12, 18, 20, 25, 28]} />,
    )
    expect(container.querySelector('svg')).not.toBeNull()
    expect(
      screen.getByRole('img', { name: /bangalore weekly booking demand/i }),
    ).toBeInTheDocument()
  })

  it('accepts a custom demandValues array without throwing', () => {
    expect(() =>
      render(
        <CityV2TrustChips cityLabel="Delhi" demandValues={[1, 2, 3, 4, 5, 6, 7]} />,
      ),
    ).not.toThrow()
  })

  it('uses the default demand values when none are provided', () => {
    render(<CityV2TrustChips cityLabel="Pune" />)
    expect(
      screen.getByRole('img', { name: /pune weekly booking demand/i }),
    ).toBeInTheDocument()
  })
})
