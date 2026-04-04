import type { ImgHTMLAttributes } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FAQ from './FAQ'
import Footer from './Footer'
import HealthSystems from './HealthSystems'
import HeroSection from './HeroSection'
import HowItWorks from './HowItWorks'
import Navbar from './Navbar'
import ProofSection from './ProofSection'
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
  it('renders named homepage regions for assistive tech', () => {
    render(
      <>
        <HeroSection />
        <ProofSection />
        <TopSpecialties />
        <HowItWorks />
        <HealthSystems />
        <Testimonials />
        <FAQ />
      </>
    )

    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /network transparency/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /browse by specialty/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /how booking works/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /patient trust signals/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /patient testimonials/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /booking questions/i })).toBeInTheDocument()
  })

  it('keeps the hero above the fold and leaves trust stats readable', () => {
    render(<HeroSection />)

    const hero = screen.getByRole('region', { name: /hero/i })
    const shell = hero.querySelector('.bp-shell')
    const animatedWordFrame = screen.getByText('sports rehab').parentElement
    const statsRow = screen.getByText('5,000+').closest('div')?.parentElement

    expect(shell?.className).toContain('min-h-[100svh]')
    expect(shell?.className).not.toContain('calc(100vh-5rem)')
    expect(shell?.className).toContain('justify-center')
    expect(animatedWordFrame?.className).toContain('align-baseline')
    expect(animatedWordFrame?.className).not.toContain('align-top')
    expect(statsRow?.className).not.toContain('grayscale')
    expect(statsRow?.className).not.toContain('opacity-70')
  })

  it('replaces internal design-note copy with patient-facing homepage copy', () => {
    const { container } = render(
      <>
        <FAQ />
        <HowItWorks />
        <TopSpecialties />
        <HealthSystems />
        <Testimonials />
      </>
    )

    expect(screen.getByText('Everything you need to know before booking your first session.')).toBeInTheDocument()
    expect(screen.getByText('Find a verified physiotherapist, check their availability, and book your session in under 60 seconds.')).toBeInTheDocument()
    expect(screen.getByText("Choose your care category and we'll surface verified physiotherapists in your city.")).toBeInTheDocument()
    expect(screen.getByText('Every detail patients need to feel confident - credentials, visit format, fees, and availability - shown upfront.')).toBeInTheDocument()
    expect(screen.getByText('Real patients. Real results. Every review is tied to a verified booking.')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel a session?')).toBeInTheDocument()

    expect(container).not.toHaveTextContent('The FAQ should feel like part of the product, not a legal appendix.')
    expect(container).not.toHaveTextContent('Search, compare, and confirm should feel like one continuous action.')
    expect(container).not.toHaveTextContent('The homepage should narrow the decision fast: choose a care lane first')
    expect(container).not.toHaveTextContent('The home page needs a clear proof layer after the hero')
    expect(container).not.toHaveTextContent('The tone should stay human and credible.')
  })

  it('makes FAQ disclosure state explicit and fully hides collapsed answers', () => {
    render(<FAQ />)

    const openQuestion = screen.getByRole('button', { name: /how do you verify physiotherapists/i })
    const closedQuestion = screen.getByRole('button', { name: /can i book a home visit/i })
    const closedAnswer = document.getElementById('faq-answer-2')

    expect(openQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(openQuestion).toHaveAttribute('aria-controls', 'faq-answer-1')
    expect(closedQuestion).toHaveAttribute('aria-expanded', 'false')
    expect(closedQuestion).toHaveAttribute('aria-controls', 'faq-answer-2')
    expect(closedAnswer).toHaveAttribute('aria-hidden', 'true')
    expect(closedAnswer?.className).toContain('grid-rows-[0fr]')
    expect(closedAnswer?.firstElementChild?.className).toContain('pb-0')
  })

  it('matches navbar and footer regressions across mobile and desktop chrome', () => {
    const { rerender, container } = render(<Navbar />)

    const brandLink = within(screen.getByRole('banner')).getByRole('link', { name: /bookphysio home/i })
    expect(within(brandLink).getByRole('img', { name: 'BookPhysio.in' })).toBeInTheDocument()
    expect(brandLink.querySelector('img[alt="BookPhysio.in"]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }))
    const mobileMenu = screen.getByText('Browse Specialties').closest('nav')
    expect(within(mobileMenu as HTMLElement).getByRole('link', { name: /for providers/i })).toHaveAttribute('href', '/doctor-signup')

    expect(container.firstChild).toHaveClass('bg-[#fffaf4]/90')

    rerender(<Footer />)
    const footerCta = screen.getByRole('link', { name: /start searching/i })
    expect(footerCta.className).toContain('hover:bg-white')
    expect(footerCta.className).not.toContain('hover:bg-[#f7efe5]')
  })

  it('keeps specialty, workflow, and testimonial polish aligned with the audit', () => {
    const { container: specialties } = render(<TopSpecialties />)

    for (const cta of screen.getAllByText('Explore specialists')) {
      expect(cta.className).toContain('text-[#0b5c52]')
    }

    expect(specialties.querySelectorAll('.lucide-arrow-right')).toHaveLength(6)

    const { container: workflow } = render(<HowItWorks />)
    expect(workflow.querySelector('.lucide-sliders-horizontal')).toBeInTheDocument()
    expect(workflow.querySelector('.lucide-star')).not.toBeInTheDocument()

    render(<Testimonials />)
    expect(screen.getByText('AM')).toBeInTheDocument()
    expect(screen.getByText('SK')).toBeInTheDocument()
    expect(screen.getByText('VS')).toBeInTheDocument()
  })
})