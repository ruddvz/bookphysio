import { Bell, CheckCheck } from 'lucide-react'

export default function ProviderNotifications() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[32px] font-bold text-bp-primary tracking-tight">
          Notifications
        </h1>
        <button className="flex items-center gap-2 text-[14px] font-semibold text-bp-accent hover:text-bp-primary cursor-pointer bg-transparent border-none outline-none transition-colors">
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-medium text-bp-primary mb-1">No new notifications</p>
          <p className="text-[13px] text-[#9CA3AF]">You&apos;re all caught up.</p>
        </div>
      </div>
    </div>
  )
}
