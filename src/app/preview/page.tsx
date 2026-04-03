import { cookies } from 'next/headers'
import PreviewGate from './PreviewGate'
import { isValidPreviewToken } from '@/lib/preview/token'

export const metadata = {
  title: 'Preview — BookPhysio',
}

export default async function PreviewPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('preview_token')?.value
  const unlocked = await isValidPreviewToken(token, process.env.PREVIEW_PASSWORD)
  return <PreviewGate unlocked={unlocked} />
}
