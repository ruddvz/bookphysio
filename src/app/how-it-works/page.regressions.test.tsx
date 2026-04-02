import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metadata } from './layout'
import HowItWorksPage from './page'

vi.mock('@/components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}))

vi.mock('@/components/Footer', () => ({
  default: () => <div>Footer</div>,
}))

describe('How It Works page regressions', () => {
  it('renders a compact hero with a top CTA and patient flow by default', () => {
    render(<HowItWorksPage />)

    expect(screen.getByRole('heading', { name: /simple, fast, transparent/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start searching/i })).toHaveAttribute('href', '/search')
    expect(screen.getByText(/Book a physio session in 4 clear steps/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /choose provider/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /register practice/i })).not.toBeInTheDocument()
  })

  it('switches to the provider flow and keeps the provider CTA adjacent to the content', () => {
    render(<HowItWorksPage />)

    fireEvent.click(screen.getByRole('button', { name: /for physiotherapists/i }))

    expect(screen.getByRole('heading', { name: /register practice/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /choose provider/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /join as a physiotherapist/i })).toHaveAttribute('href', '/doctor-signup')
    expect(screen.getByRole('link', { name: /list your practice now/i })).toHaveAttribute('href', '/doctor-signup')
    expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument()
  })

  it('exports route metadata for the standalone page', () => {
    expect(metadata.title).toBe('How BookPhysio Works')
    expect(metadata.alternates).toEqual({ canonical: '/how-it-works' })
  })
})