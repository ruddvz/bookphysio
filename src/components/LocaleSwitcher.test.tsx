import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LocaleSwitcher } from './LocaleSwitcher'

describe('LocaleSwitcher', () => {
  it('links between English and Hindi versions of a static page and marks the active locale', () => {
    render(<LocaleSwitcher locale="hi" path="/about" />)

    const englishLink = screen.getByRole('link', { name: 'English' })
    const hindiLink = screen.getByRole('link', { name: 'हिंदी' })

    expect(englishLink).toHaveAttribute('href', '/about')
    expect(englishLink).not.toHaveAttribute('aria-current')

    expect(hindiLink).toHaveAttribute('href', '/hi/about')
    expect(hindiLink).toHaveAttribute('aria-current', 'page')
    expect(hindiLink).toHaveAttribute('hrefLang', 'hi')
  })
})