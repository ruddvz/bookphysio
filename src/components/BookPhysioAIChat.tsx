'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport, type UIMessage } from 'ai'
import {
  type LucideIcon,
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  HeartPulse,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
  BrainCircuit,
  Microscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AIChatVariant = 'patient' | 'provider'

type AceExpression = 'neutral' | 'happy' | 'thinking' | 'caring'

export type BookPhysioAIMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

type Tone = 'teal' | 'emerald' | 'amber' | 'slate' | 'violet'

type MetricCard = {
  label: string
  value: string
  caption: string
  icon: LucideIcon
  tone: Tone
}

type RailCard = {
  label: string
  title: string
  detail: string
  icon: LucideIcon
  href?: string
  cta?: string
  tone: Tone
}

type VariantCopy = {
  eyebrow: string
  title: string
  description: string
  modeLabel: string
  liveNote: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  quickPrompts: string[]
  metrics: MetricCard[]
  safetyTitle: string
  safetyPoints: string[]
  railTitle: string
  railCards: RailCard[]
  footerNote: string
  contextLabel: string
}

interface BookPhysioAIChatProps {
  variant: AIChatVariant
  api: string
  initialMessages: BookPhysioAIMessage[]
}

const TONE_STYLES: Record<Tone, { icon: string; badge: string; panel: string }> = {
  teal: { icon: 'bg-bp-accent/10 text-bp-accent', badge: 'bg-bp-accent/10 text-bp-accent border-bp-accent/20', panel: 'from-bp-accent/5 to-white' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', panel: 'from-emerald-50/70 to-white' },
  amber: { icon: 'bg-amber-50 text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-100', panel: 'from-amber-50/70 to-white' },
  slate: { icon: 'bg-slate-50 text-slate-700', badge: 'bg-slate-50 text-slate-700 border-slate-100', panel: 'from-slate-50/80 to-white' },
  violet: { icon: 'bg-violet-50 text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-100', panel: 'from-violet-50/70 to-white' },
}

/**
 * Functional Ace Mascot
 * Designed with Apple/Silicon Valley sophisticated minimalism.
 * Supports functional emotional states based on AI reply context.
 */
function AceMascot({ expression = 'neutral', className }: { expression?: AceExpression; className?: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
      <circle cx="24" cy="24" r="24" fill="#00766C"/>
      
      <defs>
        <radialGradient id="ace-depth" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 24) rotate(90) scale(24)">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <filter id="ace-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle cx="24" cy="24" r="24" fill="url(#ace-depth)"/>

      <g filter="url(#ace-shadow)" transform="translate(12, 11)">
        <path d="M12 4.5C8.5 4.5 5.5 7.5 5.5 11C5.5 14.5 8.5 17.5 12 17.5C15.5 17.5 18.5 14.5 18.5 11C18.5 7.5 15.5 4.5 12 4.5Z" fill="white" fillOpacity="0.95"/>
        <path d="M4 23C4 18 7.5 15.5 12 15.5C16.5 15.5 20 18 20 23" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        
        <g transform="translate(12, 11.5)">
          {expression === 'thinking' && (
            <g transform="translate(-4, -1)">
              <circle cx="0.5" cy="0" r="1.2" fill="#00766C" />
              <circle cx="7.5" cy="0" r="1.2" fill="#00766C" />
              <path d="M2.5 4 Q4 5 5.5 4" stroke="#00766C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
          )}
          {expression === 'happy' && (
            <g transform="translate(-4, -1)">
              <path d="M-0.5 -1 Q1.5 -3 3.5 -1" stroke="#00766C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M4.5 -1 Q6.5 -3 8.5 -1" stroke="#00766C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M1 4 Q4 7 7 4" stroke="#00766C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          )}
          {expression === 'caring' && (
            <g transform="translate(-4, -1)">
              <circle cx="0.5" cy="0" r="1.5" fill="#00766C" opacity="0.9" />
              <circle cx="7.5" cy="0" r="1.5" fill="#00766C" opacity="0.9" />
              <path d="M1 5 Q4 8 7 5" stroke="#00766C" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          )}
          {expression === 'neutral' && (
            <g transform="translate(-4, -1)">
              <circle cx="0.5" cy="0" r="1.2" fill="#00766C" />
              <circle cx="7.5" cy="0" r="1.2" fill="#00766C" />
              <path d="M2.5 5 L5.5 5" stroke="#00766C" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </svg>
  )
}

function getVariantCopy(variant: AIChatVariant): VariantCopy {
  if (variant === 'patient') {
    return {
      eyebrow: 'Recovery Companion',
      title: 'Describe the pain. Get the next best step.',
      description:
        'Ace turns symptoms into clear triage, nearby specialist matches, and booking-ready next actions without the clutter of a generic chatbot.',
      modeLabel: 'Patient mode',
      liveNote:
        'Share what hurts, how long it has been going on, and what movements make it worse. The assistant will keep the response focused, human, and ready for booking.',
      primaryHref: '/search',
      primaryLabel: 'Find a physiotherapist',
      secondaryHref: '/patient/appointments',
      secondaryLabel: 'See my sessions',
      quickPrompts: [
        'Sharp knee pain after running',
        'Neck stiffness from desk work',
        'Post-op rehab timeline',
        'Need a home visit today',
      ],
      metrics: [
        { label: 'First response', value: '< 30 sec', caption: 'Designed for quick triage', icon: Zap, tone: 'teal' },
        { label: 'Best match', value: 'Local care', caption: 'Search-ready specialist routing', icon: MapPin, tone: 'emerald' },
        { label: 'Next step', value: 'Book now', caption: 'Clear call to action every time', icon: Calendar, tone: 'amber' },
      ],
      safetyTitle: 'What patients get',
      safetyPoints: [
        'Short, plain-language guidance that is easy to follow.',
        'Recovery-first prompts with clear escalation to a physiotherapist.',
        'A single AI identity (Ace) that stays consistent across the product.',
      ],
      railTitle: 'Example journey',
      railCards: [
        {
          label: 'Step 1',
          title: 'Describe the symptoms',
          detail: 'Pain location, duration, and what makes it worse.',
          icon: HeartPulse,
          tone: 'teal',
        },
        {
          label: 'Step 2',
          title: 'See a likely match',
          detail: 'Physio specialties, visit type, and price appear together.',
          icon: Users,
          tone: 'emerald',
          href: '/search',
          cta: 'Preview search',
        },
        {
          label: 'Step 3',
          title: 'Book the session',
          detail: 'Move from triage to booking without leaving the flow.',
          icon: ShieldCheck,
          tone: 'violet',
          href: '/patient/appointments',
          cta: 'Open sessions',
        },
      ],
      footerNote: 'Demo guidance only. Ace is designed to keep the care journey clear, calm, and easy to convert.',
      contextLabel: 'Recovery triage and booking guidance',
    }
  }

  return {
    eyebrow: 'Clinical Copilot',
    title: 'Evidence-backed support for physiotherapists.',
    description:
      'Ace gives physiotherapists a structured workspace for case reasoning, concise research context, and action-ready plans with a unified product identity.',
    modeLabel: 'Provider mode',
    liveNote:
      'Add age, complaint, red flags, and clinical findings. The assistant responds in a compact, citation-aware format that is easier to use in a real practice flow.',
    primaryHref: '/provider/calendar',
    primaryLabel: 'Open practice calendar',
    secondaryHref: '/provider/appointments',
    secondaryLabel: 'Review sessions',
    quickPrompts: [
      'Return-to-run plan after ACL',
      'Differentiate radicular vs referred pain',
      'Draft a home exercise note',
      'Summarize red flags for shoulder pain',
    ],
    metrics: [
      { label: 'Scope', value: 'Physio only', caption: 'Guardrails stay narrow and useful', icon: Microscope, tone: 'teal' },
      { label: 'Evidence', value: 'Cited', caption: 'Responses can surface peer-reviewed refs', icon: BookOpen, tone: 'emerald' },
      { label: 'Output', value: 'Action-ready', caption: 'Concise plans for clinical follow-up', icon: FileText, tone: 'amber' },
    ],
    safetyTitle: 'Clinical guardrails',
    safetyPoints: [
      'Ace stays on musculoskeletal and rehabilitation topics only.',
      'The tone is calm, precise, and tailored to physiotherapy workflows.',
      'Source-aware responses make the demo feel like a real clinical workspace.',
    ],
    railTitle: 'Research and case tools',
    railCards: [
      {
        label: 'Research',
        title: 'Citation-aware reasoning',
        detail: 'Structured answers can surface [C1] style evidence anchors.',
        icon: BrainCircuit,
        tone: 'violet',
      },
      {
        label: 'Case file',
        title: 'Reusable documentation',
        detail: 'Turn the conversation into a note, plan, or follow-up checklist.',
        icon: ClipboardList,
        tone: 'teal',
        href: '/provider/messages',
        cta: 'Open messages',
      },
      {
        label: 'Library',
        title: 'Source-backed briefings',
        detail: 'Keep the model focused on the best evidence for each case.',
        icon: Database,
        tone: 'slate',
        href: '/provider/earnings',
        cta: 'Practice view',
      },
    ],
    footerNote: 'Built to look and feel like a premium clinical copilot, not a generic chat widget.',
    contextLabel: 'Clinical decision support and research briefings',
  }
}

function toneClasses(tone: Tone) {
  return TONE_STYLES[tone]
}

function renderMessageContent(content: string) {
  return content.split(/(\[C\d+\])/g).map((part, index) => {
    if (/\[C\d+\]/.test(part)) {
      return (
        <span
          key={`${part}-${index}`}
          className="mx-1 inline-flex items-center rounded-full border border-bp-accent/20 bg-bp-accent/10 px-2.5 py-0.5 text-[11px] font-black text-bp-accent"
        >
          {part}
        </span>
      )
    }

    return part
  })
}

function getUIMessageText(message: UIMessage): string {
  return message.parts.reduce((text, part) => {
    return part.type === 'text' ? `${text}${part.text}` : text
  }, '')
}

function toUIMessage(message: BookPhysioAIMessage): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: [{ type: 'text', text: message.content }],
  }
}

export function BookPhysioAIChat({ variant, api, initialMessages }: BookPhysioAIChatProps) {
  const copy = getVariantCopy(variant)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const initialChatMessages = useMemo(() => initialMessages.map(toUIMessage), [initialMessages])
  const transport = useMemo(
    () => new TextStreamChatTransport<UIMessage>({
      api,
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages: messages.flatMap((message) => {
            if (message.role !== 'user' && message.role !== 'assistant') {
              return []
            }

            const content = getUIMessageText(message).trim()

            return content ? [{ role: message.role, content }] : []
          }),
        },
      }),
    }),
    [api],
  )
  const { messages, sendMessage, status } = useChat<UIMessage>({
    messages: initialChatMessages,
    transport,
  })
  const isLoading = status === 'submitted' || status === 'streaming'

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextInput = input.trim()
    if (!nextInput || isLoading) {
      return
    }

    setInput('')
    void sendMessage({ text: nextInput }).catch(() => {
      setInput(nextInput)
    })
  }

  // Determine current mascot expression
  const currentExpression: AceExpression = isLoading
    ? 'thinking'
    : messages[messages.length - 1]?.role === 'assistant'
      ? 'happy'
      : 'neutral'

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const chatMessages = useMemo(
    () => messages.flatMap((message) => {
      if (message.role !== 'user' && message.role !== 'assistant') {
        return []
      }

      return [{
        id: message.id,
        role: message.role,
        content: getUIMessageText(message),
      } satisfies BookPhysioAIMessage]
    }),
    [messages],
  )

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[radial-gradient(circle_at_top,_rgba(0,118,108,0.08),_transparent_40%),linear-gradient(180deg,_#f7f8f9_0%,_#fcfdfd_35%,_#ffffff_100%)] selection:bg-bp-accent/10 selection:text-bp-accent">
      <div className="mx-auto max-w-[1680px] px-4 md:px-6 py-6 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)_320px]">
          <aside className="hidden xl:flex flex-col gap-6">
            <div className="rounded-[36px] border border-bp-border bg-white/90 p-6 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bp-accent text-white shadow-lg shadow-bp-accent/20 overflow-hidden translate-z-0">
                  <AceMascot expression={currentExpression} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-bp-body/40">{copy.eyebrow}</p>
                  <h1 className="text-[20px] font-black tracking-tight text-bp-primary">Ace</h1>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-bp-border bg-[#fafbfc] p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bp-accent">One AI for the platform</p>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-bp-body">{copy.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {copy.metrics.map((metric) => {
                    const styles = toneClasses(metric.tone)
                    const MetricIcon = metric.icon

                    return (
                      <div key={metric.label} className="rounded-[22px] border border-bp-border bg-white p-3 shadow-sm">
                        <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-2xl', styles.icon)}>
                          <MetricIcon size={18} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-bp-body/40">{metric.label}</p>
                        <p className="mt-1 text-[16px] font-black tracking-tight text-bp-primary">{metric.value}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[36px] bg-bp-primary p-6 text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                <ShieldCheck size={14} />
                Safe by design
              </div>
              <h2 className="mt-4 text-[20px] font-black tracking-tight">{copy.safetyTitle}</h2>
              <div className="mt-5 space-y-3">
                {copy.safetyPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="mt-0.5 text-emerald-300" size={16} />
                    <p className="text-[13px] font-medium leading-relaxed text-white/75">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            <header className="overflow-hidden rounded-[40px] border border-bp-border bg-white/90 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-bp-body/40">
                    <span className="inline-flex items-center gap-2 rounded-full border border-bp-accent/20 bg-bp-accent/10 px-3 py-1 text-bp-accent">
                      <Sparkles size={12} />
                      bookphysio.in/ai
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-bp-border bg-bp-surface px-3 py-1 text-bp-primary">
                      <BadgeCheck size={12} />
                      {copy.modeLabel}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-bp-accent">{copy.eyebrow}</p>
                    <h1 className="max-w-3xl text-[34px] font-black leading-[0.95] tracking-tight text-bp-primary md:text-[52px]">BookPhysio AI</h1>
                    <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-bp-body md:text-[17px]">
                      {copy.title}
                    </p>
                    <p className="max-w-2xl text-[14px] font-medium leading-relaxed text-bp-body/60">{copy.contextLabel}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={copy.primaryHref}
                      className="inline-flex items-center gap-3 rounded-[24px] bg-bp-primary px-6 py-3.5 text-[14px] font-black text-white shadow-xl shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-bp-accent"
                    >
                      {copy.primaryLabel}
                      <ArrowRight size={16} strokeWidth={3} />
                    </Link>
                    <Link
                      href={copy.secondaryHref}
                      className="inline-flex items-center gap-3 rounded-[24px] border border-bp-border bg-white px-6 py-3.5 text-[14px] font-black text-bp-primary shadow-sm transition-all hover:border-bp-accent/20 hover:text-bp-accent"
                    >
                      {copy.secondaryLabel}
                      <ChevronRight size={16} strokeWidth={3} />
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {copy.metrics.map((metric) => {
                    const styles = toneClasses(metric.tone)
                    const MetricIcon = metric.icon

                    return (
                      <div key={metric.label} className="rounded-[28px] border border-bp-border bg-[#fafbfc] p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', styles.icon)}>
                            <MetricIcon size={20} strokeWidth={2.5} />
                          </div>
                          <div className={cn('rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]', styles.badge)}>
                            Live
                          </div>
                        </div>
                        <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-bp-body/40">{metric.label}</p>
                        <p className="mt-1 text-[18px] font-black tracking-tight text-bp-primary">{metric.value}</p>
                        <p className="mt-2 text-[12px] font-medium leading-relaxed text-bp-body/60">{metric.caption}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </header>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="flex min-h-[760px] flex-col overflow-hidden rounded-[40px] border border-bp-border bg-white shadow-[0_28px_80px_-42px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between border-b border-bp-border px-6 py-5 md:px-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bp-body/40">{copy.modeLabel}</p>
                    <h2 className="text-[20px] font-black tracking-tight text-bp-primary">Conversation canvas</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-bp-accent/20 bg-bp-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-bp-accent">
                    <span className="h-2 w-2 rounded-full bg-bp-accent" />
                    Live demo
                  </div>
                </div>

                <div ref={chatRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
                  <div className="rounded-[30px] border border-bp-accent/20 bg-[linear-gradient(135deg,_rgba(230,244,243,0.95),_rgba(255,255,255,0.9))] p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-bp-accent">
                      <Zap size={12} />
                      {copy.modeLabel}
                    </div>
                    <p className="mt-3 max-w-3xl text-[14px] font-medium leading-relaxed text-[#555555]">
                      {copy.liveNote}
                    </p>
                  </div>

                  {chatMessages.map((message, index) => {
                    const isUser = message.role === 'user'
                    const citationIds = Array.from(
                      new Set((message.content.match(/\[C\d+\]/g) ?? []).map((citation) => citation.replace(/[\[\]]/g, '')))
                    )

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex items-start gap-4 animate-in slide-in-from-bottom-3 duration-500',
                          isUser ? 'ml-auto max-w-[88%] flex-row-reverse' : 'mr-auto max-w-[92%]'
                        )}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] shadow-sm',
                            isUser ? 'bg-bp-primary text-white' : 'bg-[#F3F4F6] text-bp-accent'
                          )}
                        >
                          {isUser ? <Users size={24} /> : <Bot size={24} />}
                        </div>

                        <div
                          className={cn(
                            'rounded-[30px] px-5 py-4 shadow-sm',
                            isUser
                              ? 'rounded-tr-none border border-[#1f6f68] bg-bp-accent text-white'
                              : 'rounded-tl-none border border-bp-border bg-white text-bp-primary'
                          )}
                        >
                          <div className="text-[15px] font-medium leading-relaxed md:text-[16px]">
                            {renderMessageContent(String(message.content))}
                          </div>

                          {citationIds.length > 0 && !isUser && (
                            <div className="mt-4 flex flex-wrap gap-2 border-t border-bp-border/50 pt-4">
                              {citationIds.map((citationId) => (
                                <span
                                  key={citationId}
                                  className="inline-flex items-center gap-2 rounded-full border border-bp-accent/20 bg-bp-accent/10 px-3 py-1 text-[11px] font-black text-bp-accent"
                                >
                                  <CheckCircle2 size={12} />
                                  {citationId}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {isLoading && (
                    <div className="mr-auto flex max-w-[92%] items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-[#F3F4F6] text-bp-accent shadow-sm">
                        <Bot size={24} className="animate-pulse" />
                      </div>
                      <div className="rounded-[30px] rounded-tl-none border border-bp-border bg-white px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-bp-accent" />
                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-bp-accent [animation-delay:120ms]" />
                          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-bp-accent [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-bp-border bg-[#fafbfc] px-6 py-5 md:px-8 md:py-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {copy.quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setInput(prompt)
                          inputRef.current?.focus()
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-bp-border bg-white px-4 py-2 text-[12px] font-black text-bp-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-bp-accent/20 hover:text-bp-accent"
                      >
                        <Sparkles size={12} className="text-bp-accent" />
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3 rounded-[34px] border border-bp-border bg-white p-2.5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.2)] transition-all focus-within:border-bp-accent/30 focus-within:shadow-[0_24px_60px_-28px_rgba(0,118,108,0.2)]"
                  >
                    <label htmlFor={inputId} className="sr-only">
                      {variant === 'patient' ? 'Ask BookPhysio AI about symptoms and recovery' : 'Ask BookPhysio AI about a clinical case'}
                    </label>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[26px] bg-bp-accent text-white shadow-lg shadow-bp-accent/20 overflow-hidden translate-z-0">
                      <AceMascot expression={currentExpression} />
                    </div>
                    <input
                      id={inputId}
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      placeholder={variant === 'patient' ? 'Describe what hurts, how long it has been going on, and what makes it worse...' : 'Summarize the case, findings, and what you want the AI to help with...'}
                      className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[15px] font-medium text-bp-primary outline-none placeholder:text-bp-body/40"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!(input || '').trim() || isLoading}
                      aria-label={variant === 'patient' ? 'Send recovery question' : 'Send clinical question'}
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-[26px] transition-all',
                        (input || '').trim() && !isLoading
                          ? 'bg-bp-primary text-white shadow-lg hover:bg-bp-accent active:scale-95'
                          : 'cursor-not-allowed bg-gray-200 text-white'
                      )}
                    >
                      <Send size={22} />
                    </button>
                  </form>
                  <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-bp-body/30">{copy.footerNote}</p>
                </div>
              </section>

              <aside className="hidden xl:flex flex-col gap-6">
                <div className="rounded-[36px] border border-bp-border bg-white p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.22)]">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-bp-body/40">
                    <BookOpen size={14} />
                    {copy.railTitle}
                  </div>

                  <div className="mt-5 space-y-3">
                    {copy.railCards.map((card) => {
                      const styles = toneClasses(card.tone)
                      const CardIcon = card.icon
                      const content = (
                        <>
                          <div className="flex items-start gap-3">
                            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', styles.icon)}>
                              <CardIcon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn('inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]', styles.badge)}>
                                {card.label}
                              </p>
                              <h3 className="mt-3 text-[15px] font-black tracking-tight text-bp-primary">{card.title}</h3>
                              <p className="mt-1.5 text-[13px] leading-relaxed text-bp-body">{card.detail}</p>
                            </div>
                          </div>
                          {card.cta && (
                            <div className="mt-4 flex items-center justify-between rounded-[20px] border border-bp-border bg-[#fafbfc] px-4 py-3 text-[12px] font-black text-bp-primary">
                              <span>{card.cta}</span>
                              <ChevronRight size={14} className="text-bp-accent" />
                            </div>
                          )}
                        </>
                      )

                      return card.href ? (
                        <Link
                          key={card.title}
                          href={card.href}
                          className="group block rounded-[28px] border border-bp-border bg-[linear-gradient(180deg,_white,_rgba(249,250,251,0.9))] p-4 transition-all hover:-translate-y-0.5 hover:border-bp-accent/20 hover:shadow-lg"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div key={card.title} className="rounded-[28px] border border-bp-border bg-[linear-gradient(180deg,_white,_rgba(249,250,251,0.9))] p-4">
                          {content}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-[36px] bg-bp-primary p-6 text-white shadow-[0_24px_70px_-35px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    <Activity size={14} />
                    {copy.modeLabel}
                  </div>
                  <h3 className="mt-4 text-[22px] font-black tracking-tight">{copy.safetyTitle}</h3>
                  <div className="mt-5 space-y-3">
                    {copy.safetyPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
                        <CheckCircle2 className="mt-0.5 text-emerald-300" size={16} />
                        <p className="text-[13px] font-medium leading-relaxed text-white/75">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}