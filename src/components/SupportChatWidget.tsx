'use client'

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport, type UIMessage } from 'ai'
import { MessageCircle, X, Send, User, Minimize2, ExternalLink, Stethoscope, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/* ── Condition quick-picks shown on homepage ── */
const CONDITION_CHIPS = [
  { label: 'Back pain', emoji: '🦴' },
  { label: 'Knee injury', emoji: '🦵' },
  { label: 'Neck stiffness', emoji: '🧏' },
  { label: 'Sports injury', emoji: '⚽' },
  { label: 'Post-surgery rehab', emoji: '🏥' },
  { label: 'Shoulder pain', emoji: '💪' },
]

const GENERAL_QUICK_REPLIES = [
  'How do I book a session?',
  'Do you offer home visits?',
  'What are your pricing plans?',
]

function getUIMessageText(message: UIMessage): string {
  return message.parts.reduce((text, part) => {
    return part.type === 'text' ? `${text}${part.text}` : text
  }, '')
}

export function SupportChatWidget() {
  const pathname = usePathname()
  // /hi is the Hindi landing page — show condition picker there too
  const isHomePage = pathname === '/' || pathname === '/hi'

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [lastSeenCount, setLastSeenCount] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const initialMessage = useMemo<UIMessage>(() => ({
    id: 'support-intro',
    role: 'assistant' as const,
    parts: [
      {
        type: 'text' as const,
        text: isHomePage
          ? "Hi! 👋 I'm your BookPhysio assistant. Tell me — what condition or pain are you dealing with? I'll help you find the right physiotherapist."
          : "Hi! 👋 I'm the BookPhysio support assistant. I can help with booking, sessions, pricing, and anything about our platform.",
      },
    ],
  }), [isHomePage])

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

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    messages: [initialMessage],
    transport,
  })

  const isLoading = status === 'submitted' || status === 'streaming'
  const hasError = status === 'error'
  const hasNewMessage = !isOpen && messages.length > lastSeenCount

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  function handleToggle() {
    setIsOpen((prev) => {
      setLastSeenCount(messages.length)
      return !prev
    })
  }

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

  const showQuickActions = messages.length === 1

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="BookPhysio support chat"
          className="fixed bottom-20 right-3 z-50 flex w-[380px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--color-bp-border)] bg-white shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] sm:right-5"
          style={{ maxHeight: 'min(600px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-[var(--color-bp-primary)] to-[var(--color-bp-primary-dark)] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/20">
                <Stethoscope size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-white tracking-tight">Bookphysio.in Support</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] text-white/70 font-medium">Online now</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/patient/motio"
                aria-label="Open full AI chat"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Open full AI chat"
              >
                <ExternalLink size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Minimize chat"
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-bp-surface)] px-4 py-4"
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
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bp-primary-light)] text-[var(--color-bp-primary)]">
                      <Stethoscope size={13} />
                    </div>
                  )}
                  {isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bp-primary)] text-white">
                      <User size={13} />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                      isUser
                        ? 'rounded-br-sm bg-[var(--color-bp-primary)] text-white font-medium'
                        : 'rounded-bl-sm border border-[var(--color-bp-border-soft)] bg-white text-[var(--color-bp-body)] shadow-sm'
                    )}
                  >
                    {text}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bp-primary-light)] text-[var(--color-bp-primary)]">
                  <Stethoscope size={13} className="animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-[var(--color-bp-border-soft)] bg-white px-3.5 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-bp-primary)]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-bp-primary)] [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-bp-primary)] [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}

            {hasError && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                  <Stethoscope size={13} />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-rose-700 shadow-sm">
                  {error?.message?.includes('429')
                    ? 'Too many requests — please wait a moment and try again.'
                    : 'Sorry, I couldn\'t process that. Please try again or email support@bookphysio.in for help.'}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions — condition chips on home, general quick replies elsewhere */}
          {showQuickActions && (
            <div className="border-t border-[var(--color-bp-border-soft)] bg-white px-4 py-3">
              {isHomePage ? (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-bp-muted)] mb-2">
                    Select your condition
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CONDITION_CHIPS.map(({ label, emoji }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleQuickReply(`I have ${label.toLowerCase()}`)}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl border border-[var(--color-bp-border)] bg-[var(--color-bp-surface)] px-3 py-2 text-[12px] font-medium text-[var(--color-bp-body)] transition-all hover:border-[var(--color-bp-primary-muted)] hover:bg-[var(--color-bp-primary-light)] hover:text-[var(--color-bp-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>{emoji}</span>
                        <span className="truncate">{label}</span>
                        <ChevronRight size={12} className="ml-auto shrink-0 text-[var(--color-bp-muted)]" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {GENERAL_QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => handleQuickReply(reply)}
                      disabled={isLoading}
                      className="rounded-full border border-[var(--color-bp-border)] bg-[var(--color-bp-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-bp-body)] transition-all hover:border-[var(--color-bp-primary-muted)] hover:text-[var(--color-bp-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-[var(--color-bp-border-soft)] bg-white px-3 py-2.5"
          >
            <label htmlFor={inputId} className="sr-only">
              {isHomePage ? 'Describe your condition…' : 'Ask a question…'}
            </label>
            <input
              id={inputId}
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder={isHomePage ? 'Describe your condition…' : 'Ask a question…'}
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-xl border border-[var(--color-bp-border)] bg-[var(--color-bp-surface)] px-3.5 py-2.5 text-[13px] text-[var(--color-bp-body)] outline-none placeholder:text-[var(--color-bp-muted)]/60 focus:border-[var(--color-bp-primary-muted)] focus:ring-1 focus:ring-[var(--color-bp-primary-muted)] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                input.trim() && !isLoading
                  ? 'bg-[var(--color-bp-primary)] text-white hover:bg-[var(--color-bp-primary-dark)] active:scale-95 shadow-sm'
                  : 'cursor-not-allowed bg-[var(--color-bp-border-soft)] text-[var(--color-bp-muted)]'
              )}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
        className={cn(
          'fixed bottom-5 right-3 z-50 flex items-center justify-center rounded-full transition-all duration-200 sm:right-5',
          isOpen
            ? 'h-12 w-12 bg-[var(--color-bp-primary)] hover:bg-[var(--color-bp-primary-dark)] shadow-lg'
            : 'h-14 w-14 bg-[var(--color-bp-accent)] hover:bg-[var(--color-bp-primary)] shadow-[0_6px_24px_-4px_rgba(255,107,53,0.5)]'
        )}
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
        {hasNewMessage && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {messages.length - lastSeenCount}
          </span>
        )}
      </button>
    </>
  )
}
