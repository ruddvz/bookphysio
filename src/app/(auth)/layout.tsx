import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-bp-surface flex flex-col items-center justify-center p-4 py-8 sm:p-6 selection:bg-bp-accent/10 selection:text-bp-accent overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[800px] max-w-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.08),transparent_70%)] pointer-events-none" />
      
      <div className="w-full flex justify-center relative z-10">
        {children}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] font-medium text-bp-body/60 relative z-10">
        <span>© 2026 BookPhysio</span>
        <Link href="/privacy" className="transition-colors hover:text-bp-primary">
          Privacy
        </Link>
        <Link href="/terms" className="transition-colors hover:text-bp-primary">
          Terms
        </Link>
      </div>
    </div>
  )
}
