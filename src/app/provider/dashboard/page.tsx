import { UserCircle, Settings, ChevronUp, ChevronDown, BarChart3, Star, ArrowRight, CheckCircle } from 'lucide-react'

export default function ProviderDashboardHome() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      
      {/* Greeting */}
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        Hello, lokistr
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        
        {/* Left Column: Setup Checklist */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[20px] font-bold text-[#333333]">
            Your setup checklist
          </h2>
          
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm overflow-hidden">
            {/* Expanded section */}
            <div className="p-6 border-b border-[#E5E5E5]">
              <button className="w-full flex justify-between items-center cursor-pointer bg-transparent border-none outline-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E6F4F3] flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-[#00766C]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#333333]">Create your profile</h3>
                </div>
                <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
              </button>
              
              <div className="pl-[52px] pt-5 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#333333] mb-1">Add your providers</h4>
                    <p className="text-[14px] text-[#666666]">Create provider profiles using ICPs, then add qualifications to attract patients.</p>
                  </div>
                  <button className="shrink-0 ml-4 px-4 py-2 border border-[#E5E5E5] rounded-lg bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
                    Get started
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#333333] mb-1">Verify your identity</h4>
                    <p className="text-[14px] text-[#666666]">Upload a government-issued photo ID to verify your practice.</p>
                  </div>
                  <button className="shrink-0 ml-4 px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F9FAFB] text-[14px] font-medium text-[#9CA3AF] cursor-not-allowed opacity-60 outline-none" disabled>
                    Get started
                  </button>
                </div>
              </div>
            </div>
            
            {/* Collapsed section */}
            <button className="w-full px-6 py-4 flex justify-between items-center cursor-pointer bg-transparent border-none outline-none hover:bg-[#F9FAFB] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#6B7280]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#333333]">Customize your settings</h3>
              </div>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        {/* Right Column: Performance Overview */}
        <aside className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
          <h2 className="text-[18px] font-bold text-[#333333] mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00766C]" />
            Performance
          </h2>

          <div className="mb-8">
            <div className="text-[48px] font-light text-[#333333] leading-none">
              0
            </div>
            <p className="text-[15px] font-semibold text-[#333333] mt-2 mb-1">
              No bookings yet
            </p>
            <p className="text-[13px] text-[#666666] mb-4">
              Compared to 0 bookings this time last month
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#333333] rounded-lg bg-white text-[#333333] text-[14px] font-medium cursor-pointer hover:bg-[#F9FAFB] transition-colors outline-none">
              View details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-[#E5E5E5] pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-[48px] font-light text-[#333333] leading-none">0</span>
            </div>
            <p className="text-[15px] text-[#666666]">
              No reviews yet
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
