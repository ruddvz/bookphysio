'use client'

import dynamic from 'next/dynamic'
import type { BookPhysioAIMessage } from '@/components/BookPhysioAIChat'
import { PatientAIShellV2 } from '@/app/patient/ai/PatientAIShellV2'

const BookPhysioAIChat = dynamic(() => import('@/components/BookPhysioAIChat').then(mod => mod.BookPhysioAIChat), {
   ssr: false,
   loading: () => <div className="h-screen w-full flex items-center justify-center bg-white">Loading Motio...</div>
})

const INITIAL_MESSAGES: BookPhysioAIMessage[] = [
   {
      id: 'patient-ai-intro',
      role: 'assistant',
      content:
         'Hi, I am BookPhysio AI. Tell me what hurts, how long it has been going on, and what movements make it worse, and I will help you find the right next step.',
   },
]

export default function PatientMotio() {
  return (
    <PatientAIShellV2 mode="motio">
      <BookPhysioAIChat variant="patient" api="/api/ai/motio" initialMessages={INITIAL_MESSAGES} />
    </PatientAIShellV2>
  )
}
