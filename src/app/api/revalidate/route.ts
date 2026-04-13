import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/revalidate
 *
 * On-demand ISR revalidation endpoint.
 * Revalidates specific paths when content changes (e.g., new review, profile update).
 *
 * Protected by CRON_SECRET or a shared revalidation token.
 *
 * Body: { paths: string[] }
 * Example: { "paths": ["/doctor/abc-123", "/search"] }
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  // Allow Vercel cron header or Bearer token
  const isVercelCron = !!request.headers.get('x-vercel-cron')
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as { paths?: string[] } | null

  if (!body?.paths || !Array.isArray(body.paths) || body.paths.length === 0) {
    return NextResponse.json({ error: 'Missing or empty paths array' }, { status: 400 })
  }

  // Limit to 20 paths per request to prevent abuse
  const pathsToRevalidate = body.paths.slice(0, 20)
  const revalidated: string[] = []

  for (const path of pathsToRevalidate) {
    if (typeof path !== 'string' || !path.startsWith('/')) continue
    try {
      revalidatePath(path)
      revalidated.push(path)
    } catch (err) {
      console.error(`[api/revalidate] Failed to revalidate ${path}:`, err)
    }
  }

  return NextResponse.json({ revalidated, count: revalidated.length })
}
