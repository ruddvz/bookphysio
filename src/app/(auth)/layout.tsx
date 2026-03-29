export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8F9] flex items-center justify-center p-6">
      {children}
    </div>
  )
}
