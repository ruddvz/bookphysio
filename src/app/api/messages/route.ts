import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoProfileById, getDemoSessionFromCookies } from '@/lib/demo/session'
import { sendDemoMessage } from '@/lib/demo/store'
import { hasMessagingCareRelationship } from '@/lib/messaging/access'
import { messageRequestSchema } from '@/lib/validations/message'
import type { Message } from '@/app/api/contracts/message'

function isDuplicateConversationError(error: { code?: string; message?: string } | null) {
  return error?.code === '23505' || error?.message?.includes('idx_conversations_user_pair_unique')
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = messageRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { receiver_id, content } = parsed.data
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession) {
    if (demoSession.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot access patient-provider messaging.' }, { status: 403 })
    }

    const receiverProfile = getDemoProfileById(receiver_id)

    if (!receiverProfile) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    if (receiverProfile.role === 'admin') {
      return NextResponse.json({ error: 'Cannot message admin users' }, { status: 403 })
    }

    if (receiverProfile.role === demoSession.role) {
      return NextResponse.json({ error: 'Messages are only available between patients and providers' }, { status: 403 })
    }

    const message = sendDemoMessage(demoSession.sessionId, demoSession.userId, receiver_id, content)
    return NextResponse.json({ message }, { status: 201 })
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: senderProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!senderProfile) {
    return NextResponse.json({ error: 'Only patient and provider accounts can access messaging.' }, { status: 403 })
  }

  if (senderProfile?.role === 'admin') {
    return NextResponse.json({ error: 'Admin accounts cannot access patient-provider messaging.' }, { status: 403 })
  }

  if (senderProfile?.role !== 'patient' && senderProfile?.role !== 'provider') {
    return NextResponse.json({ error: 'Only patient and provider accounts can access messaging.' }, { status: 403 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Validate receiver exists
  const { data: receiverUser, error: receiverError } = await supabaseAdmin
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

  if (receiverUser.role === senderProfile?.role) {
    return NextResponse.json({ error: 'Messages are only available between patients and providers' }, { status: 403 })
  }

  let hasCareRelationship = false

  try {
    hasCareRelationship = await hasMessagingCareRelationship(
      supabaseAdmin,
      user.id,
      senderProfile.role,
      receiver_id,
      receiverUser.role,
    )
  } catch (error) {
    console.error('[api/messages] Care relationship check failed:', error)
    return NextResponse.json({ error: 'Failed to validate messaging access' }, { status: 500 })
  }

  if (!hasCareRelationship) {
    return NextResponse.json({ error: 'Messaging is only available for connected patient-provider pairs.' }, { status: 403 })
  }

  const [firstParticipantId, secondParticipantId] = user.id < receiver_id
    ? [user.id, receiver_id]
    : [receiver_id, user.id]

  const conversationFilter = `and(user_id_1.eq.${user.id},user_id_2.eq.${receiver_id}),and(user_id_1.eq.${receiver_id},user_id_2.eq.${user.id})`

  // Get or create conversation
  const conversationLookup = await supabaseAdmin
    .from('conversations')
    .select('id')
    .or(conversationFilter)
    .single()
  let conversation = conversationLookup.data
  const conversationError = conversationLookup.error

  // If conversation doesn't exist, create it
  if (conversationError && conversationError.code === 'PGRST116') {
    const { data: newConv, error: createError } = await supabaseAdmin
      .from('conversations')
      .insert({
        user_id_1: firstParticipantId,
        user_id_2: secondParticipantId,
      })
      .select('id')
      .single()

    if (isDuplicateConversationError(createError)) {
      const retryLookup = await supabaseAdmin
        .from('conversations')
        .select('id')
        .or(conversationFilter)
        .single()

      if (retryLookup.error || !retryLookup.data) {
        console.error('[api/messages] Conversation fetch after conflict error:', retryLookup.error)
        return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
      }

      conversation = retryLookup.data
    } else if (createError) {
      console.error('[api/messages] Conversation creation error:', createError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    } else {
      conversation = newConv
    }
  } else if (conversationError) {
    console.error('[api/messages] Conversation fetch error:', conversationError)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }

  if (!conversation) {
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }

  // Insert message
  const now = new Date().toISOString()
  const { data: message, error: msgError } = await supabaseAdmin
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
  const { error: updateError } = await supabaseAdmin
    .from('conversations')
    .update({ last_message_at: now, updated_at: now })
    .eq('id', conversation.id)

  if (updateError) {
    console.error('[api/messages] Conversation update error:', updateError)
    // Don't fail if update fails, message was sent
  }

  return NextResponse.json({ message: message as Message }, { status: 201 })
}
