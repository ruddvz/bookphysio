'use client'

import dynamic from 'next/dynamic'
import { useUiV2 } from '@/hooks/useUiV2'
import { ProviderAIAssistantV2 } from './ProviderAIAssistantV2'
import type { BookPhysioAIMessage } from '@/components/BookPhysioAIChat'

const BookPhysioAIChat = dynamic(() => import('@/components/BookPhysioAIChat').then(mod => mod.BookPhysioAIChat), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center bg-white">Loading Assistant...</div>
})

const INITIAL_MESSAGES: BookPhysioAIMessage[] = [
  {
    id: 'provider-ai-intro',
    role: 'assistant',
    content:
      'Welcome to BookPhysio AI. Share the patient age, complaint, findings, and what you want help with, and I will draft a concise evidence-backed plan with citations.',
  },
]

export default function MotioAssistant() {
  const isV2 = useUiV2()
  if (isV2) return <ProviderAIAssistantV2 />

  return <BookPhysioAIChat variant="provider" api="/api/ai/provider" initialMessages={INITIAL_MESSAGES} />
}
