import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPreviewToken, isValidPreviewToken } from './token'

describe('preview token utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
  })

  it('creates distinct signed tokens for separate preview sessions', async () => {
    const first = await createPreviewToken('preview-secret')
    const second = await createPreviewToken('preview-secret')

    expect(first).not.toBe(second)
  })

  it('accepts a valid signed preview token', async () => {
    const token = await createPreviewToken('preview-secret')

    await expect(isValidPreviewToken(token, 'preview-secret')).resolves.toBe(true)
  })

  it('rejects expired preview tokens', async () => {
    const token = await createPreviewToken('preview-secret')

    vi.setSystemTime(new Date('2026-05-20T12:00:01.000Z'))

    await expect(isValidPreviewToken(token, 'preview-secret')).resolves.toBe(false)
  })
})