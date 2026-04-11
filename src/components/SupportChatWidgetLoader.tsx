'use client'

import dynamic from 'next/dynamic'

const SupportChatWidget = dynamic(
  () => import('@/components/SupportChatWidget').then((mod) => mod.SupportChatWidget),
  { ssr: false }
)

export function SupportChatWidgetLoader() {
  return <SupportChatWidget />
}
