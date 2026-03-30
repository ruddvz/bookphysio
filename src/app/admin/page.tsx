import { Users, UserPlus, CalendarCheck, TrendingUp, Activity, PieChart } from 'lucide-react'

export default function AdminDashboardHome() {
  const kpis = [
    { title: 'Active Providers', value: '1,204', icon: Users, color: 'text-[#666666]', bg: 'bg-[#F3F4F6]' },
    { title: 'Pending Approvals', value: '342', icon: UserPlus, color: 'text-[#FF6B35]', bg: 'bg-[#FFF2ED]' },
    { title: 'Total Patients', value: '8,921', icon: CalendarCheck, color: 'text-[#666666]', bg: 'bg-[#F3F4F6]' },
    { title: 'GMV (MTD)', value: '₹12.4L', icon: TrendingUp, color: 'text-[#00766C]', bg: 'bg-[#E6F4F3]' },
  ]

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header section */}
      <div>
        <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-2">
          Platform Overview
        </h1>
        <p className="text-[16px] text-[#666666]">
          High-level metrics for BookPhysio.in platform performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className="flex flex-col p-6 bg-white border border-[#E5E5E5] rounded-[8px] shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-[13px] font-medium tracking-wide text-[#666666] uppercase">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-[8px] ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-[32px] font-bold tracking-tight text-[#333333]">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Placeholder Charts */}
        <div className="flex flex-col p-8 bg-white border border-[#E5E5E5] rounded-[8px] shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-[#333333]">Bookings Growth</h2>
            <button className="px-5 py-2 text-[14px] font-semibold text-[#00766C] border border-[#00766C] hover:bg-[#00766C] hover:text-white rounded-[24px] transition-all cursor-pointer outline-none">
              View Report
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 w-full bg-[#F9FAFB] border border-[#E5E5E5] border-dashed rounded-[8px] text-[#9CA3AF]">
            <Activity className="w-12 h-12 mb-4 text-[#D1D5DB]" />
            <p className="font-medium">Data Visualization Component</p>
            <p className="text-sm mt-1">Requires Recharts library (Phase 9)</p>
          </div>
        </div>
        
        <div className="flex flex-col p-8 bg-white border border-[#E5E5E5] rounded-[8px] shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-[#333333]">Top Specialties</h2>
            <button className="px-5 py-2 text-[14px] font-semibold text-[#00766C] border border-[#00766C] hover:bg-[#00766C] hover:text-white rounded-[24px] transition-all cursor-pointer outline-none">
              View Details
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 w-full bg-[#F9FAFB] border border-[#E5E5E5] border-dashed rounded-[8px] text-[#9CA3AF]">
            <PieChart className="w-12 h-12 mb-4 text-[#D1D5DB]" />
            <p className="font-medium">Donut Chart Rendering</p>
            <p className="text-sm mt-1">Requires Recharts library (Phase 9)</p>
          </div>
        </div>
      </div>
      
    </div>
  )
}

