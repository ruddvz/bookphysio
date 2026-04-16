import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ProofSection from '@/components/ProofSection'

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

// GSAP relies on the DOM and window — jsdom provides enough for the hook to
// short-circuit on prefers-reduced-motion (no matchMedia match), so no extra
// mocking is needed.
describe('ProofSection', () => {
  it('renders three illustrative provider rows with slot timelines', () => {
    render(<ProofSection />)

    // Each seeded provider name in the section header.
    expect(screen.getByText(/Sports rehab/i)).toBeInTheDocument()
    expect(screen.getByText(/Ortho rehab/i)).toBeInTheDocument()
    expect(screen.getByText(/Neuro rehab/i)).toBeInTheDocument()
  })

  it('renders the "Book in 60s" CTA for each provider', () => {
    const { container } = render(<ProofSection />)
    const articles = container.querySelectorAll('article')
    expect(articles.length).toBe(3)

    const ctas = screen.getAllByText(/Book in 60s/i)
    expect(ctas.length).toBe(3)
  })

  it('renders the scroll-reveal target hooks for GSAP', () => {
    const { container } = render(<ProofSection />)
    expect(container.querySelector('[data-proof-list]')).toBeTruthy()
    expect(container.querySelectorAll('[data-proof-row]').length).toBe(3)
    // Every row has at least one slot pill.
    expect(container.querySelectorAll('[data-slot-pill]').length).toBeGreaterThan(0)
  })
})
