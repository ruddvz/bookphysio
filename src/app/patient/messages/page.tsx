import { Search, MessageSquare } from 'lucide-react'

export default function PatientMessages() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 h-[calc(100vh-72px)] flex flex-col animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        Messages
      </h1>

      <div className="flex-1 bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm flex overflow-hidden">
        
        {/* Left pane: Contacts */}
        <div className="w-[300px] border-r border-[#E5E5E5] flex flex-col bg-[#F9FAFB] shrink-0">
          <div className="p-4 border-b border-[#E5E5E5]">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Search conversations..." 
                className="w-full pl-10 pr-4 py-2.5 border border-[#E5E5E5] rounded-full text-[14px] bg-white text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 text-center text-[14px] text-[#6B7280]">
            No recent conversations.
          </div>
        </div>

        {/* Right pane: Chat Area */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center px-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#333333] mb-2">Select a conversation</h2>
            <p className="text-[14px] text-[#666666]">Choose a provider from your past appointments to start chatting.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
