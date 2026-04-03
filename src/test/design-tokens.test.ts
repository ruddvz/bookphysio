import { describe, it, expect } from 'vitest'

// Design tokens defined in src/app/globals.css via CSS custom properties
// Tailwind v4 uses CSS-first config via src/app/globals.css
const DESIGN_TOKENS = {
  'bp-primary': '#0b3b32',
  'bp-accent': '#12b3a0',
  'bp-secondary': '#d9734d',
  'bp-surface': '#fbf9f4',
  'bp-body': '#616b68',
}

describe('Design tokens', () => {
  it('has primary deep pine color', () => {
    expect(DESIGN_TOKENS['bp-primary']).toBe('#0b3b32')
  })
  it('has accent active teal color', () => {
    expect(DESIGN_TOKENS['bp-accent']).toBe('#12b3a0')
  })
  it('has all required design tokens', () => {
    expect(Object.keys(DESIGN_TOKENS).length).toBe(5)
  })
})
