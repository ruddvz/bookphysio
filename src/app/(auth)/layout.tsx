import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f6f1]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-[-8%] top-[-6%] h-[340px] w-[340px] rounded-full bg-bp-primary/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[14%] h-[300px] w-[300px] rounded-full bg-bp-accent/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/2 h-[380px] w-[520px] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bp-primary/15 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
        <div className="w-full max-w-[540px]">{children}</div>
      </div>

      <div className="relative z-10 border-t border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-4 px-6 py-4 text-[12px] font-medium text-slate-400">
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
