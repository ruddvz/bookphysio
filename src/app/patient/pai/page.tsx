'use client'

import dynamic from 'next/dynamic'
import type { BookPhysioAIMessage } from '@/components/BookPhysioAIChat'

const BookPhysioAIChat = dynamic(
  () => import('@/components/BookPhysioAIChat').then((mod) => mod.BookPhysioAIChat),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        Loading PAI...
      </div>
    ),
  }
)

const INITIAL_MESSAGES: BookPhysioAIMessage[] = [
  {
    id: 'pai-intro',
    role: 'assistant',
    content:
      'Hi, I am PAI — BookPhysio\'s Physiotherapy AI. Ask me about any musculoskeletal condition, rehab protocol, exercise prescription, or red flag symptom. I\'ll give you structured, evidence-backed guidance for the Indian clinical context.',
  },
]

export default function PAIPage() {
  return (
    <BookPhysioAIChat variant="pai" api="/api/ai/pai" initialMessages={INITIAL_MESSAGES} />
  )
}
