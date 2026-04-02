import type { ImgHTMLAttributes } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BpLogo from './BpLogo'

vi.mock('next/image', () => ({
  default: ({ alt = '', priority: _priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img alt={alt} {...props} />
  ),
}))

describe('BpLogo', () => {
  it('renders an icon and brand text', () => {
    render(<BpLogo />)
    expect(screen.getByText('BookPhysio')).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    render(<BpLogo href="/" />)
    const link = screen.getByRole('link', { name: /bookphysio home/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('applies invert style for dark backgrounds', () => {
    render(<BpLogo invert />)
    const text = screen.getByText('BookPhysio')
    expect(text.className).toContain('text-white')
  })
})