import type { ImgHTMLAttributes } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BpLogo from './BpLogo'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ alt = '', fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

describe('BpLogo', () => {
  it('renders the wordmark logo image', () => {
    render(<BpLogo />)
    expect(screen.getByRole('img', { name: 'BookPhysio.in' })).toHaveAttribute('src', '/logo.png')
  })

  it('renders as a link when href is provided', () => {
    render(<BpLogo href="/" linkClassName="mx-auto" />)
    const link = screen.getByRole('link', { name: /bookphysio home/i })
    expect(link).toHaveAttribute('href', '/')
    expect(link.className).toContain('mx-auto')
  })

  it('applies invert style for dark backgrounds', () => {
    render(<BpLogo invert />)
    const img = screen.getByRole('img', { name: 'BookPhysio.in' })
    expect(img.className).toContain('invert')
  })
})