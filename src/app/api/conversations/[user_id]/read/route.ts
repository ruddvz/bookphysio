import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id } = await params

  // Get conversation between current user and target user
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${user_id}),and(user_id_1.eq.${user_id},user_id_2.eq.${user.id})`)
    .single()

  if (convError) {
    if (convError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    console.error('[api/conversations/read] Conversation fetch error:', convError)
    return NextResponse.json({ error: 'Failed to find conversation' }, { status: 500 })
  }

  // Mark all unread messages as read
  const { error: updateError } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversation.id)
    .eq('receiver_id', user.id)
    .is('read_at', null)

  if (updateError) {
    console.error('[api/conversations/read] Update error:', updateError)
    return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
