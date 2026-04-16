import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'
import { Breadcrumbs } from './Breadcrumbs'
import { Sparkline } from './Sparkline'
import { TrendDelta } from './TrendDelta'

describe('Sparkline', () => {
  it('renders an SVG when values are provided', () => {
    const { container } = render(<Sparkline role="provider" values={[1, 4, 2, 6, 3]} ariaLabel="7-day trend" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('aria-label')).toBe('7-day trend')
  })

  it('renders an empty placeholder svg with intrinsic dimensions when values are empty', () => {
    const { container } = render(<Sparkline values={[]} width={120} height={40} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('width')).toBe('120')
    expect(svg?.getAttribute('height')).toBe('40')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.querySelector('path')).toBeNull()
  })
})

describe('TrendDelta', () => {
  it('shows a positive delta with plus sign', () => {
    render(<TrendDelta value={12} />)
    expect(screen.getByText(/\+12%/)).toBeInTheDocument()
  })

  it('renders zero as flat', () => {
    render(<TrendDelta value={0} />)
    expect(screen.getByText(/0%/)).toBeInTheDocument()
  })

  it('respects the inverse flag (down is good)', () => {
    const { container } = render(<TrendDelta value={-5} inverse />)
    expect(container.firstChild).toHaveClass('text-emerald-700')
  })
})

describe('Badge', () => {
  it('renders children with uppercase label', () => {
    render(<Badge role="provider">Verified</Badge>)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })
})

describe('Breadcrumbs', () => {
  it('renders links for non-final crumbs and marks the last crumb as current', () => {
    render(
      <Breadcrumbs
        role="patient"
        items={[
          { label: 'Home', href: '/patient/dashboard' },
          { label: 'Records' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/patient/dashboard')
    const last = screen.getByText('Records')
    expect(last).toBeInTheDocument()
    expect(last).toHaveClass('font-bold')
    expect(last).toHaveAttribute('aria-current', 'page')
  })

  it('returns null on empty items', () => {
    const { container } = render(<Breadcrumbs items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
