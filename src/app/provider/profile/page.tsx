'use client'

import { User, Briefcase, Award, Globe, ShieldCheck, Check, X, MapPin, Navigation, Info, Search, Trash2, ArrowRight, Activity } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function ProviderProfile() {
  const [pincodes, setPincodes] = useState<string[]>(['110001', '110012', '110020'])
  const [newPincode, setNewPincode] = useState('')

  const addPincode = () => {
    if (newPincode.match(/^[1-9][0-9]{5}$/) && !pincodes.includes(newPincode)) {
      setPincodes([...pincodes, newPincode])
      setNewPincode('')
    }
  }

  const removePincode = (code: string) => {
    setPincodes(pincodes.filter(c => c !== code))
  }

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-bp-border pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-bp-accent flex items-center justify-center text-white shadow-xl shadow-bp-accent/20 transform -rotate-3">
                <Briefcase size={24} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-bp-accent">Registry Management</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[11px] font-bold text-emerald-600">Active Listing</span>
                </div>
             </div>
          </div>
          <h1 className="text-[42px] lg:text-[48px] font-black text-bp-primary tracking-tighter leading-none">
            Practice <span className="text-bp-accent">Profile</span>
          </h1>
          <p className="text-[16px] font-medium text-bp-body max-w-xl leading-relaxed">
            Manage your professional presence, specialty credentials, and service area coverage.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bp-surface p-2 rounded-[24px] border border-bp-border">
          <button className="px-6 py-3 text-[13px] font-black text-bp-accent bg-white rounded-[18px] shadow-sm transform active:scale-95 transition-all">Public View</button>
          <button className="px-6 py-3 text-[13px] font-black text-bp-body hover:text-bp-primary transition-colors rounded-[18px]">Analytics</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* ── Left Column: Form ── */}
        <div className="lg:col-span-2 space-y-12">
          
          <section className="bg-white rounded-[40px] border border-bp-border shadow-sm p-10 group/section">
            <h3 className="text-[22px] font-black text-bp-primary tracking-tight mb-8 flex items-center gap-3">
              <User size={22} className="text-bp-accent" />
              Personal Details
            </h3>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 rounded-[32px] bg-bp-accent/10 text-bp-accent flex items-center justify-center text-2xl font-black border-4 border-white shadow-xl group-hover/avatar:scale-105 transition-transform">
                    LP
                  </div>
                  <button 
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-bp-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:bg-black transition-colors"
                    title="Change Avatar"
                  >
                    <User size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[18px] font-black text-bp-primary">Dr. Loki Strider</h4>
                  <p className="text-[13px] font-bold text-bp-body/40 uppercase tracking-widest">Senior Physiotherapist</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-[12px] font-black text-bp-body/40 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    id="full-name"
                    type="text" 
                    defaultValue="Loki Strider"
                    className="w-full px-6 py-4 bg-bp-surface border border-bp-border rounded-[20px] text-[15px] font-bold text-bp-primary focus:bg-white focus:border-bp-accent outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="specialties" className="text-[12px] font-black text-bp-body/40 uppercase tracking-widest ml-1">Specialties</label>
                  <input 
                    id="specialties"
                    type="text" 
                    defaultValue="Sports Injuries, Rehab"
                    className="w-full px-6 py-4 bg-bp-surface border border-bp-border rounded-[20px] text-[15px] font-bold text-bp-primary focus:bg-white focus:border-bp-accent outline-none transition-all"
                    placeholder="e.g. Sports Injuries, Rehab"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="professional-bio" className="text-[12px] font-black text-bp-body/40 uppercase tracking-widest ml-1">Professional Bio</label>
                <textarea 
                  id="professional-bio"
                  rows={4}
                  className="w-full p-6 bg-bp-surface border border-bp-border rounded-[24px] text-[15px] font-medium text-bp-primary leading-relaxed focus:bg-white focus:border-bp-accent outline-none transition-all resize-none"
                  defaultValue="Specialized in orthopaedic recovery and sports-related injury management with over 8 years of clinical experience."
                  placeholder="Tell patients about your specific experience and approach..."
                />
              </div>
            </div>
          </section>

          {/* ── Service Area (8.9 Target) ── */}
          <section className="bg-bp-primary rounded-[48px] p-10 text-white relative overflow-hidden group/area">
            <div className="absolute right-0 top-0 w-[400px] h-full bg-bp-accent opacity-10 translate-x-1/2 rounded-full blur-[100px] group-hover/area:opacity-20 transition-opacity duration-1000" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl text-emerald-400 border border-white/5 backdrop-blur-md">
                    <Navigation size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Service Boundary</span>
                  </div>
                  <h3 className="text-[28px] font-black tracking-tight leading-none">Coverage Area</h3>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-right mr-2 hidden sm:block">
                      <p className="text-[11px] font-black text-bp-body uppercase tracking-widest">Efficiency</p>
                      <p className="text-[14px] font-black text-emerald-400">High Density</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                      <MapPin size={22} className="text-emerald-400" />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-[15px] text-bp-body/40 font-medium leading-relaxed">
                    Define the <span className="text-white font-bold">Pin Codes</span> where you provide home visit services. Patients will only see you if their address is within these zones.
                  </p>
                  
                  <div className="relative">
                    <label htmlFor="pincode-input" className="sr-only">Enter Pincode</label>
                    <input 
                      id="pincode-input"
                      type="text" 
                      placeholder="Enter 6-digit Pincode"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full pl-6 pr-32 py-5 bg-white/5 border border-white/10 rounded-[20px] text-white text-[16px] font-black placeholder:text-bp-body focus:bg-white/10 focus:border-bp-accent outline-none transition-all"
                    />
                    <button 
                      onClick={addPincode}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-bp-accent hover:bg-[#008F83] text-white text-[12px] font-black rounded-xl transition-all uppercase tracking-widest active:scale-95"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {pincodes.map(code => (
                      <div key={code} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/5 transition-colors group/tag">
                        <span className="text-[14px] font-black tracking-tighter">{code}</span>
                        <button 
                          onClick={() => removePincode(code)} 
                          className="text-bp-body hover:text-rose-400 transition-colors"
                          title={`Remove pincode ${code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {pincodes.length === 0 && (
                      <p className="text-[12px] font-bold text-bp-body text-center w-full py-4 border-2 border-dashed border-white/5 rounded-[24px]">No pincodes active for home visits</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 relative overflow-hidden group/metrics">
                      <div className="flex items-center justify-between mb-8">
                         <span className="text-[11px] font-black text-bp-body uppercase tracking-widest">Active Corridors</span>
                         <Activity size={16} className="text-bp-accent" />
                      </div>
                      <div className="space-y-6">
                         <div className="flex justify-between items-end">
                            <span className="text-[13px] font-bold text-bp-body/40">Delhi NCR Total</span>
                            <span className="text-[18px] font-black">1.2k km²</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-bp-accent w-[65%] rounded-full" />
                         </div>
                      </div>
                      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[12px] font-bold">Radius: 15km</span>
                         </div>
                         <span className="text-[10px] font-black uppercase text-bp-accent tracking-widest">Optimized</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-4 p-5 bg-bp-accent/20 rounded-[28px] border border-bp-accent/30 backdrop-blur-sm">
                <div className="w-10 h-10 bg-bp-accent rounded-xl flex items-center justify-center shadow-lg"><Info size={20} /></div>
                <p className="text-[13px] font-medium text-emerald-100/80 leading-snug">
                  Adding pincodes outside <span className="text-white font-black text-[14px]">NCR (National Capital Region)</span> may require manual business verification from our regional operations team.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* ── Right Column: Credentials & Help ── */}
        <div className="space-y-8">
           <section className="bg-white rounded-[40px] border border-bp-border shadow-sm p-8 group/card">
              <div className="w-14 h-14 bg-bp-accent/10 rounded-2xl flex items-center justify-center text-bp-accent mb-6 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <h4 className="text-[20px] font-black text-bp-primary tracking-tight mb-3">Verification Hub</h4>
              <p className="text-[14px] font-medium text-bp-body/40 leading-relaxed mb-8">
                Your medical registration is the primary trust signal for patients.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-bp-surface rounded-2xl border border-bp-border group/item transition-all hover:bg-white hover:shadow-lg">
                  <Award size={20} className="text-bp-accent" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-bp-primary">ICP Medical ID</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Verified ✓</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-bp-secondary/10/50 rounded-2xl border border-bp-secondary/20 group/item transition-all">
                  <Info size={20} className="text-bp-secondary" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-bp-secondary">GST Registration</span>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Required for Payouts</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-bp-primary hover:bg-black text-white text-[12px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
                Update Documents <ArrowRight size={14} />
              </button>
           </section>

           <section className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100">
              <h4 className="text-[18px] font-black text-bp-accent tracking-tight mb-4 flex items-center gap-2">
                <Globe size={18} />
                Global Status
              </h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-emerald-100/50">
                    <span className="text-[13px] font-bold text-bp-accent/70">Profile Strength</span>
                    <span className="text-[13px] font-black text-bp-accent">85%</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-emerald-100/50">
                    <span className="text-[13px] font-bold text-bp-accent/70">Search Visibility</span>
                    <span className="text-[13px] font-black text-bp-accent">Tier-1</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-[13px] font-bold text-bp-accent/70">City Hub</span>
                    <span className="text-[13px] font-black text-bp-accent">New Delhi</span>
                 </div>
              </div>
              <button className="w-full mt-6 py-4 bg-white hover:bg-emerald-100 text-bp-accent text-[12px] font-black rounded-2xl transition-all uppercase tracking-widest border border-emerald-200">
                View Public Profile
              </button>
           </section>
        </div>
      </div>

      {/* ── Action Footer ── */}
      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-8 p-8 bg-white rounded-[40px] border border-bp-border shadow-2xl shadow-gray-200/50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Check size={24} strokeWidth={3} />
           </div>
           <div>
              <p className="text-[15px] font-black text-bp-primary">Draft Saved Successfully</p>
              <p className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest">Last synced 2 minutes ago</p>
           </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-10 py-5 border-2 border-bp-border rounded-[24px] text-[14px] font-black text-bp-body/40 hover:bg-bp-surface transition-all active:scale-95">
            Discard
          </button>
          <button className="flex-1 sm:flex-none px-12 py-5 bg-bp-primary hover:bg-bp-accent text-white rounded-[24px] text-[14px] font-black transition-all shadow-2xl shadow-bp-primary/10 active:scale-95">
            Push Updates Live
          </button>
        </div>
      </div>

    </div>
  )
}

