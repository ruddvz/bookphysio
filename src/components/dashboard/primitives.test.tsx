import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from './primitives'

describe('PageHeader', () => {
  it('renders the optional kicker above the title', () => {
    render(
      <PageHeader
        role="patient"
        kicker="YOUR HEALTH"
        title="Dashboard"
        subtitle="Care at a glance"
      />
    )

    expect(screen.getByText('YOUR HEALTH')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Care at a glance')).toBeInTheDocument()
  })
})