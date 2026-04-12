import type { ImgHTMLAttributes } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metadata } from './layout'
import HowItWorksPage from './page'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ alt = '', fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

vi.mock('@/components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}))

vi.mock('@/components/Footer', () => ({
  default: () => <div>Footer</div>,
}))

describe('How It Works page regressions', () => {
  it('renders the patient tab as the default accessible tabpanel', () => {
    render(<HowItWorksPage />)

    const patientTab = screen.getByRole('tab', { name: /for patients/i })
    const providerTab = screen.getByRole('tab', { name: /for physiotherapists/i })
    const panel = screen.getByRole('tabpanel')

    expect(screen.getByRole('heading', { name: /how to book a physiotherapist online in india/i })).toBeInTheDocument()
    expect(screen.getByText(/book a physio session in 4 clear steps/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start searching/i })).toHaveAttribute('href', '/search')
    expect(screen.getByRole('heading', { name: /choose provider/i })).toBeInTheDocument()
    expect(patientTab).toHaveAttribute('aria-selected', 'true')
    expect(providerTab).toHaveAttribute('aria-selected', 'false')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-patient')
  })

  it('switches to the provider flow copy and keeps the tabs wired to the active panel', () => {
    render(<HowItWorksPage />)

    fireEvent.click(screen.getByRole('tab', { name: /for physiotherapists/i }))

    const providerTab = screen.getByRole('tab', { name: /for physiotherapists/i })
    const panel = screen.getByRole('tabpanel')

    expect(screen.getByRole('heading', { name: /how to join bookphysio as a physiotherapist/i })).toBeInTheDocument()
    expect(screen.getByText(/create your verified profile, open your calendar, and start accepting bookings online/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /register practice/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /choose provider/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /join as a provider/i })).toHaveAttribute('href', '/doctor-signup')
    expect(providerTab).toHaveAttribute('aria-selected', 'true')
    expect(providerTab).toHaveAttribute('aria-controls', 'panel-provider')
    expect(panel).toHaveAttribute('id', 'panel-provider')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-provider')
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
