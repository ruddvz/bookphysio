import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[480px]">{children}</div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-4 px-6 py-4 text-[12px] font-medium text-gray-400">
          <span>© 2026 BookPhysio.in</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <Link href="/faq" className="hover:text-gray-600 transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  )
}
