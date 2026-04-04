import { render } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import HeroSection from '../HeroSection'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('HeroSection', () => {
  it('renders the search bar', () => {
    const { getByPlaceholderText } = render(<HeroSection />)
    expect(getByPlaceholderText('Search by condition or injury')).toBeTruthy()
  })

  it('does not have overflow-hidden on the outer section', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('section[aria-label="Hero"]')
    expect(section?.className).not.toContain('overflow-hidden')
  })

  it('uses min-h-[100svh] not calc(100vh-5rem)', () => {
    const { container } = render(<HeroSection />)
    const shell = container.querySelector('.bp-shell')
    expect(shell?.className).toContain('min-h-[100svh]')
    expect(shell?.className).not.toContain('calc(100vh')
  })
})
