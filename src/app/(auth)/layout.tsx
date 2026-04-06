import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Subtle teal radial glow at top */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-5 py-16 relative z-10">
        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-4 text-[12px] text-slate-400">
          <span>© 2026 BookPhysio.in</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy</Link>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <Link href="/terms" className="hover:text-teal-600 transition-colors">Terms</Link>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <Link href="/faq" className="hover:text-teal-600 transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  )
}
