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
  it('renders the shared auth-sized logo frame by default', () => {
    render(<BpLogo />)

    const image = screen.getByAltText('BookPhysio')
    const frame = image.parentElement

    expect(image).toHaveAttribute('src', '/logo.png')
    expect(frame?.className).toContain('h-[36px]')
    expect(frame?.className).toContain('w-[144px]')
  })

  it('can render as a homepage link with custom sizing', () => {
    render(<BpLogo href="/" frameClassName="h-[35px] w-[140px]" />)

    const image = screen.getByAltText('BookPhysio')
    expect(image.closest('a')).toHaveAttribute('href', '/')
    expect(image.parentElement?.className).toContain('h-[35px]')
    expect(image.parentElement?.className).toContain('w-[140px]')
  })
})