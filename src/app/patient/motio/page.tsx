'use client'

import { BookPhysioAIChat, type BookPhysioAIMessage } from '@/components/BookPhysioAIChat'

const INITIAL_MESSAGES: BookPhysioAIMessage[] = [
   {
      id: 'patient-ai-intro',
      role: 'assistant',
      content:
         'Hi, I am BookPhysio AI. Tell me what hurts, how long it has been going on, and what movements make it worse, and I will help you find the right next step.',
   },
]

export default function PatientMotio() {
   return <BookPhysioAIChat variant="patient" api="/api/ai/motio" initialMessages={INITIAL_MESSAGES} />
}
