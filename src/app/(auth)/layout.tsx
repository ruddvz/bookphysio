export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-bp-surface flex flex-col sm:items-center sm:justify-center p-4 py-8 sm:p-6 selection:bg-bp-accent/10 selection:text-bp-accent">
      <div className="w-full max-w-[440px] mx-auto sm:mx-0">
        {children}
      </div>
    </div>
  )
}
