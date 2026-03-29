import { TrendingUp, Users, BarChart3, MapPin, ChevronDown } from 'lucide-react'

const chartWidgets = [
  { title: 'Revenue Trends (₹ Lakhs)', placeholder: 'Line Chart Visualization', icon: TrendingUp },
  { title: 'Patient Acquisition', placeholder: 'Bar Chart Visualization', icon: Users },
]

export default function AdminAnalytics() {
  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">
            Platform Analytics
          </h1>
          <p className="text-[15px] text-[#666666]">Monitor platform performance and growth.</p>
        </div>
        <div className="relative">
          <select className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-[#E5E5E5] bg-white text-[14px] font-medium text-[#333333] cursor-pointer outline-none focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C]">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
      </div>

      {/* Chart Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartWidgets.map(({ title, placeholder, icon: Icon }) => (
          <div key={title} className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 h-[400px] flex flex-col">
            <h2 className="text-[18px] font-semibold text-[#333333] mb-6 flex items-center gap-2">
              <Icon className="w-5 h-5 text-[#00766C]" />
              {title}
            </h2>
            <div className="flex-1 bg-[#F9FAFB] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-[14px] text-[#9CA3AF]">{placeholder}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Widget */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 h-[300px] flex flex-col">
        <h2 className="text-[18px] font-semibold text-[#333333] mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#00766C]" />
          Top Performing Cities (by Bookings)
        </h2>
        <div className="flex-1 bg-[#F9FAFB] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[14px] text-[#9CA3AF]">Geographical Map / Data Table</p>
          </div>
        </div>
      </div>
    </div>
  )
}
