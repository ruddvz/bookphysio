import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import HeroSection from '../HeroSection'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('HeroSection', () => {
  it('renders the search bar', () => {
    const { getByPlaceholderText } = render(<HeroSection />)
    // getByPlaceholderText throws if not found — no assertion needed; call itself is the assertion
    expect(getByPlaceholderText('e.g. Back pain, Sports injury...')).toBeDefined()
  })

  it('section[aria-label="Hero section"] renders correctly', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('section[aria-label="Hero section"]')
    expect(section).toBeTruthy()
    expect(section?.className).toContain('min-h-[100svh]')
  })

  it('bp-container div exists inside the hero section', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('section[aria-label="Hero section"]')
    const shell = section?.querySelector('.bp-container')
    expect(shell).toBeTruthy()
    expect(shell?.className).not.toContain('calc(100vh')
  })

  it('renders h1 heading inside the hero section', () => {
    const { container } = render(<HeroSection />)
    const h1 = container.querySelector('h1')
    expect(h1).toBeTruthy()
    // Confirm old multi-breakpoint font classes are absent (replaced by clamp-based utility)
    expect(h1?.className).not.toContain('text-[54px]')
    expect(h1?.className).not.toContain('md:text-[82px]')
  })

  it('renders a three-row marquee condition strip with plain-language options', () => {
    render(<HeroSection />)

    const strip = screen.getByRole('group', { name: /browse common conditions/i })

    // 3 overflow-hidden row wrappers (original + duplicate chips are inside each wrapper)
    expect(strip.querySelectorAll('[data-chip-row]')).toHaveLength(3)

    // Only 21 buttons should be accessible (duplicate set is aria-hidden="true")
    expect(within(strip).getAllByRole('button')).toHaveLength(21)
    expect(within(strip).getByRole('button', { name: 'Back pain' })).toBeInTheDocument()
    expect(within(strip).getByRole('button', { name: 'Home visit' })).toBeInTheDocument()
    expect(within(strip).getByRole('button', { name: 'Stroke recovery' })).toBeInTheDocument()
  })

  it('navigates to search with the selected chip condition', () => {
    render(<HeroSection />)

    const strip = screen.getByRole('group', { name: /browse common conditions/i })
    fireEvent.click(within(strip).getByRole('button', { name: 'Back pain' }))

    expect(pushMock).toHaveBeenCalledWith('/search?condition=Back+pain')
  })

  it('submits both condition and location from the hero search form', () => {
    render(<HeroSection />)

    fireEvent.change(screen.getByRole('combobox', { name: /condition/i }), {
      target: { value: 'Back pain' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /location/i }), {
      target: { value: 'Mumbai' },
    })
    fireEvent.click(screen.getByRole('button', { name: /find care/i }))

    expect(pushMock).toHaveBeenCalledWith('/search?condition=Back+pain&location=Mumbai')
  })
})
