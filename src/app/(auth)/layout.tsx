import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-bp-surface overflow-hidden flex flex-col items-center justify-center p-4 py-12 sm:p-6 selection:bg-bp-accent/10 selection:text-bp-accent">
      <div className="absolute left-1/2 top-0 h-[600px] max-w-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.12),transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-6 text-[13px] font-bold tracking-tight text-bp-body/40">
        <span>© 2026 BookPhysio</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-bp-accent">
            Privacy
          </Link>
          <div className="w-1 h-1 bg-bp-border rounded-full" />
          <Link href="/terms" className="transition-colors hover:text-bp-accent">
            Terms
          </Link>
          <div className="w-1 h-1 bg-bp-border rounded-full" />
          <Link href="/faq" className="transition-colors hover:text-bp-accent">
            FAQ
          </Link>
        </div>
      </div>
    </div>
  )
}
