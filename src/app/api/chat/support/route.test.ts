import { beforeEach, describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.fn()
const ratelimitLimitMock = vi.fn()
const getRequestIpAddressMock = vi.fn()

vi.mock('@/lib/ai-config', () => ({
  patientModels: 'mock-model',
}))

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {},
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    static slidingWindow() {
      return 'mock-window'
    }

    limit(...args: unknown[]) {
      return ratelimitLimitMock(...args)
    }
  },
}))

vi.mock('@/lib/server/runtime', () => ({
  getRequestIpAddress: (...args: unknown[]) => getRequestIpAddressMock(...args),
}))

describe('POST /api/chat/support', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ratelimitLimitMock.mockResolvedValue({ success: true })
    getRequestIpAddressMock.mockReturnValue('203.0.113.10')
  })

  it('returns model text when the AI request succeeds', async () => {
    generateTextMock.mockResolvedValue({
      text: 'You can book a session from search or a provider profile.',
    })

    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/chat/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I book a session?' }],
      }),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('book a session')
  })

  it('falls back to a deterministic support answer when the AI request fails', async () => {
    generateTextMock.mockRejectedValue(new Error('upstream unavailable'))

    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/chat/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Do you offer home visits in India?' }],
      }),
    })

    const response = await POST(request as never)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toMatch(/home visit/i)
    expect(text).toMatch(/BookPhysio|bookphysio\.in/i)
  })

  it('rate limits before rejecting malformed JSON payloads', async () => {
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/chat/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })

    const response = await POST(request as never)

    expect(response.status).toBe(400)
    expect(ratelimitLimitMock).toHaveBeenCalledWith('support:203.0.113.10')
  })
})
