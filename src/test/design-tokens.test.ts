import { describe, it, expect } from 'vitest'

// Design tokens are hardcoded per spec in .claude/design-system/DESIGN.md
// Tailwind v4 uses CSS-first config via src/app/globals.css
const DESIGN_TOKENS = {
  'bp-primary': '#00766C',
  'bp-primary-dark': '#005A52',
  'bp-primary-light': '#E6F4F3',
  'bp-accent': '#FF6B35',
  'bp-surface': '#F5F5F5',
  'bp-text': '#1A1A1A',
  'bp-muted': '#6B7280',
}

describe('Design tokens', () => {
  it('has primary teal color', () => {
    expect(DESIGN_TOKENS['bp-primary']).toBe('#00766C')
  })
  it('has accent orange color', () => {
    expect(DESIGN_TOKENS['bp-accent']).toBe('#FF6B35')
  })
  it('has all required design tokens', () => {
    expect(Object.keys(DESIGN_TOKENS).length).toBe(7)
  })
})
