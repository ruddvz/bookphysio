import { render, screen, within } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import HeroSection from '../HeroSection'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
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

  it('renders a three-row honeycomb condition strip with plain-language options', () => {
    render(<HeroSection />)

    const strip = screen.getByRole('group', { name: /browse common conditions/i })

    expect(strip.querySelectorAll('[data-chip-row]')).toHaveLength(3)
    expect(within(strip).getAllByRole('button')).toHaveLength(21)
    expect(within(strip).getByRole('button', { name: 'Back pain' })).toBeInTheDocument()
    expect(within(strip).getByRole('button', { name: 'Home visit' })).toBeInTheDocument()
    expect(within(strip).getByRole('button', { name: 'Stroke recovery' })).toBeInTheDocument()
  })
})
