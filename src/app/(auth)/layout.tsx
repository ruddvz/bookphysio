export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F7F8F9] flex flex-col sm:items-center sm:justify-center p-4 py-8 sm:p-6">
      <div className="w-full max-w-[440px] mx-auto sm:mx-0">
        {children}
      </div>
    </div>
  )
}
