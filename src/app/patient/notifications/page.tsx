import { Bell, CheckCheck, ShieldCheck, Clock } from 'lucide-react'

export default function PatientNotifications() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[32px] font-bold text-[#333333] tracking-tight">
          Notifications
        </h1>
        <button className="flex items-center gap-2 text-[14px] font-semibold text-[#00766C] hover:text-[#005A52] cursor-pointer bg-transparent border-none outline-none transition-colors">
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Success Notification */}
        <div className="bg-[#F0FDF4] rounded-[12px] border border-[#BBF7D0] shadow-sm p-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold text-[#333333] mb-1">Account verified successfully</h3>
            <p className="text-[14px] text-[#666666] mb-2">Your mobile number has been verified. Welcome to BookPhysio.in!</p>
            <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF]">
              <Clock className="w-3 h-3" />
              2 hours ago
            </span>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-medium text-[#333333] mb-1">No other notifications</p>
          <p className="text-[13px] text-[#9CA3AF]">You&apos;re all caught up.</p>
        </div>
      </div>
    </div>
  )
}
