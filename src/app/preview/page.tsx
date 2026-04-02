import { cookies } from 'next/headers'
import crypto from 'crypto'
import PreviewGate from './PreviewGate'

function isValidPreviewCookie(token: string | undefined): boolean {
  const secret = process.env.PREVIEW_PASSWORD
  if (!secret || !token) return false
  const expected = crypto.createHmac('sha256', secret).update('bookphysio-preview').digest('hex')
  try {
    const a = Buffer.from(token)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export const metadata = {
  title: 'Preview — BookPhysio',
}

export default async function PreviewPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('preview_token')?.value
  const unlocked = isValidPreviewCookie(token)
  return <PreviewGate unlocked={unlocked} />
}
