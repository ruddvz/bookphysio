import type { ImgHTMLAttributes } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FAQ from './FAQ'
import Footer from './Footer'
import HeroSection from './HeroSection'
import Navbar from './Navbar'
import ProofSection from './ProofSection'
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
        <TopSpecialties />
        <ProofSection />
        <FAQ />
      </>
    )

    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /browse by specialty/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /network transparency/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /frequently asked questions/i })).toBeInTheDocument()
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

  it('replaces internal design-note copy with patient-facing homepage copy', () => {
    const { container } = render(
      <>
        <FAQ />
        <ProofSection />
      </>
    )

    expect(screen.getByText(/Before you book, here is what people usually want to know/i)).toBeInTheDocument()
    expect(screen.getByText('Can I cancel or reschedule a session?')).toBeInTheDocument()

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
    const closedAnswer = document.getElementById('faq-a-2')

    expect(openQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(openQuestion).toHaveAttribute('aria-controls', 'faq-a-1')
    expect(closedQuestion).toHaveAttribute('aria-expanded', 'false')
    expect(closedQuestion).toHaveAttribute('aria-controls', 'faq-a-2')
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
    const mobileMenu = screen.getByText('Specialties').closest('nav')
    expect(within(mobileMenu as HTMLElement).getByRole('link', { name: /for providers/i })).toHaveAttribute('href', '/doctor-signup')

    expect(container.firstChild).toHaveClass('bg-transparent')
    expect(container.firstChild).toHaveClass('fixed')

    rerender(<Footer />)
    expect(screen.queryByRole('link', { name: /start searching/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /join as provider/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Verified providers')).not.toBeInTheDocument()
    expect(screen.queryByText('Home visits')).not.toBeInTheDocument()
    expect(screen.getByText(/bookphysio is a booking platform/i)).toBeInTheDocument()
  })
})
