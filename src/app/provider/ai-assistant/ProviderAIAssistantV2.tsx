'use client'

import dynamic from 'next/dynamic'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import type { BookPhysioAIMessage } from '@/components/BookPhysioAIChat'

const BookPhysioAIChat = dynamic(
  () => import('@/components/BookPhysioAIChat').then(mod => mod.BookPhysioAIChat),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(520px,70vh)] w-full flex items-center justify-center bg-white rounded-[var(--sq-lg)] border border-[var(--color-pv-border)]">
        Loading Assistant...
      </div>
    ),
  }
)

const INITIAL_MESSAGES: BookPhysioAIMessage[] = [
  {
    id: 'provider-ai-intro',
    role: 'assistant',
    content:
      'Welcome to BookPhysio AI. Share the patient age, complaint, findings, and what you want help with, and I will draft a concise evidence-backed plan with citations.',
  },
]

export function ProviderAIAssistantV2() {
  const isV2 = useUiV2()
  if (!isV2) return null

  return (
    <div
      className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5"
      data-ui-version="v2"
      data-testid="v2-ai-root"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-pv-primary)] mb-1">
          AI TOOLS
        </p>
        <h1 className="text-[22px] font-bold text-slate-900 leading-none">Clinical AI Assistant</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Evidence-backed visit notes, treatment plans, and patient summaries
        </p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="v2-capability-chips">
        <Badge role="provider" variant="soft" tone={1}>
          Visit-note autodraft
        </Badge>
        <Badge role="provider" variant="soft" tone={2}>
          Treatment plan builder
        </Badge>
        <Badge role="provider" variant="soft" tone={3}>
          Patient summary
        </Badge>
      </div>

      <div className="min-h-[min(640px,75vh)]">
        <BookPhysioAIChat variant="provider" api="/api/ai/provider" initialMessages={INITIAL_MESSAGES} />
      </div>
    </div>
  )
}
