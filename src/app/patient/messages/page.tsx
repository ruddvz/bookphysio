'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MessageSquare, Send, Paperclip, MoreVertical, Phone, Video, CheckCheck, Clock, UserCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/app/api/contracts/message'
import {
  formatConversationDateDivider,
  formatConversationMessageTime,
  formatConversationTimestamp,
} from '@/lib/messaging/time'

const EMPTY_MESSAGES: Message[] = []

export default function PatientMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
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

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeUserId],
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

  // Send message mutation
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
      queryClient.invalidateQueries({ queryKey: ['messages', activeUserId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setMessageText('')
    },
  })

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedConversationId || !messagesData) {
      return
    }

    queryClient.setQueryData<{ conversations: Conversation[]; total: number }>(
      ['conversations'],
      (current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          conversations: current.conversations.map((conversation) => (
            conversation.id === selectedConversationId
              ? { ...conversation, unread_count: 0 }
              : conversation
          )),
        }
      },
    )
  }, [messagesData, queryClient, selectedConversationId])

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-6 h-[calc(100vh-56px)] flex flex-col animate-in fade-in duration-500">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1">
            Messages
          </h1>
          <p className="text-[14px] text-slate-500">Communicate with your physiotherapy providers.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg flex overflow-hidden relative">
        
        {/* ── Left Pane: Conversations ── */}
        <div className={cn(
          "w-full md:w-[360px] border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 transition-all",
          selectedConversationId && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative group">
              <input
                type="search"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[14px] text-slate-400">No conversations yet</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedConversationId(chat.id)}
                  className={cn(
                    "w-full p-3 rounded-xl flex items-center gap-3 transition-all group",
                    selectedConversationId === chat.id ? "bg-white shadow-sm border border-blue-100" : "hover:bg-white/80"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold",
                      selectedConversationId === chat.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-400"
                    )}>
                      {(chat.other_user?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[14px] font-semibold text-slate-900 truncate">{chat.other_user?.full_name || 'Unknown'}</span>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2">{formatConversationTimestamp(chat.last_message_at || chat.created_at)}</span>
                    </div>
                    <p className="text-[12px] text-slate-400 truncate leading-tight mb-0.5">{chat.other_user?.role === 'provider' ? 'Physiotherapist' : 'Patient'}</p>
                    <p className={cn(
                      "text-[13px] truncate",
                      chat.unread_count > 0 ? "text-blue-600 font-semibold" : "text-slate-400"
                    )}>
                      {chat.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {chat.unread_count}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right Pane: Chat Area ── */}
        <div className={cn(
          "flex-1 flex flex-col bg-white transition-all",
          !selectedConversationId && "hidden md:flex"
        )}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button aria-label="Back to conversation list" title="Back to conversation list" onClick={() => setSelectedConversationId(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900">
                     <UserCircle size={22} />
                  </button>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[16px]">
                    {(activeChat?.other_user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900 leading-none mb-1">{activeChat?.other_user?.full_name || 'Loading...'}</h3>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                       <span className="text-[11px] text-slate-400">Away</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="Voice call unavailable" title="Voice call unavailable" className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors" disabled><Phone size={18} /></button>
                  <button aria-label="Video call unavailable" title="Video call unavailable" className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors" disabled><Video size={18} /></button>
                  <button aria-label="More actions unavailable" title="More actions unavailable" className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors" disabled><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages Grid */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[14px] text-slate-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-3">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] text-slate-400 uppercase tracking-wider">
                        {formatConversationDateDivider(messages[0]?.created_at || '')}
                      </span>
                    </div>

                    {messages.map((msg) => {
                      const isSent = msg.sender_id !== activeChat?.other_user?.id
                      return (
                        <div key={msg.id} className={cn(
                          "flex flex-col max-w-[80%] md:max-w-[70%]",
                          isSent ? "ml-auto items-end" : "mr-auto items-start"
                        )}>
                          <div className={cn(
                            "px-5 py-3 rounded-2xl shadow-sm",
                            isSent
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white border border-slate-200 text-slate-900 rounded-tl-sm"
                          )}>
                            <p className="text-[14px] leading-relaxed">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 px-1">
                            <span className="text-[11px] text-slate-400">
                              {formatConversationMessageTime(msg.created_at)}
                            </span>
                            {isSent && (
                              msg.read_at ? <CheckCheck size={13} className="text-blue-500" /> : <Clock size={13} className="text-slate-300" />
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
              <div className="p-4 md:p-6 bg-white border-t border-slate-200">
                <div className="relative flex items-center gap-3 max-w-[900px] mx-auto">
                   <button aria-label="Attachments unavailable" title="Attachments unavailable" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shrink-0" disabled>
                      <Paperclip size={18} />
                   </button>
                   <div className="flex-1 relative">
                     <textarea
                       rows={1}
                       placeholder="Message your physio..."
                       value={messageText}
                       onChange={(e) => setMessageText(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault()
                           if (messageText.trim()) {
                             sendMessageMutation.mutate(messageText.trim())
                           }
                         }
                       }}
                       disabled={sendMessageMutation.isPending}
                       className="w-full pl-5 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-400"
                     />
                     <button
                       onClick={() => {
                         if (messageText.trim()) {
                           sendMessageMutation.mutate(messageText.trim())
                         }
                       }}
                       disabled={sendMessageMutation.isPending || !messageText.trim()}
                       className="absolute right-2 top-1.5 w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {sendMessageMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                     </button>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50/30">
              <div className="text-center px-10 max-w-sm">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6">
                  <MessageSquare size={28} className="text-blue-500" />
                </div>
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight mb-2">Select a conversation</h2>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  Choose a provider from your conversations to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
