'use client'

import { BookPhysioAIChat, type BookPhysioAIMessage } from '@/components/BookPhysioAIChat'

const INITIAL_MESSAGES: BookPhysioAIMessage[] = [
  {
    id: 'provider-ai-intro',
    role: 'assistant',
    content:
      'Welcome to BookPhysio AI. Share the patient age, complaint, findings, and what you want help with, and I will draft a concise evidence-backed plan with citations.',
  },
]

export default function MotioAssistant() {
  return <BookPhysioAIChat variant="provider" api="/api/ai/provider" initialMessages={INITIAL_MESSAGES} />
}
