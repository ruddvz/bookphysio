import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoMessages, markDemoConversationRead } from '@/lib/demo/store'
import { parseDemoCookie } from '@/lib/demo/session'
import { getMessagesSchema } from '@/lib/validations/message'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { user_id } = await params
  const { searchParams } = new URL(request.url)
  const parsed = getMessagesSchema.safeParse({
    user_id,
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { limit, offset } = parsed.data
  const demoSession = !user ? await parseDemoCookie(request.cookies.get('bp-demo-session')?.value) : null

  if (!user && demoSession) {
    markDemoConversationRead(demoSession.sessionId, demoSession.userId, user_id)
    return NextResponse.json(getDemoMessages(demoSession.sessionId, demoSession.userId, user_id, limit, offset), { status: 200 })
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get or create conversation between current user and target user
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${user_id}),and(user_id_1.eq.${user_id},user_id_2.eq.${user.id})`)
    .single()

  // If no conversation exists, return empty array (don't create yet)
  if (convError && convError.code === 'PGRST116') {
    return NextResponse.json({ messages: [], total: 0 }, { status: 200 })
  }
  if (convError) {
    console.error('[api/conversations/messages] Conversation fetch error:', convError)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Fetch messages in conversation
  const { data: messages, error: msgError, count } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, receiver_id, content, read_at, created_at, updated_at', {
      count: 'exact',
    })
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (msgError) {
    console.error('[api/conversations/messages] Messages fetch error:', msgError)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Mark all unread messages from the other user as read
  const { error: updateError } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversation.id)
    .eq('receiver_id', user.id)
    .is('read_at', null)

  if (updateError) {
    console.error('[api/conversations/messages] Mark read error:', updateError)
    // Don't fail the request if marking as read fails
  }

  return NextResponse.json({ messages, total: count || 0 }, { status: 200 })
}
