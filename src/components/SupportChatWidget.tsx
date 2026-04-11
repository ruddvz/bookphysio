'use client'

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport, type UIMessage } from 'ai'
import { MessageCircle, X, Send, Bot, Users, Minimize2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const QUICK_REPLIES = [
  'How do I book a session?',
  'What does a physio session involve?',
  'Do you offer home visits?',
  'What are your pricing plans?',
]

const INITIAL_MESSAGE: UIMessage = {
  id: 'support-intro',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hi! 👋 I'm the BookPhysio support assistant. I can help you with booking, sessions, pricing, and anything else about our platform. What can I help you with?",
    },
  ],
}

function getUIMessageText(message: UIMessage): string {
  return message.parts.reduce((text, part) => {
    return part.type === 'text' ? `${text}${part.text}` : text
  }, '')
}

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const transport = useMemo(
    () =>
      new TextStreamChatTransport<UIMessage>({
        api: '/api/chat/support',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages: messages.flatMap((message) => {
              if (message.role !== 'user' && message.role !== 'assistant') return []
              const content = getUIMessageText(message).trim()
              return content ? [{ role: message.role, content }] : []
            }),
          },
        }),
      }),
    []
  )

  const { messages, sendMessage, status } = useChat<UIMessage>({
    messages: [INITIAL_MESSAGE],
    transport,
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true)
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
      inputRef.current?.focus()
    }
  }, [isOpen])

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextInput = input.trim()
    if (!nextInput || isLoading) return
    setInput('')
    void sendMessage({ text: nextInput }).catch(() => {
      setInput(nextInput)
    })
  }

  function handleQuickReply(reply: string) {
    if (isLoading) return
    void sendMessage({ text: reply }).catch(() => {})
  }

  const showQuickReplies = messages.length === 1

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="BookPhysio support chat"
          className="fixed bottom-24 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-bp-border bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.35)] sm:right-6 animate-in slide-in-from-bottom-4 duration-300"
          style={{ maxHeight: 'min(560px, calc(100vh - 7rem))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-bp-border bg-bp-primary px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">BookPhysio Support</p>
                <p className="text-[11px] text-white/60">Replies instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/patient/motio"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Open full AI chat"
              >
                <ExternalLink size={15} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close support chat"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          >
            {messages.map((message) => {
              const isUser = message.role === 'user'
              const text = getUIMessageText(message)
              if (!text) return null

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-2',
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bp-accent/10 text-bp-accent">
                      <Bot size={14} />
                    </div>
                  )}
                  {isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bp-primary text-white">
                      <Users size={14} />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-4 py-3 text-[14px] font-medium leading-relaxed',
                      isUser
                        ? 'rounded-br-none bg-bp-accent text-white'
                        : 'rounded-bl-none border border-bp-border bg-[#fafbfc] text-bp-primary'
                    )}
                  >
                    {text}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bp-accent/10 text-bp-accent">
                  <Bot size={14} className="animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-bl-none border border-bp-border bg-[#fafbfc] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-bp-accent" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-bp-accent [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-bp-accent [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {showQuickReplies && (
            <div className="flex flex-wrap gap-2 border-t border-bp-border px-5 py-3">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleQuickReply(reply)}
                  disabled={isLoading}
                  className="rounded-full border border-bp-border bg-white px-3 py-1.5 text-[11px] font-bold text-bp-primary transition-all hover:border-bp-accent/30 hover:text-bp-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-bp-border bg-[#fafbfc] px-4 py-3"
          >
            <label htmlFor={inputId} className="sr-only">
              Ask a support question
            </label>
            <input
              id={inputId}
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-full border border-bp-border bg-white px-4 py-2.5 text-[14px] font-medium text-bp-primary outline-none placeholder:text-bp-body/40 focus:border-bp-accent/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
                input.trim() && !isLoading
                  ? 'bg-bp-primary text-white hover:bg-bp-accent active:scale-95'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              )}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
        className={cn(
          'fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_32px_-8px_rgba(0,118,108,0.6)] transition-all sm:right-6',
          isOpen ? 'bg-bp-primary hover:bg-bp-primary/90' : 'bg-bp-accent hover:bg-bp-primary'
        )}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
        {hasNewMessage && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            1
          </span>
        )}
      </button>
    </>
  )
}
