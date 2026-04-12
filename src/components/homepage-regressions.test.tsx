import type { ImgHTMLAttributes } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CityLinks from './CityLinks'
import FAQ from './FAQ'
import Footer from './Footer'
import HealthSystems from './HealthSystems'
import HeroSection from './HeroSection'
import HowItWorks from './HowItWorks'
import Navbar from './Navbar'
import ProofSection from './ProofSection'
import ProviderCTA from './ProviderCTA'
import Testimonials from './Testimonials'
import TopSpecialties from './TopSpecialties'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ alt = '', fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

describe('Homepage regressions', () => {
  it('renders the merged homepage stack with named regions for assistive tech', () => {
    render(
      <>
        <HeroSection />
        <TopSpecialties />
        <ProofSection />
        <HowItWorks />
        <HealthSystems />
        <ProviderCTA />
        <Testimonials />
        <FAQ />
        <CityLinks />
      </>
    )

    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /browse by specialty/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /network transparency/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /how booking works/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /platform trust signals/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /for providers/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /platform promises/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /frequently asked questions/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /browse physiotherapists by city/i })).toBeInTheDocument()
  }, 15000)

  it('keeps the hero above the fold and leaves trust stats readable', () => {
    render(<HeroSection />)

    const hero = screen.getByRole('region', { name: /hero section/i })
    const shell = hero.querySelector('.bp-container')
    const animatedWordFrame = screen.getByText(/sports rehab/i).parentElement
    const statsRow = screen.getByText('IAP').closest('div')?.parentElement

    expect(hero.className).toContain('min-h-[100svh]')
    expect(hero.className).toContain('justify-center')
    expect(shell).toBeTruthy()
    expect(shell?.className).not.toContain('calc(100vh')
    expect(animatedWordFrame?.className).toContain('items-end')
    expect(statsRow?.className).not.toContain('grayscale')
    expect(statsRow?.className).not.toContain('opacity-70')
  })

  it('keeps merged homepage section copy and token-driven kickers intact', () => {
    render(
      <>
        <HowItWorks />
        <HealthSystems />
        <ProviderCTA />
        <Testimonials />
        <FAQ />
        <CityLinks />
      </>
    )

    const howItWorksKicker = screen.getByText(/^How it works$/i).closest('.bp-kicker')
    const providerKicker = screen.getByText(/for physiotherapists/i).closest('.bp-kicker')
    const testimonialsKicker = screen.getByText(/what to expect/i).closest('.bp-kicker')
    const cityKicker = screen.getByText(/find care nearby/i).closest('.bp-kicker')

    expect(screen.getByText(/four steps from search to session/i)).toBeInTheDocument()
    expect(screen.getByText(/everything you need/i)).toBeInTheDocument()
    expect(screen.getByText(/straightforward, start to finish/i)).toBeInTheDocument()
    expect(screen.getByText(/physiotherapists by city/i)).toBeInTheDocument()
    expect(screen.getByText(/can i cancel or reschedule a session/i)).toBeInTheDocument()
    expect(howItWorksKicker).not.toHaveAttribute('style')
    expect(providerKicker).not.toHaveAttribute('style')
    expect(testimonialsKicker).not.toHaveAttribute('style')
    expect(cityKicker).not.toHaveAttribute('style')
  })

  it('uses the reviewed FAQ CTA, accurate stars, and mobile nav links', () => {
    const { rerender, container } = render(
      <>
        <ProofSection />
        <FAQ />
      </>
    )

    const faqCta = screen.getByRole('link', { name: /browse providers/i })
    const ratingRow = screen.getByText('4.9').parentElement
    const proofImage = container.querySelector('img[src="/images/physio-female.png"]')

    expect(faqCta.className).toContain('bg-[#FF6B35]')
    expect(faqCta.className).toContain('rounded-full')
    expect(ratingRow?.querySelectorAll('.text-amber-400')).toHaveLength(4)
    expect(ratingRow?.querySelectorAll('.text-slate-200')).toHaveLength(1)
    expect(proofImage).toHaveAttribute('sizes', '180px')

    rerender(<Navbar />)
    const brandLink = within(screen.getByRole('banner')).getByRole('link', { name: /bookphysio home/i })
    expect(within(brandLink).getByRole('img', { name: 'BookPhysio.in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /specialties/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }))
    const mobileMenu = screen.getByRole('navigation', { name: /mobile navigation/i })
    expect(within(mobileMenu).getByRole('link', { name: /for providers/i })).toHaveAttribute('href', '/doctor-signup')
  })

  it('keeps footer chrome minimal when rendered alone', () => {
    render(<Footer />)

    expect(screen.queryByRole('link', { name: /start searching/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /join as provider/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Verified providers')).not.toBeInTheDocument()
    expect(screen.queryByText('Home visits')).not.toBeInTheDocument()
    expect(screen.getByText(/bookphysio is a booking platform/i)).toBeInTheDocument()
  })
})
