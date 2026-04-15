'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  AlertCircle,
  MessageSquare,
  Send,
  Paperclip,
  Phone,
  Video,
  CheckCheck,
  Clock,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/app/api/contracts/message'
import {
  formatConversationDateDivider,
  formatConversationMessageTime,
  formatConversationTimestamp,
} from '@/lib/messaging/time'
import {
  PageHeader,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'

const EMPTY_MESSAGES: Message[] = []

export default function ProviderMessages() {
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
    staleTime: 30000,
  })

  const conversations = conversationsData?.conversations || []
  const activeChat = conversations.find(c => c.id === selectedConversationId) || null
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
    staleTime: 10000,
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

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8 h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <PageHeader
        role="provider"
        title="Your interactions"
        subtitle="Communicate directly with your patients"
      />

      <div className="flex-1 min-h-0 flex gap-6">
        {/* Sidebar: Conversations */}
        <div className={cn(
          "w-full xl:w-[360px] xl:shrink-0 flex flex-col min-h-0 space-y-4",
          selectedConversationId && "hidden xl:flex"
        )}>
          <div className="relative group">
            <input
              type="search"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[var(--sq-sm)] text-[14px] focus:ring-2 focus:ring-[var(--color-pv-primary)] transition-all outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pv-primary)]" />
          </div>

          <SectionCard role="provider" title="Recent chats" className="flex-1 overflow-hidden flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-2">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--color-pv-primary)]" />
                </div>
              ) : conversationsError ? (
                <EmptyState
                  role="provider"
                  icon={AlertCircle}
                  title="Couldn&apos;t load conversations"
                  description="There was an error fetching your message list."
                  cta={{ label: 'Retry', onClick: () => void refetchConversations() }}
                />
              ) : conversations.length === 0 ? (
                <EmptyState
                  role="provider"
                  icon={MessageSquare}
                  title="Inbox is empty"
                  description="Messages from your patients will appear here."
                />
              ) : (
                <div className="divide-y divide-[var(--color-pv-border-soft)]">
                  {conversations.map((chat) => (
                    <ListRow
                      key={chat.id}
                      role="provider"
                      icon={MessageSquare}
                      tone={1}
                      primary={chat.other_user?.full_name || 'Patient'}
                      secondary={chat.last_message?.content || 'No messages yet'}
                      right={
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatConversationTimestamp(chat.last_message_at || chat.created_at)}
                          </span>
                          {chat.unread_count > 0 && (
                            <div className="w-4 h-4 rounded-full bg-[var(--color-pv-primary)] text-white text-[9px] font-bold flex items-center justify-center">
                              {chat.unread_count}
                            </div>
                          )}
                        </div>
                      }
                      onClick={() => setSelectedConversationId(chat.id)}
                      className={cn(selectedConversationId === chat.id && 'bg-slate-50')}
                    />
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Main Content: Chat Thread */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0 bg-white rounded-[var(--sq-lg)] border border-[var(--color-pv-border)] overflow-hidden",
          !selectedConversationId && "hidden xl:flex opacity-60 pointer-events-none"
        )}>
          {activeChat ? (
            <>
              {/* Thread Header */}
              <div className="px-6 py-4 border-b border-[var(--color-pv-border-soft)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    aria-label="Back to conversations"
                    className="xl:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-pv-tile-1-bg)] text-[var(--color-pv-primary)] flex items-center justify-center font-bold">
                    {(activeChat.other_user?.full_name || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-none mb-1">
                      {activeChat.other_user?.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-slate-400">Available</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="Voice call unavailable" className="p-2 rounded-[var(--sq-xs)] hover:bg-slate-50 text-slate-400" disabled><Phone size={18} /></button>
                  <button aria-label="Video call unavailable" className="p-2 rounded-[var(--sq-xs)] hover:bg-slate-50 text-slate-400" disabled><Video size={18} /></button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pv-primary)]" />
                  </div>
                ) : messagesError ? (
                  <EmptyState
                    role="provider"
                    icon={AlertCircle}
                    title="Couldn&apos;t load this conversation"
                    description="There was an error fetching the thread history."
                    cta={{ label: 'Retry', onClick: () => void refetchMessages() }}
                  />
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[14px] text-slate-400">No messages yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-2">
                       <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                         {formatConversationDateDivider(messages[0]?.created_at || '')}
                       </span>
                    </div>
                    {messages.map((msg) => {
                      const isSent = msg.sender_id !== activeChat?.other_user?.id
                      return (
                        <div key={msg.id} className={cn(
                          "flex flex-col max-w-[85%] sm:max-w-[70%]",
                          isSent ? "ml-auto items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "px-4 py-2.5 rounded-[var(--sq-lg)] text-[14px] leading-relaxed shadow-sm",
                            isSent
                              ? "bg-[var(--color-pv-primary)] text-white rounded-tr-sm"
                              : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                          )}>
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <span className="text-[10px] text-slate-400">
                              {formatConversationMessageTime(msg.created_at)}
                            </span>
                            {isSent && (
                              msg.read_at ? <CheckCheck size={12} className="text-[var(--color-pv-primary)]" /> : <Clock size={12} className="text-slate-300" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[var(--color-pv-border-soft)]">
                <div className="flex items-center gap-3">
                  <button aria-label="Attach file" className="w-10 h-10 rounded-[var(--sq-sm)] border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50" disabled>
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      rows={1}
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (messageText.trim()) sendMessageMutation.mutate(messageText.trim())
                        }
                      }}
                      className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none transition-all resize-none"
                    />
                    <button
                      onClick={() => messageText.trim() && sendMessageMutation.mutate(messageText.trim())}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      aria-label="Send message"
                      className="absolute right-1.5 top-1.5 w-8 h-8 bg-[var(--color-pv-primary)] text-white rounded-[var(--sq-xs)] flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {sendMessageMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 rounded-[var(--sq-lg)] bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-[18px] font-bold text-slate-900 mb-1">Select a conversation</h3>
              <p className="text-[14px] text-slate-500 max-w-xs">
                Choose a patient from the list to view your message history and start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
