import { describe, expect, it } from 'vitest'
import { formatPublicProviderDistance, getPublicProviderCoordinates } from './public'

describe('public provider helpers', () => {
  it('prefers city-center coordinates for known cities', () => {
    expect(getPublicProviderCoordinates({ city: 'Mumbai', lat: 18.9, lng: 72.8 })).toEqual({
      lat: 19.076,
      lng: 72.8777,
    })
  })

  it('rounds unknown-city coordinates to a coarse public precision', () => {
    expect(getPublicProviderCoordinates({ city: 'Testville', lat: 18.96789, lng: 72.83312 })).toEqual({
      lat: null,
      lng: null,
    })
  })

  it('buckets provider distance strings instead of returning exact proximity', () => {
    expect(formatPublicProviderDistance(1.1)).toBe('Within 2 km')
    expect(formatPublicProviderDistance(4.2)).toBe('Within 5 km')
    expect(formatPublicProviderDistance(9.8)).toBe('Within 10 km')
    expect(formatPublicProviderDistance(16)).toBe('Within 20 km')
    expect(formatPublicProviderDistance(25)).toBe('20+ km away')
    expect(formatPublicProviderDistance(null)).toBeUndefined()
  })
})