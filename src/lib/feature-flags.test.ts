import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isUiV2 } from './feature-flags'

const originalEnv = process.env.NEXT_PUBLIC_UI_V2

describe('isUiV2', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_UI_V2
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_UI_V2
    } else {
      process.env.NEXT_PUBLIC_UI_V2 = originalEnv
    }
  })

  it('returns false by default', () => {
    expect(isUiV2()).toBe(false)
  })

  it('honours the env flag', () => {
    process.env.NEXT_PUBLIC_UI_V2 = 'true'
    expect(isUiV2()).toBe(true)
  })

  it('honours a bp_ui=v2 cookie', () => {
    expect(isUiV2({ cookieHeader: 'theme=dark; bp_ui=v2; other=1' })).toBe(true)
  })

  it('ignores other cookie values', () => {
    expect(isUiV2({ cookieHeader: 'bp_ui=v1' })).toBe(false)
  })

  it('honours ?ui=v2 query param', () => {
    expect(isUiV2({ searchParam: 'v2' })).toBe(true)
    expect(isUiV2({ searchParam: 'V2' })).toBe(true)
    expect(isUiV2({ searchParam: 'off' })).toBe(false)
  })

  it('tolerates cookies with malformed percent-encoding', () => {
    // A stray '%' would crash decodeURIComponent; the resolver must not throw.
    expect(() => isUiV2({ cookieHeader: 'bp_ui=100%' })).not.toThrow()
    expect(isUiV2({ cookieHeader: 'bp_ui=100%' })).toBe(false)
  })

  describe('precedence', () => {
    it('env=off beats a v2 cookie', () => {
      process.env.NEXT_PUBLIC_UI_V2 = 'off'
      expect(isUiV2({ cookieHeader: 'bp_ui=v2' })).toBe(false)
    })

    it('env=off beats a v2 query param', () => {
      process.env.NEXT_PUBLIC_UI_V2 = 'false'
      expect(isUiV2({ searchParam: 'v2' })).toBe(false)
    })

    it('env=on beats a non-v2 cookie and query', () => {
      process.env.NEXT_PUBLIC_UI_V2 = 'on'
      expect(isUiV2({ cookieHeader: 'bp_ui=v1', searchParam: 'off' })).toBe(true)
    })

    it('unknown env value falls through to cookie', () => {
      process.env.NEXT_PUBLIC_UI_V2 = 'maybe'
      expect(isUiV2({ cookieHeader: 'bp_ui=v2' })).toBe(true)
    })

    it('cookie or query enables v2 when env is unset', () => {
      expect(isUiV2({ cookieHeader: 'bp_ui=v2', searchParam: 'off' })).toBe(true)
      expect(isUiV2({ cookieHeader: 'bp_ui=v1', searchParam: 'v2' })).toBe(true)
      expect(isUiV2({ cookieHeader: 'bp_ui=v1', searchParam: 'off' })).toBe(false)
    })
  })
})
