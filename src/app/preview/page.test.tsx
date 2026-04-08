import { describe, expect, it, vi } from 'vitest'

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

const cookiesMock = vi.fn()
const getPreviewTokenSigningSecretMock = vi.fn()
const isPublicPreviewGateEnabledMock = vi.fn()
const isValidPreviewTokenMock = vi.fn()

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

vi.mock('./PreviewGate', () => ({
  default: ({ unlocked }: { unlocked: boolean }) => <div>{unlocked ? 'Preview unlocked' : 'Preview locked'}</div>,
}))

vi.mock('@/lib/preview/token', () => ({
  getPreviewTokenSigningSecret: getPreviewTokenSigningSecretMock,
  isPublicPreviewGateEnabled: isPublicPreviewGateEnabledMock,
  isValidPreviewToken: isValidPreviewTokenMock,
}))

describe('PreviewPage', () => {
  it('returns not found when the public preview gate is disabled', async () => {
    isPublicPreviewGateEnabledMock.mockReturnValue(false)

    const { default: PreviewPage } = await import('./page')

    await expect(PreviewPage()).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
    expect(cookiesMock).not.toHaveBeenCalled()
  })

  it('renders the preview gate when public preview access is enabled', async () => {
    isPublicPreviewGateEnabledMock.mockReturnValue(true)
    getPreviewTokenSigningSecretMock.mockReturnValue('preview-token-secret')
    isValidPreviewTokenMock.mockResolvedValue(true)
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'preview-token' }),
    })

    const { default: PreviewPage } = await import('./page')
    const element = await PreviewPage()

    expect(element).toBeTruthy()
    expect(isValidPreviewTokenMock).toHaveBeenCalledWith('preview-token', 'preview-token-secret')
  })
})