import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-bp-surface flex flex-col items-center justify-center p-4 py-8 sm:p-6 selection:bg-bp-accent/10 selection:text-bp-accent">
      <div className="w-full flex justify-center">
        {children}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] font-medium text-bp-body/60">
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
