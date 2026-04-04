import { DocumentLangSync } from '@/components/DocumentLangSync'

export default function HindiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocumentLangSync lang="hi" />
      {children}
    </>
  )
}