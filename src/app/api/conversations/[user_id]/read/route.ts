import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoProfileById, getDemoSessionFromCookies } from '@/lib/demo/session'
import { markDemoConversationRead } from '@/lib/demo/store'
import { hasMessagingCareRelationship } from '@/lib/messaging/access'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { user_id } = await params
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession) {
    if (demoSession.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot access patient-provider messaging.' }, { status: 403 })
    }

    const targetUser = getDemoProfileById(user_id)

    if (!targetUser || targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    markDemoConversationRead(demoSession.sessionId, demoSession.userId, user_id)
    return NextResponse.json({ success: true }, { status: 200 })
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Only patient and provider accounts can access messaging.' }, { status: 403 })
  }

  if (profile?.role === 'admin') {
    return NextResponse.json({ error: 'Admin accounts cannot access patient-provider messaging.' }, { status: 403 })
  }

  if (profile.role !== 'patient' && profile.role !== 'provider') {
    return NextResponse.json({ error: 'Only patient and provider accounts can access messaging.' }, { status: 403 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  const { data: targetUser } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', user_id)
    .single()

  if (!targetUser || targetUser.role === 'admin' || targetUser.role === profile?.role) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  let hasCareRelationship = false

  try {
    hasCareRelationship = await hasMessagingCareRelationship(
      supabaseAdmin,
      user.id,
      profile.role,
      user_id,
      targetUser.role,
      { includeHistorical: true },
    )
  } catch (error) {
    console.error('[api/conversations/read] Care relationship check failed:', error)
    return NextResponse.json({ error: 'Failed to validate conversation access' }, { status: 500 })
  }

  if (!hasCareRelationship) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Get conversation between current user and target user
  const { data: conversation, error: convError } = await supabaseAdmin
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

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Mark all unread messages as read
  const { error: updateError } = await supabaseAdmin
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
