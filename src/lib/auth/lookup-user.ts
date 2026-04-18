import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Find auth user id by email (case-insensitive). Paginates listUsers until found or exhausted.
 */
export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase()
  let page = 1
  const perPage = 1000

  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('[lookup-user] listUsers failed:', error)
      return null
    }
    const users = data?.users ?? []
    const match = users.find((u) => u.email?.toLowerCase() === normalized)
    if (match) return match.id
    if (users.length < perPage) return null
    page += 1
    if (page > 50) {
      console.warn('[lookup-user] listUsers pagination cap reached')
      return null
    }
  }
}
