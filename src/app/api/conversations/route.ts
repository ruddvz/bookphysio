import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversationsSchema } from '@/lib/validations/message'
import type { Conversation } from '@/app/api/contracts/message'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = getConversationsSchema.safeParse({
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { limit, offset } = parsed.data

  // Get conversations where user is participant
  const { data: conversations, error: convError, count } = await supabase
    .from('conversations')
    .select(
      `
      id,
      user_id_1,
      user_id_2,
      last_message_at,
      created_at,
      updated_at
      `,
      { count: 'exact' }
    )
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (convError) {
    console.error('[api/conversations] GET error:', convError)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  // Enrich each conversation with other user + last message
  const enriched: Conversation[] = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherUserId = conv.user_id_1 === user.id ? conv.user_id_2 : conv.user_id_1

      // Fetch other user
      const { data: otherUser } = await supabase
        .from('users')
        .select('id, role, full_name, phone, avatar_url, created_at')
        .eq('id', otherUserId)
        .single()

      // Fetch last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, receiver_id, content, read_at, created_at, updated_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Count unread messages for this user
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('receiver_id', user.id)
        .is('read_at', null)

      return {
        id: conv.id,
        user_id_1: conv.user_id_1,
        user_id_2: conv.user_id_2,
        other_user: otherUser as any,
        last_message: lastMessage as any,
        unread_count: unreadCount || 0,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }
    })
  )

  return NextResponse.json(
    { conversations: enriched, total: count || 0 },
    { status: 200 }
  )
}
