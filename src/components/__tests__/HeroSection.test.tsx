import { fireEvent, render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HeroSection from '../HeroSection'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('HeroSection', () => {
  beforeEach(() => {
    pushMock.mockReset()
  })

  it('renders the search bar with specialty and city fields', () => {
    render(<HeroSection />)
    expect(screen.getByPlaceholderText(/Orthopaedic, Sports, Neuro/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/Mumbai, Surat, Delhi/i)).toBeDefined()
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
  })

  it('does not render the removed specialty chip rail', () => {
    render(<HeroSection />)
    // The old "Browse common conditions" chip rail should be gone — the hero
    // now lets users pick a specialty via the search combobox only.
    expect(screen.queryByRole('group', { name: /browse common conditions/i })).toBeNull()
  })

  it('submits specialty and city from the hero search form', () => {
    render(<HeroSection />)

    fireEvent.change(screen.getByRole('combobox', { name: /specialty/i }), {
      target: { value: 'Orthopaedic' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: /city/i }), {
      target: { value: 'Mumbai, Maharashtra' },
    })
    fireEvent.click(screen.getByRole('button', { name: /find care/i }))

    expect(pushMock).toHaveBeenCalledWith(
      '/search?specialty=Orthopaedic&city=Mumbai',
    )
  })
})
