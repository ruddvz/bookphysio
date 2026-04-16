import type { ImgHTMLAttributes } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FAQ from './FAQ'
import Footer from './Footer'
import HeroSection from './HeroSection'
import Navbar from './Navbar'
import ProofSection from './ProofSection'
import TopSpecialties from './TopSpecialties'
import WhereWeOperate from './WhereWeOperate'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ alt = '', fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

describe('Homepage regressions', () => {
  it('renders named homepage regions for assistive tech', () => {
    render(
      <>
        <HeroSection />
        <TopSpecialties />
        <ProofSection />
        <FAQ />
        <WhereWeOperate />
      </>
    )

    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /browse by specialty/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /real availability across providers/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /frequently asked questions/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /cities we operate in/i })).toBeInTheDocument()
  }, 15000)

  it('keeps the hero above the fold and leaves trust stats readable', () => {
    render(<HeroSection />)

    const hero = screen.getByRole('region', { name: /hero section/i })
    const shell = hero.querySelector('.bp-container')
    const statsRow = screen.getByText('IAP').closest('div')?.parentElement

    expect(hero.className).toContain('min-h-[100svh]')
    expect(hero.className).toContain('justify-center')
    expect(shell).toBeTruthy()
    expect(shell?.className).not.toContain('calc(100vh')
    expect(statsRow?.className).not.toContain('grayscale')
    expect(statsRow?.className).not.toContain('opacity-70')
  })

  it('removes the hero specialty chip rail', () => {
    render(<HeroSection />)
    // The redesign removed the chips above the search bar in favour of a
    // cleaner hero that lets the combobox carry the specialty affordance.
    expect(screen.queryByRole('group', { name: /browse common conditions/i })).toBeNull()
  })

  it('renders the redesigned FAQ as a sticky-nav two-column layout', () => {
    render(<FAQ />)

    // New design: category nav + always-visible rich answers (not accordion).
    expect(screen.getByRole('navigation', { name: /faq categories/i })).toBeInTheDocument()
    expect(screen.getByText(/Before you book, here is what people usually want to know/i)).toBeInTheDocument()

    // All four category headings are visible on mount — no collapsed accordions.
    expect(screen.getByRole('heading', { level: 3, name: /booking/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /payments/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /providers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /privacy/i })).toBeInTheDocument()

    // A representative question is rendered as an h4, not as a disclosure button.
    expect(screen.getByRole('heading', { level: 4, name: /can i book a home visit/i })).toBeInTheDocument()
  })

  it('ships the "Still stuck?" support CTA at the bottom of the FAQ', () => {
    render(<FAQ />)
    expect(screen.getByText(/still stuck\?/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /talk to us/i })).toHaveAttribute('href', '/contact')
  })

  it('matches navbar and footer regressions across mobile and desktop chrome', () => {
    const { rerender, container } = render(<Navbar />)

    const brandLink = within(screen.getByRole('banner')).getByRole('link', { name: /bookphysio home/i })
    expect(within(brandLink).getByRole('img', { name: 'BookPhysio.in' })).toBeInTheDocument()
    expect(brandLink.querySelector('img[alt="BookPhysio.in"]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }))
    const mobileMenu = screen.getByText('Specialties').closest('nav')
    expect(within(mobileMenu as HTMLElement).getByRole('link', { name: /for providers/i })).toHaveAttribute('href', '/doctor-signup')

    expect(container.firstChild).toHaveClass('bg-transparent')
    expect(container.firstChild).toHaveClass('fixed')

    rerender(<Footer />)
    // Footer should now use the near-black palette instead of the old purple-navy.
    const footer = container.querySelector('footer')
    expect(footer?.className).toContain('bg-[#0B0B0F]')
    expect(footer?.className).not.toContain('bg-[#1C1A3B]')
    expect(screen.getByText(/bookphysio is a booking platform/i)).toBeInTheDocument()
  })
})
