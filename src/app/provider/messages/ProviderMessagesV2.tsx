'use client'

/**
 * v2 overlay for the provider messages page (parity with patient slice 16.19).
 * Self-gates via useUiV2() — returns null when v2 is off.
 */

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  AlertCircle,
  MessageSquare,
  Send,
  Phone,
  Video,
  CheckCheck,
  Clock,
  Loader2,
  ChevronLeft,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import type { Conversation, Message } from '@/app/api/contracts/message'
import { formatConversationTimestamp } from '@/lib/messaging/time'
import {
  nameInitials,
  unreadBadgeVariant,
  lastMessagePreview,
  groupMessagesByDay,
  formatMessageTime,
} from '@/app/patient/messages/messages-v2-utils'
import type { MessageItem } from '@/app/patient/messages/messages-v2-utils'

const EMPTY_MESSAGES: Message[] = []

function EmptyInbox() {
  return (
    <div
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
      data-testid="v2-empty-inbox"
    >
      <div
        className="w-16 h-16 rounded-[var(--sq-lg)] bg-[var(--color-pv-tile-1-bg)] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <Inbox className="w-8 h-8 text-[var(--color-pv-primary)]" />
      </div>
      <p className="text-[15px] font-semibold text-slate-800 mb-1">Your inbox is empty</p>
      <p className="text-[13px] text-slate-500 max-w-[220px]">
        Messages from your patients will appear here.
      </p>
    </div>
  )
}

function EmptyThread() {
  return (
    <div
      className="flex flex-col items-center justify-center flex-1 py-14 px-10 text-center"
      data-testid="v2-empty-thread"
    >
      <div
        className="w-16 h-16 rounded-[var(--sq-lg)] bg-[var(--color-pv-tile-1-bg)] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <MessageSquare className="w-8 h-8 text-[var(--color-pv-primary)]" />
      </div>
      <p className="text-[16px] font-bold text-slate-900 mb-1">Select a conversation</p>
      <p className="text-[13px] text-slate-500 max-w-[240px]">
        Choose a patient from the list to view your message history and start chatting.
      </p>
    </div>
  )
}

export function ProviderMessagesV2() {
  const isV2 = useUiV2()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    isError: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['provider-conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations?limit=50')
      if (!res.ok) throw new Error('Failed to fetch conversations')
      return res.json() as Promise<{ conversations: Conversation[]; total: number }>
    },
    staleTime: 30_000,
  })

  const conversations = conversationsData?.conversations ?? []
  const activeChat = conversations.find(c => c.id === selectedConversationId) ?? null
  const activeUserId = activeChat?.other_user?.id ?? null

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['provider-messages', activeUserId],
    queryFn: async () => {
      if (!activeUserId) return { messages: [], total: 0 }
      const res = await fetch(`/api/conversations/${activeUserId}/messages?limit=100`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json() as Promise<{ messages: Message[]; total: number }>
    },
    enabled: !!activeUserId,
    staleTime: 10_000,
  })

  const messages = messagesData?.messages ?? EMPTY_MESSAGES

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: activeUserId, content }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json() as Promise<{ message: Message }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-messages', activeUserId] })
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] })
      setMessageText('')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedConversationId || !messagesData) return
    queryClient.setQueryData<{ conversations: Conversation[]; total: number }>(
      ['provider-conversations'],
      (current) => {
        if (!current) return current
        return {
          ...current,
          conversations: current.conversations.map((c) =>
            c.id === selectedConversationId ? { ...c, unread_count: 0 } : c
          ),
        }
      }
    )
  }, [messagesData, queryClient, selectedConversationId])

  if (!isV2) return null

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0)
  const dayGroups = groupMessagesByDay(messages as unknown as MessageItem[])

  return (
    <div
      className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-6"
      data-ui-version="v2"
      data-testid="v2-messages-root"
    >
      {/* Page header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-pv-primary)] mb-1">
            MESSAGES
          </p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-none">Your interactions</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Communicate with your patients
          </p>
        </div>
        {totalUnread > 0 && (
          <Badge
            role="provider"
            variant="success"
            aria-label={`${totalUnread} unread messages`}
            data-testid="v2-total-unread-badge"
          >
            {totalUnread} unread
          </Badge>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-4 lg:gap-6">
        {/* Conversation sidebar */}
        <div
          className={cn(
            'w-full xl:w-[340px] xl:shrink-0 flex flex-col min-h-0 gap-3',
            selectedConversationId && 'hidden xl:flex'
          )}
          data-testid="v2-conversation-sidebar"
        >
          {/* Search */}
          <div className="relative group shrink-0">
            <input
              type="search"
              placeholder="Search conversations…"
              aria-label="Search conversations"
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[var(--sq-sm)] text-[13px] focus:ring-2 focus:ring-[var(--color-pv-primary)] transition-all outline-none"
            />
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pv-primary)]"
              aria-hidden="true"
            />
          </div>

          {/* Conversation list */}
          <div
            className="flex-1 min-h-0 overflow-y-auto bg-white border border-[var(--color-pv-border)] rounded-[var(--sq-lg)] divide-y divide-[var(--color-pv-border-soft)]"
            role="listbox"
            aria-label="Conversations"
          >
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-pv-primary)]" aria-hidden="true" />
              </div>
            ) : conversationsError ? (
              <div className="p-4">
                <button
                  className="text-[13px] text-rose-600 hover:underline"
                  onClick={() => void refetchConversations()}
                >
                  <AlertCircle className="inline w-4 h-4 mr-1" aria-hidden="true" />
                  Couldn&apos;t load — retry
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <EmptyInbox />
            ) : (
              conversations.map((chat) => {
                const initials = nameInitials(chat.other_user?.full_name)
                const isActive = chat.id === selectedConversationId
                const hasUnread = (chat.unread_count ?? 0) > 0
                const badgeVariant = unreadBadgeVariant(chat.unread_count ?? 0)

                return (
                  <button
                    key={chat.id}
                    type="button"
                    role="option"
                    onClick={() => setSelectedConversationId(chat.id)}
                    aria-selected={isActive}
                    aria-label={`Conversation with ${chat.other_user?.full_name ?? 'Patient'}${hasUnread ? `, ${chat.unread_count} unread` : ''}`}
                    className={cn(
                      'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50',
                      isActive && 'bg-[var(--color-pv-tile-1-bg)]'
                    )}
                    data-testid={`v2-conversation-row-${chat.id}`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full bg-[var(--color-pv-tile-2-bg)] text-[var(--color-pv-tile-2-fg)] flex items-center justify-center text-[13px] font-bold shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-slate-900 truncate">
                          {chat.other_user?.full_name ?? 'Patient'}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatConversationTimestamp(chat.last_message_at ?? chat.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[12px] text-slate-500 truncate">
                          {lastMessagePreview(chat.last_message?.content)}
                        </span>
                        {hasUnread && (
                          <Badge
                            role="provider"
                            variant={badgeVariant}
                            aria-label={`${chat.unread_count} unread`}
                            data-testid={`v2-unread-badge-${chat.id}`}
                          >
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat thread */}
        <div
          className={cn(
            'flex-1 min-h-0 flex flex-col bg-white rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] overflow-hidden',
            !selectedConversationId && 'hidden xl:flex'
          )}
          data-testid="v2-chat-thread"
        >
          {activeChat ? (
            <>
              {/* Thread header */}
              <div className="shrink-0 px-5 py-3.5 border-b border-[var(--color-pv-border-soft)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    aria-label="Back to conversations"
                    className="xl:hidden p-1.5 -ml-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <div
                    className="w-9 h-9 rounded-full bg-[var(--color-pv-tile-2-bg)] text-[var(--color-pv-tile-2-fg)] flex items-center justify-center text-[12px] font-bold"
                    aria-hidden="true"
                  >
                    {nameInitials(activeChat.other_user?.full_name)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900 leading-tight">
                      {activeChat.other_user?.full_name ?? 'Patient'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <Badge role="provider" variant="success" data-testid="v2-online-badge">
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    aria-label="Voice call (unavailable)"
                    disabled
                    className="p-2 rounded-[var(--sq-xs)] text-slate-300 cursor-not-allowed"
                  >
                    <Phone size={17} aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Video call (unavailable)"
                    disabled
                    className="p-2 rounded-[var(--sq-xs)] text-slate-300 cursor-not-allowed"
                  >
                    <Video size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Messages body — day-grouped */}
              <div
                className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/20"
                data-testid="v2-messages-body"
                aria-live="polite"
                aria-label="Message thread"
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pv-primary)]" aria-hidden="true" />
                  </div>
                ) : messagesError ? (
                  <button
                    className="text-[13px] text-rose-600 hover:underline mx-auto block"
                    onClick={() => void refetchMessages()}
                  >
                    <AlertCircle className="inline w-4 h-4 mr-1" aria-hidden="true" />
                    Couldn&apos;t load thread — retry
                  </button>
                ) : dayGroups.length === 0 ? (
                  <p className="text-[13px] text-slate-400 text-center py-8">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  dayGroups.map(({ dayKey, label, messages: dayMsgs }) => (
                    <div key={dayKey} className="space-y-3">
                      {/* Day divider */}
                      <div
                        className="flex items-center gap-3"
                        data-testid={`v2-day-divider-${dayKey}`}
                      >
                        <span className="flex-1 border-t border-slate-200" aria-hidden="true" />
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {label}
                        </span>
                        <span className="flex-1 border-t border-slate-200" aria-hidden="true" />
                      </div>

                      {/* Messages */}
                      {dayMsgs.map((msg) => {
                        const isSent = msg.sender_id !== activeChat.other_user?.id
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              'flex flex-col max-w-[82%] sm:max-w-[68%]',
                              isSent ? 'ml-auto items-end' : 'items-start'
                            )}
                          >
                            <div
                              className={cn(
                                'px-4 py-2.5 rounded-[var(--sq-lg)] text-[13px] leading-relaxed shadow-sm',
                                isSent
                                  ? 'bg-[var(--color-pv-primary)] text-white rounded-tr-none'
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                              )}
                            >
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 px-1">
                              <span className="text-[10px] text-slate-400">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {isSent &&
                                (msg.read_at ? (
                                  <CheckCheck size={11} className="text-[var(--color-pv-primary)]" aria-label="Read" />
                                ) : (
                                  <Clock size={11} className="text-slate-300" aria-label="Sent" />
                                ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose bar */}
              <div className="shrink-0 p-4 border-t border-[var(--color-pv-border-soft)]">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      rows={1}
                      placeholder="Type a message…"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      aria-label="Message input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (messageText.trim()) sendMessageMutation.mutate(messageText.trim())
                        }
                      }}
                      className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[13px] focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none transition-all resize-none"
                    />
                    <button
                      onClick={() =>
                        messageText.trim() && sendMessageMutation.mutate(messageText.trim())
                      }
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      aria-label="Send message"
                      data-testid="v2-send-btn"
                      className="absolute right-1.5 top-1.5 w-8 h-8 bg-[var(--color-pv-primary)] text-white rounded-[var(--sq-xs)] flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Send size={15} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyThread />
          )}
        </div>
      </div>
    </div>
  )
}
