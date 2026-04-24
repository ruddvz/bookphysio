import { describe, it, expect } from 'vitest'
import { searchFiltersSchema } from '../search'

describe('searchFiltersSchema', () => {
  it('accepts empty filters with defaults', () => {
    const result = searchFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })
  it('coerces string numbers for page/limit', () => {
    const result = searchFiltersSchema.safeParse({ page: '2', limit: '10' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
    }
  })
  it('rejects limit above 50', () => {
    const result = searchFiltersSchema.safeParse({ limit: '100' })
    expect(result.success).toBe(false)
  })

  it('accepts optional insurance_id as a uuid', () => {
    const result = searchFiltersSchema.safeParse({
      insurance_id: '11111111-1111-4111-8111-111111111111',
    })
    expect(result.success).toBe(true)
  })
})
