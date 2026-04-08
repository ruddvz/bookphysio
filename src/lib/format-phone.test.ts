import { describe, expect, it } from 'vitest'
import { formatIndianPhone, stripPhoneFormat } from './format-phone'

describe('Indian phone formatting', () => {
  it('formats values that already include the +91 prefix without mangling the number', () => {
    expect(formatIndianPhone('+919876543210')).toBe('98765 43210')
    expect(formatIndianPhone('+91 98765 43210')).toBe('98765 43210')
  })

  it('strips an optional country prefix before returning raw digits', () => {
    expect(stripPhoneFormat('+919876543210')).toBe('9876543210')
    expect(stripPhoneFormat('91 98765 43210')).toBe('9876543210')
    expect(stripPhoneFormat('98765 43210')).toBe('9876543210')
  })
})