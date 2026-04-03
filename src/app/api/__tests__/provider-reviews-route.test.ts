import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const reviewsRangeMock = vi.fn()
const providerMaybeSingleMock = vi.fn()

const providerChain = {
  select: vi.fn(() => providerChain),
  eq: vi.fn(() => providerChain),
  maybeSingle: (...args: unknown[]) => providerMaybeSingleMock(...args),
}

const reviewsChain = {
  select: vi.fn(() => reviewsChain),
  eq: vi.fn(() => reviewsChain),
  order: vi.fn(() => reviewsChain),
  range: (...args: unknown[]) => reviewsRangeMock(...args),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

describe('GET /api/providers/[id]/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue({
      from: vi.fn((table: string) => table === 'providers' ? providerChain : reviewsChain),
    })
    providerMaybeSingleMock.mockResolvedValue({
      data: { id: 'provider-1' },
      error: null,
    })
    reviewsRangeMock.mockResolvedValue({
      data: [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Excellent care',
          created_at: '2026-04-15T12:00:00.000Z',
          users: {
            full_name: 'Patient Name',
            avatar_url: 'https://example.com/avatar.png',
          },
        },
      ],
      error: null,
      count: 1,
    })
  })

  it('removes reviewer identity fields from the public payload', async () => {
    const { GET } = await import('../providers/[id]/reviews/route')
    const response = await GET(new NextRequest('http://localhost/api/providers/provider-1/reviews?page=1&limit=10'), {
      params: Promise.resolve({ id: 'provider-1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json() as {
      total: number
      reviews: Array<Record<string, unknown>>
    }

    expect(body.total).toBe(1)
    expect(body.reviews).toEqual([
      {
        id: 'review-1',
        rating: 5,
        comment: 'Excellent care',
        created_at: '2026-04-15',
      },
    ])
    expect(body.reviews[0]).not.toHaveProperty('users')
    expect(body.reviews[0]).not.toHaveProperty('provider_reply')
    expect(providerChain.eq).toHaveBeenNthCalledWith(1, 'id', 'provider-1')
    expect(providerChain.eq).toHaveBeenNthCalledWith(2, 'active', true)
    expect(providerChain.eq).toHaveBeenNthCalledWith(3, 'verified', true)
    expect(reviewsChain.eq).toHaveBeenNthCalledWith(1, 'provider_id', 'provider-1')
    expect(reviewsChain.eq).toHaveBeenNthCalledWith(2, 'is_published', true)
    expect(reviewsChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(reviewsRangeMock).toHaveBeenCalledWith(0, 9)
  })

  it('returns 404 when the provider is not publicly available', async () => {
    providerMaybeSingleMock.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const { GET } = await import('../providers/[id]/reviews/route')
    const response = await GET(new NextRequest('http://localhost/api/providers/provider-1/reviews?page=1&limit=10'), {
      params: Promise.resolve({ id: 'provider-1' }),
    })

    expect(response.status).toBe(404)
    expect(reviewsChain.select).not.toHaveBeenCalled()
  })
})