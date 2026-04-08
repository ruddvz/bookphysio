import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import PreviewGate from './PreviewGate'
import { getPreviewTokenSigningSecret, isPublicPreviewGateEnabled, isValidPreviewToken } from '@/lib/preview/token'

export const metadata = {
  title: 'Preview — BookPhysio',
}

export default async function PreviewPage() {
  if (!isPublicPreviewGateEnabled()) {
    notFound()
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('preview_token')?.value
  const unlocked = await isValidPreviewToken(token, getPreviewTokenSigningSecret())
  return <PreviewGate unlocked={unlocked} />
}
