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
  it('renders the patient flow by default with explicit tab semantics', () => {
    render(<HowItWorksPage />)

    expect(screen.getByRole('tablist', { name: /how it works audience/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /for patients/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /for providers/i })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('heading', { name: /how to book a physiotherapist online in india/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start searching/i })).toHaveAttribute('href', '/search')
    expect(screen.getByText(/Book a physio session in 4 clear steps/i)).toBeInTheDocument()
    expect(document.getElementById('panel-patient')).not.toHaveAttribute('hidden')
    expect(document.getElementById('panel-provider')).toHaveAttribute('hidden')
    expect(screen.getByRole('heading', { name: /choose provider/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /register practice/i })).not.toBeInTheDocument()
  })

  it('switches to the provider flow, updates the hero copy, and keeps the provider CTA adjacent to the content', () => {
    render(<HowItWorksPage />)

    const providerTab = screen.getByRole('tab', { name: /for providers/i })
    fireEvent.click(providerTab)

    expect(providerTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: /how to join bookphysio as a verified provider/i })).toBeInTheDocument()
    expect(screen.getByText(/publish real availability/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /register practice/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /choose provider/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /join as a provider/i })).toHaveAttribute('href', '/doctor-signup')
    expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument()
  })

  it('exports route metadata for the standalone page', () => {
    expect(metadata.title).toBe('How to Book a Physiotherapist Online in India | BookPhysio.in')
    expect(metadata.alternates).toEqual({
      canonical: '/how-it-works',
      languages: {
        'en-IN': '/how-it-works',
        'hi-IN': '/hi/how-it-works',
      },
    })
  })
})
