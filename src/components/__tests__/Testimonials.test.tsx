import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Testimonials from '@/components/Testimonials'

vi.mock('@/lib/gsap-client', () => ({
  ScrollTrigger: {},
  revealOnScroll: vi.fn(),
  useGSAP: vi.fn((callback: () => void) => callback()),
}))

describe('Testimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the current platform promises section', () => {
    render(<Testimonials />)

    expect(screen.getByRole('region', { name: /platform promises/i })).toBeInTheDocument()
    expect(screen.getByText(/straightforward, start to finish/i)).toBeInTheDocument()
    expect(
      screen.getByText((content) =>
        content.includes('We only list physiotherapists') && content.includes('verified ourselves'),
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Verified credentials')).toBeInTheDocument()
    expect(screen.getByText('Clear pricing')).toBeInTheDocument()
    expect(screen.getByText('Clinic or home visit')).toBeInTheDocument()
    expect(screen.getByText(/all providers verified/i)).toBeInTheDocument()
  })
})
