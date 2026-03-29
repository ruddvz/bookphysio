import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { getUser: vi.fn() } })),
}))

describe('Supabase browser client', () => {
  it('creates client without throwing', async () => {
    const { createClient } = await import('../client')
    expect(() => createClient()).not.toThrow()
  })
})
