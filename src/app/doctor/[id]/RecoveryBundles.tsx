'use client'

import { Package, CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_BUNDLES = [
  {
    id: 'B1',
    title: '15-Day Post-Op Rehab',
    price: '₹12,499',
    sessions: 10,
    features: ['Personalized Plan', '24/7 Motio Support', 'Diet Guidance'],
    tag: 'Sports Selection'
  },
  {
    id: 'B2',
    title: 'Back Pain Recovery (1 Mo)',
    price: '₹18,999',
    sessions: 15,
    features: ['Manual Therapy', 'Ergonomic Review', 'Home Visit Support'],
    tag: 'Best Seller'
  }
]

export default function RecoveryBundles() {
  return (
    <section className="mb-12 relative z-10 px-1">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-[26px] font-black text-[#333333] tracking-tight">Recovery Bundles</h2>
           <p className="text-[14px] text-gray-400 font-bold mt-1">Multi-session plans for a complete finish line</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-[11px] font-black uppercase tracking-widest">
           <Zap size={14} className="fill-rose-600" />
           Limited Offers
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_BUNDLES.map((bundle) => (
          <div key={bundle.id} className="relative group p-8 bg-white border border-gray-100 rounded-[40px] hover:border-[#00766C] hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-700 overflow-hidden cursor-pointer">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-bl-full -z-0 transition-all group-hover:scale-150 duration-1000"></div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                   <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00766C]">
                      <Package size={28} />
                   </div>
                   <div className="px-3 py-1 bg-[#333333] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {bundle.tag}
                   </div>
                </div>

                <h3 className="text-[22px] font-black text-[#333333] mb-2 leading-tight group-hover:text-[#00766C] transition-colors">{bundle.title}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                   <span className="text-[32px] font-black text-[#333333] tracking-tighter">{bundle.price}</span>
                   <span className="text-[13px] text-gray-400 font-bold uppercase tracking-widest">/ {bundle.sessions} Sessions</span>
                </div>

                <div className="space-y-3 mb-8">
                   {bundle.features.map((f, i) => (
                     <div key={i} className="flex items-center gap-3 text-[14px] font-bold text-gray-500">
                        <CheckCircle2 size={16} className="text-[#059669]" />
                        {f}
                     </div>
                   ))}
                </div>

                <button className="w-full py-4 bg-gray-50 rounded-2xl text-[#333333] text-[15px] font-black hover:bg-[#00766C] hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                   Register Interest
                   <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </section>
  )
}
