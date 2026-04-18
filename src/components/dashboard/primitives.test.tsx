import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from './primitives'

describe('PageHeader', () => {
  it('keeps the optional kicker in the DOM but visually hidden above the title', () => {
    render(
      <PageHeader
        role="patient"
        kicker="YOUR HEALTH"
        title="Dashboard"
        subtitle="Care at a glance"
      />
    )

    expect(document.querySelector('[data-kicker]')).toHaveClass('sr-only')
    expect(screen.getByText('YOUR HEALTH', { selector: '[data-kicker]' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(document.querySelector('[data-subtitle]')).toHaveClass('sr-only')
    expect(screen.getByText('Care at a glance', { selector: '[data-subtitle]' })).toBeInTheDocument()
  })
})