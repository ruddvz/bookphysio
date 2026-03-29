import { describe, it, expect } from 'vitest'
import tailwindConfig from '../../tailwind.config'

// Cast to access custom color keys not in Tailwind's generic Config type
const colors = tailwindConfig.theme?.extend?.colors as Record<string, string> | undefined

describe('Design tokens', () => {
  it('has primary teal color', () => {
    expect(colors?.['bp-primary']).toBe('#00766C')
  })
  it('has accent orange color', () => {
    expect(colors?.['bp-accent']).toBe('#FF6B35')
  })
})
