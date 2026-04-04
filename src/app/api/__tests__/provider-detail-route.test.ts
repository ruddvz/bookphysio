import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const providerMaybeSingleMock = vi.fn()
const reviewRangeMock = vi.fn()

const providerChain = {
  select: vi.fn(() => providerChain),
  eq: vi.fn(() => providerChain),
  maybeSingle: (...args: unknown[]) => providerMaybeSingleMock(...args),
}

const reviewChain = {
  select: vi.fn(() => reviewChain),
  eq: vi.fn(() => reviewChain),
  order: vi.fn(() => reviewChain),
  range: (...args: unknown[]) => reviewRangeMock(...args),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

describe('GET /api/providers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue({
      from: vi.fn((table: string) => table === 'providers' ? providerChain : reviewChain),
    })
    providerMaybeSingleMock.mockResolvedValue({
      data: {
        id: 'provider-1',
        slug: 'demo-provider',
        title: 'Dr.',
        bio: 'Clinical specialist',
        icp_registration_no: 'ICP-12345',
        rating_avg: 4.9,
        rating_count: 12,
        experience_years: 9,
        consultation_fee_inr: 1200,
        verified: true,
        users: {
          full_name: 'Dr. Demo Provider',
          avatar_url: null,
        },
        locations: [
          {
            id: 'location-1',
            name: 'Downtown Clinic',
            city: 'Testville',
            state: 'Maharashtra',
            lat: 18.96789,
            lng: 72.83312,
            visit_type: ['in_clinic', 'home_visit'],
            address: 'Hidden street',
            pincode: '400001',
          },
        ],
        specialties: [],
        onboarding_step: 4,
        gstin: '27ABCDE1234F1Z5',
      },
      error: null,
    })
    reviewRangeMock.mockResolvedValue({
      data: [
        {
          id: 'review-empty',
          rating: 5,
          comment: '',
          created_at: '2026-04-20T12:00:00.000Z',
        },
        {
          id: 'review-whitespace',
          rating: 4,
          comment: '   ',
          created_at: '2026-04-19T12:00:00.000Z',
        },
        {
          id: 'review-1',
          rating: 5,
          comment: 'Excellent care',
          created_at: '2026-04-18T12:00:00.000Z',
        },
        {
          id: 'review-2',
          rating: 5,
          comment: 'Strong recovery support',
          created_at: '2026-04-17T12:00:00.000Z',
        },
        {
          id: 'review-3',
          rating: 5,
          comment: 'Very attentive',
          created_at: '2026-04-16T12:00:00.000Z',
        },
        {
          id: 'review-4',
          rating: 4,
          comment: 'Helped with mobility',
          created_at: '2026-04-15T12:00:00.000Z',
        },
        {
          id: 'review-5',
          rating: 5,
          comment: 'Clear exercise plan',
          created_at: '2026-04-14T12:00:00.000Z',
        },
      ],
      error: null,
    })
  })

  it('returns only bounded public comment reviews in the public provider payload', async () => {
    const { GET } = await import('../providers/[id]/route')
    const response = await GET(new NextRequest('http://localhost/api/providers/provider-1'), {
      params: Promise.resolve({ id: 'provider-1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json() as {
      lat: number | null
      lng: number | null
      locations: Array<Record<string, unknown>>
      reviews: Array<Record<string, unknown>>
      gstin?: string
      onboarding_step?: number
    }

    expect(body).not.toHaveProperty('gstin')
    expect(body).not.toHaveProperty('onboarding_step')
    expect(body.lat).toBeNull()
    expect(body.lng).toBeNull()
    expect(body.locations).toEqual([
      {
        id: 'location-1',
        name: 'Downtown Clinic',
        city: 'Testville',
        state: 'Maharashtra',
        visit_type: ['in_clinic', 'home_visit'],
      },
    ])
    expect(body.reviews).toEqual([
      {
        id: 'review-1',
        rating: 5,
        comment: 'Excellent care',
        created_at: '2026-04-18',
      },
      {
        id: 'review-2',
        rating: 5,
        comment: 'Strong recovery support',
        created_at: '2026-04-17',
      },
      {
        id: 'review-3',
        rating: 5,
        comment: 'Very attentive',
        created_at: '2026-04-16',
      },
      {
        id: 'review-4',
        rating: 4,
        comment: 'Helped with mobility',
        created_at: '2026-04-15',
      },
      {
        id: 'review-5',
        rating: 5,
        comment: 'Clear exercise plan',
        created_at: '2026-04-14',
      },
    ])
    expect(providerChain.eq).toHaveBeenNthCalledWith(1, 'id', 'provider-1')
    expect(providerChain.eq).toHaveBeenNthCalledWith(2, 'active', true)
    expect(providerChain.eq).toHaveBeenNthCalledWith(3, 'verified', true)
    expect(reviewChain.eq).toHaveBeenNthCalledWith(1, 'provider_id', 'provider-1')
    expect(reviewChain.eq).toHaveBeenNthCalledWith(2, 'is_published', true)
    expect(reviewChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(reviewRangeMock).toHaveBeenCalledWith(0, 24)
  })

  it('continues batching until it collects five nonblank public comments', async () => {
    const firstBatch = [
      { id: 'review-1', rating: 5, comment: 'Newest kept comment', created_at: '2026-04-30T12:00:00.000Z' },
      ...Array.from({ length: 10 }, (_, index) => ({
        id: `blank-a-${index}`,
        rating: 4,
        comment: index % 2 === 0 ? '' : '   ',
        created_at: `2026-04-${String(29 - index).padStart(2, '0')}T12:00:00.000Z`,
      })),
      { id: 'review-2', rating: 5, comment: 'Second kept comment', created_at: '2026-04-19T12:00:00.000Z' },
      ...Array.from({ length: 10 }, (_, index) => ({
        id: `blank-b-${index}`,
        rating: 4,
        comment: index % 2 === 0 ? ' ' : '',
        created_at: `2026-04-${String(18 - index).padStart(2, '0')}T12:00:00.000Z`,
      })),
      { id: 'review-3', rating: 5, comment: 'Third kept comment', created_at: '2026-04-08T12:00:00.000Z' },
      { id: 'blank-tail-1', rating: 4, comment: '', created_at: '2026-04-07T12:00:00.000Z' },
      { id: 'blank-tail-2', rating: 4, comment: '   ', created_at: '2026-04-06T12:00:00.000Z' },
    ]
    const secondBatch = [
      { id: 'review-4', rating: 5, comment: 'Fourth kept comment', created_at: '2026-04-05T12:00:00.000Z' },
      { id: 'review-5', rating: 4, comment: 'Fifth kept comment', created_at: '2026-04-04T12:00:00.000Z' },
      { id: 'review-6', rating: 4, comment: 'Would be trimmed', created_at: '2026-04-03T12:00:00.000Z' },
    ]

    reviewRangeMock
      .mockReset()
      .mockResolvedValueOnce({ data: firstBatch, error: null })
      .mockResolvedValueOnce({ data: secondBatch, error: null })

    const { GET } = await import('../providers/[id]/route')
    const response = await GET(new NextRequest('http://localhost/api/providers/provider-1'), {
      params: Promise.resolve({ id: 'provider-1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json() as {
      reviews: Array<Record<string, unknown>>
    }

    expect(body.reviews).toEqual([
      { id: 'review-1', rating: 5, comment: 'Newest kept comment', created_at: '2026-04-30' },
      { id: 'review-2', rating: 5, comment: 'Second kept comment', created_at: '2026-04-19' },
      { id: 'review-3', rating: 5, comment: 'Third kept comment', created_at: '2026-04-08' },
      { id: 'review-4', rating: 5, comment: 'Fourth kept comment', created_at: '2026-04-05' },
      { id: 'review-5', rating: 4, comment: 'Fifth kept comment', created_at: '2026-04-04' },
    ])
    expect(reviewRangeMock).toHaveBeenNthCalledWith(1, 0, 24)
    expect(reviewRangeMock).toHaveBeenNthCalledWith(2, 25, 49)
  })
})