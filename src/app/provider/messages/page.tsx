'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MessageSquare, Send, Paperclip, MoreVertical, Phone, Video, CheckCheck, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/app/api/contracts/message'
import {
  formatConversationDateDivider,
  formatConversationMessageTime,
  formatConversationTimestamp,
} from '@/lib/messaging/time'

const EMPTY_MESSAGES: Message[] = []

export default function ProviderMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
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

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ['provider-messages', activeUserId] })
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] })
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
      ['provider-conversations'],
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
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-8 h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tighter leading-none mb-2">
            Patient Messages
          </h1>
          <p className="text-[15px] font-medium text-slate-500">Communicate with your patients about their treatment.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-2xl flex overflow-hidden relative">
        {/* -- Left Pane: Conversations -- */}
        <div className={cn(
          "w-full md:w-[380px] border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 transition-all",
          selectedConversationId && "hidden md:flex"
        )}>
          <div className="p-6 border-b border-slate-200 bg-white">
            <div className="relative group">
              <input
                type="search"
                placeholder="Search patients..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500/40 group-focus-within:text-emerald-600" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[14px] font-medium text-slate-500/40">No patient conversations yet</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedConversationId(chat.id)}
                  className={cn(
                    "w-full p-4 rounded-[24px] flex items-center gap-4 transition-all duration-300 group",
                    selectedConversationId === chat.id ? "bg-white shadow-xl shadow-slate-900/5 translate-x-2 border border-emerald-600/10" : "hover:bg-white/60"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold transition-transform duration-500 group-hover:scale-105",
                      selectedConversationId === chat.id ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-500/40"
                    )}>
                      {(chat.other_user?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[15px] font-bold text-slate-900 truncate">{chat.other_user?.full_name || 'Unknown'}</span>
                      <span className="text-[11px] font-bold text-slate-500/40 whitespace-nowrap ml-2">{formatConversationTimestamp(chat.last_message_at || chat.created_at)}</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-500/40 truncate leading-tight mb-1">Patient</p>
                    <p className={cn(
                      "text-[13px] truncate",
                      chat.unread_count > 0 ? "text-emerald-600 font-bold" : "text-slate-500/40 font-medium"
                    )}>
                      {chat.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-emerald-600/30">
                      {chat.unread_count}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* -- Right Pane: Chat Area -- */}
        <div className={cn(
          "flex-1 flex flex-col bg-white transition-all",
          !selectedConversationId && "hidden md:flex"
        )}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button aria-label="Back to conversation list" title="Back to conversation list" onClick={() => setSelectedConversationId(null)} className="md:hidden p-2 -ml-2 text-slate-500/40 hover:text-slate-900">
                     <MessageSquare size={24} />
                  </button>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[18px]">
                    {(activeChat?.other_user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-900 leading-none mb-1">{activeChat?.other_user?.full_name || 'Loading...'}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                       <span className="text-[12px] font-bold text-slate-500/40 tracking-tight">
                         Away
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Voice call unavailable" title="Voice call unavailable" className="p-3 rounded-xl hover:bg-slate-50 text-slate-500/40 transition-colors" disabled><Phone size={20} /></button>
                  <button aria-label="Video call unavailable" title="Video call unavailable" className="p-3 rounded-xl hover:bg-slate-50 text-slate-500/40 transition-colors" disabled><Video size={20} /></button>
                  <button aria-label="More actions unavailable" title="More actions unavailable" className="p-3 rounded-xl hover:bg-slate-50 text-slate-500/40 transition-colors" disabled><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Grid */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F9FBFC]/30">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[14px] font-medium text-slate-500/40">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <span className="px-4 py-1.5 bg-slate-50 rounded-full text-[11px] font-bold text-slate-500/40 uppercase tracking-widest">
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
                            "px-6 py-4 rounded-[24px] shadow-sm relative group transition-all duration-300",
                            isSent
                              ? "bg-emerald-600 text-white rounded-tr-none"
                              : "bg-white border border-slate-200 text-slate-900 rounded-tl-none"
                          )}>
                            <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 px-2">
                            <span className="text-[11px] font-bold text-slate-500/40">
                              {formatConversationMessageTime(msg.created_at)}
                            </span>
                            {isSent && (
                              msg.read_at ? <CheckCheck size={14} className="text-emerald-600" /> : <Clock size={14} className="text-slate-500/30" />
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
              <div className="p-6 md:p-8 bg-white border-t border-slate-200">
                <div className="relative flex items-center gap-4 max-w-[900px] mx-auto">
                   <button aria-label="Attachments unavailable" title="Attachments unavailable" className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-500/40 hover:bg-slate-50 transition-colors shrink-0" disabled>
                      <Paperclip size={20} />
                   </button>
                   <div className="flex-1 relative">
                     <textarea
                       rows={1}
                       placeholder="Message your patient..."
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
                       className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-[15px] font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500/40"
                     />
                     <button
                       onClick={() => {
                         if (messageText.trim()) {
                           sendMessageMutation.mutate(messageText.trim())
                         }
                       }}
                       disabled={sendMessageMutation.isPending || !messageText.trim()}
                       className="absolute right-2 top-2 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {sendMessageMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     </button>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50/30">
              <div className="text-center px-10 max-w-sm">
                <div className="w-24 h-24 mx-auto rounded-[32px] bg-white border border-slate-200 shadow-xl flex items-center justify-center mb-8 rotate-3">
                  <MessageSquare size={40} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <h2 className="text-[24px] font-bold text-slate-900 tracking-tight mb-3">Patient Care Communication</h2>
                <p className="text-[15px] font-medium text-slate-500/40 leading-relaxed">
                  Select a patient from your active conversations to send secure messages about their treatment and appointments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
