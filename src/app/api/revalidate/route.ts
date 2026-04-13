import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const revalidateSchema = z.object({
  paths: z.array(z.string().startsWith('/')).nonempty('At least one path is required'),
})

const MAX_PATHS_PER_REQUEST = 20

/**
 * POST /api/revalidate
 *
 * On-demand ISR revalidation endpoint.
 * Revalidates specific paths when content changes (e.g., new review, profile update).
 *
 * Protected by CRON_SECRET bearer token.
 *
 * Body: { paths: string[] }
 * Example: { "paths": ["/doctor/abc-123", "/search"] }
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = revalidateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 })
  }

  // Limit paths per request to prevent abuse
  const pathsToRevalidate = parsed.data.paths.slice(0, MAX_PATHS_PER_REQUEST)
  const revalidated: string[] = []

  for (const path of pathsToRevalidate) {
    try {
      revalidatePath(path)
      revalidated.push(path)
    } catch (err) {
      console.error(`[api/revalidate] Failed to revalidate ${path}:`, err)
    }
  }

  return NextResponse.json({ revalidated, count: revalidated.length })
}
