import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoProfileById, parseDemoCookie } from '@/lib/demo/session'
import { sendDemoMessage } from '@/lib/demo/store'
import { messageRequestSchema } from '@/lib/validations/message'
import type { Message } from '@/app/api/contracts/message'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()
  const parsed = messageRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { receiver_id, content } = parsed.data
  const demoSession = !user ? parseDemoCookie(request.cookies.get('bp-demo-session')?.value) : null

  if (!user && demoSession) {
    const receiverProfile = getDemoProfileById(receiver_id)

    if (!receiverProfile) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    if (receiverProfile.role === 'admin') {
      return NextResponse.json({ error: 'Cannot message admin users' }, { status: 403 })
    }

    const message = sendDemoMessage(demoSession.sessionId, demoSession.userId, receiver_id, content)
    return NextResponse.json({ message }, { status: 201 })
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Validate receiver exists
  const { data: receiverUser, error: receiverError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', receiver_id)
    .single()

  if (receiverError || !receiverUser) {
    return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
  }

  // Ensure receiver is patient or provider (not admin)
  if (receiverUser.role === 'admin') {
    return NextResponse.json({ error: 'Cannot message admin users' }, { status: 403 })
  }

  // Get or create conversation
  const conversationLookup = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${receiver_id}),and(user_id_1.eq.${receiver_id},user_id_2.eq.${user.id})`)
    .single()
  let conversation = conversationLookup.data
  const conversationError = conversationLookup.error

  // If conversation doesn't exist, create it
  if (conversationError && conversationError.code === 'PGRST116') {
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_id_1: user.id,
        user_id_2: receiver_id,
      })
      .select('id')
      .single()

    if (createError) {
      console.error('[api/messages] Conversation creation error:', createError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }
    conversation = newConv
  } else if (conversationError) {
    console.error('[api/messages] Conversation fetch error:', conversationError)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }

  // Insert message
  const now = new Date().toISOString()
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id,
      content,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (msgError) {
    console.error('[api/messages] Message insert error:', msgError)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Update conversation last_message_at
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ last_message_at: now, updated_at: now })
    .eq('id', conversation.id)

  if (updateError) {
    console.error('[api/messages] Conversation update error:', updateError)
    // Don't fail if update fails, message was sent
  }

  return NextResponse.json({ message: message as Message }, { status: 201 })
}
