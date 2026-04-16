import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { SpecialtyCTARail } from './SpecialtyCTARail'

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('SpecialtyCTARail', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
  })

  afterEach(() => {
    setUiV2Cookie(false)
    cleanup()
  })

  it('renders nothing when the ui-v2 flag is off', () => {
    setUiV2Cookie(false)
    const { container } = render(
      <SpecialtyCTARail specialtyLabel="Orthopaedic Physiotherapy" bookingHref="/search?specialty=orthopaedic" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the primary CTA pointing to the booking href when ui-v2 is on', () => {
    render(
      <SpecialtyCTARail specialtyLabel="Orthopaedic Physiotherapy" bookingHref="/search?specialty=orthopaedic" />,
    )
    const link = screen.getByRole('link', { name: /book a orthopaedic physiotherapy session/i })
    expect(link).toHaveAttribute('href', '/search?specialty=orthopaedic')
  })

  it('renders the credential assurance chip', () => {
    render(
      <SpecialtyCTARail specialtyLabel="Neurological Physiotherapy" bookingHref="/search?specialty=neurological" />,
    )
    expect(screen.getByText(/ncahp verified/i)).toBeInTheDocument()
  })

  it('renders a demand sparkline with an accessible label', () => {
    const { container } = render(
      <SpecialtyCTARail
        specialtyLabel="Sports Physiotherapy"
        bookingHref="/search?specialty=sports"
        demandValues={[12, 14, 13, 18, 22, 25, 28]}
      />,
    )
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('img', { name: /demand trend/i })).toBeInTheDocument()
  })

  it('renders a tel: secondary action when advisorPhone is provided', () => {
    render(
      <SpecialtyCTARail
        specialtyLabel="Sports Physiotherapy"
        bookingHref="/search?specialty=sports"
        advisorPhone="+919000000000"
      />,
    )
    const call = screen.getByRole('link', { name: /talk to an advisor/i })
    expect(call).toHaveAttribute('href', 'tel:+919000000000')
  })
})
