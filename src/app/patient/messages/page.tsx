'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MessageSquare, Send, Paperclip, MoreVertical, Phone, Video, CheckCheck, Clock, UserCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation, Message } from '@/app/api/contracts/message'

const EMPTY_MESSAGES: Message[] = []

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  if (diffMins < 1440 * 2) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

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

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-8 h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-black text-[#333333] tracking-tighter leading-none mb-2">
            Care Messages
          </h1>
          <p className="text-[15px] font-medium text-[#666666]">Direct access to your physiotherapy experts.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[12px] font-black text-[#00766C]">
                   {['SK', 'PS', 'RV'][i-1]}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-[#E6F4F3] flex items-center justify-center text-[10px] font-black text-[#00766C]">
                 +5
              </div>
           </div>
           <p className="text-[12px] font-black text-gray-400 border-l border-gray-200 pl-4 uppercase tracking-widest">Active Experts</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-2xl flex overflow-hidden relative">
        
        {/* ── Left Pane: Conversations ── */}
        <div className={cn(
          "w-full md:w-[380px] border-r border-gray-100 flex flex-col bg-gray-50/50 shrink-0 transition-all",
          selectedConversationId && "hidden md:flex"
        )}>
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="relative group">
              <input 
                type="search" 
                placeholder="Search conversations..." 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-[18px] text-[14px] font-bold text-[#333333] focus:bg-white focus:border-[#00766C] focus:ring-4 focus:ring-[#00766C]/5 outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00766C]" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#00766C]" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[14px] font-medium text-gray-400">No conversations yet</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedConversationId(chat.id)}
                  className={cn(
                    "w-full p-4 rounded-[24px] flex items-center gap-4 transition-all duration-300 group",
                    selectedConversationId === chat.id ? "bg-white shadow-xl shadow-teal-900/5 translate-x-2 border border-teal-50" : "hover:bg-white/60"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-black transition-transform duration-500 group-hover:scale-105",
                      selectedConversationId === chat.id ? "bg-[#00766C] text-white" : "bg-white border border-gray-100 text-gray-400"
                    )}>
                      {(chat.other_user?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[15px] font-black text-[#333333] truncate">{chat.other_user?.full_name || 'Unknown'}</span>
                      <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap ml-2">{formatTime(chat.last_message_at || chat.created_at)}</span>
                    </div>
                    <p className="text-[13px] font-bold text-gray-400 truncate leading-tight mb-1">{chat.other_user?.role === 'provider' ? 'Physiotherapist' : 'Patient'}</p>
                    <p className={cn(
                      "text-[13px] truncate",
                      chat.unread_count > 0 ? "text-[#00766C] font-black" : "text-gray-400 font-medium"
                    )}>
                      {chat.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="w-6 h-6 rounded-full bg-[#00766C] text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-teal-200">
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
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button aria-label="Back to conversation list" title="Back to conversation list" onClick={() => setSelectedConversationId(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-[#333333]">
                     <UserCircle size={24} />
                  </button>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#00766C] font-black text-[18px]">
                    {(activeChat?.other_user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-[#333333] leading-none mb-1">{activeChat?.other_user?.full_name || 'Loading...'}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                       <span className="text-[12px] font-bold text-gray-400 tracking-tight">
                         Away
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Voice call unavailable" title="Voice call unavailable" className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors" disabled><Phone size={20} /></button>
                  <button aria-label="Video call unavailable" title="Video call unavailable" className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors" disabled><Video size={20} /></button>
                  <button aria-label="More actions unavailable" title="More actions unavailable" className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors" disabled><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Grid */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F9FBFC]/30">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00766C]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[14px] font-medium text-gray-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(messages[0]?.created_at || '').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
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
                              ? "bg-[#333333] text-white rounded-tr-none"
                              : "bg-white border border-gray-100 text-[#333333] rounded-tl-none"
                          )}>
                            <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 px-2">
                            <span className="text-[11px] font-bold text-gray-400">
                              {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            {isSent && (
                              msg.read_at ? <CheckCheck size={14} className="text-[#00766C]" /> : <Clock size={14} className="text-gray-300" />
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
              <div className="p-6 md:p-8 bg-white border-t border-gray-100">
                <div className="relative flex items-center gap-4 max-w-[900px] mx-auto">
                   <button aria-label="Attachments unavailable" title="Attachments unavailable" className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors shrink-0" disabled>
                      <Paperclip size={20} />
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
                       className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-[15px] font-medium text-[#333333] focus:bg-white focus:border-[#00766C] focus:ring-4 focus:ring-[#00766C]/5 outline-none transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400"
                     />
                     <button
                       onClick={() => {
                         if (messageText.trim()) {
                           sendMessageMutation.mutate(messageText.trim())
                         }
                       }}
                       disabled={sendMessageMutation.isPending || !messageText.trim()}
                       className="absolute right-2 top-2 w-10 h-10 bg-[#00766C] text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-200 hover:bg-[#005A52] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {sendMessageMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     </button>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50/30">
              <div className="text-center px-10 max-w-sm">
                <div className="w-24 h-24 mx-auto rounded-[32px] bg-white border border-gray-100 shadow-xl flex items-center justify-center mb-8 rotate-3">
                  <MessageSquare size={40} className="text-[#00766C]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[24px] font-black text-[#333333] tracking-tight mb-3">Direct Care Access</h2>
                <p className="text-[15px] font-medium text-gray-400 leading-relaxed">
                  Select a provider from your care network to start a secure conversation about your treatment.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                    <p className="text-[18px] font-black text-[#333333]">3</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Experts</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                    <p className="text-[18px] font-black text-[#00766C]">24h</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Avg Response</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
