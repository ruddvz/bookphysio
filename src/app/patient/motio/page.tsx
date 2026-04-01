'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { 
  Bot, 
  Send, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  User, 
  History, 
  ArrowRight, 
  Sparkles,
  Stethoscope,
  Activity,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const INITIAL_MESSAGES = [
  {
    id: 'motio-intro-1',
    role: 'assistant' as const,
    content: "Hi there! I'm Motio, your personal recovery companion. I'm here to triage your symptoms and find the perfect physiotherapist. What's hurting today?",
  }
]

const RECOMMENDATIONS = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Sports Specialist', rating: 4.9, distance: '2.4 km away' },
  { id: 2, name: 'Dr. Sameer Khan', specialty: 'Orthopedic Physio', rating: 4.8, distance: '3.1 km away' },
]

export default function PatientMotio() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/motio',
    initialMessages: INITIAL_MESSAGES,
  })

  // Auto-scroll to bottom of chat
  const chatRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-8 h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-1000">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-black text-[#333333] tracking-tighter leading-none mb-2">
            Motio AI
          </h1>
          <p className="text-[15px] font-medium text-[#666666]">Your intelligent guide to recovery and pain relief.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-emerald-600 font-black text-[13px] uppercase tracking-widest">
              <Activity size={16} />
              Session Tracker
           </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-gray-100 shadow-2xl flex overflow-hidden relative">
        
        {/* ── Chat Canvas ── */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          
          <div ref={chatRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex items-start gap-5 max-w-[85%] md:max-w-[70%] animate-in slide-in-from-bottom-4 duration-700",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-[22px] flex items-center justify-center shrink-0 shadow-sm transition-all",
                  msg.role === 'user' ? "bg-gray-100" : "bg-[#00766C] text-white"
                )}>
                  {msg.role === 'assistant' ? <Bot size={28} /> : <User size={24} className="text-gray-400" />}
                </div>
                
                <div className={cn(
                  "relative p-6 px-8 rounded-[32px] shadow-sm",
                  msg.role === 'user' 
                    ? "bg-[#333333] text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-[#333333] rounded-tl-none prose max-w-none"
                )}>
                  <p className="text-[16px] md:text-[18px] font-medium leading-relaxed tracking-tight break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-5 max-w-[85%] md:max-w-[70%] animate-in fade-in">
                <div className="w-12 h-12 rounded-[22px] flex items-center justify-center shrink-0 shadow-sm bg-[#00766C] text-white">
                   <Bot size={28} className="animate-pulse" />
                </div>
                <div className="relative p-6 px-8 rounded-[32px] border border-gray-100 bg-gray-50/50 rounded-tl-none flex gap-2 w-24 items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-[#00766C] animate-bounce"></div>
                   <div className="w-2 h-2 rounded-full bg-[#00766C] animate-bounce delay-75"></div>
                   <div className="w-2 h-2 rounded-full bg-[#00766C] animate-bounce delay-150"></div>
                </div>
              </div>
            )}

            {/* Special AI State: Showing Recommendations */}
            <div className="flex flex-col items-center gap-8 py-10 animate-in fade-in duration-1000 delay-500 fill-mode-both">
               <div className="flex flex-col items-center">
                  <div className="w-16 h-1 w-24 bg-teal-100 rounded-full mb-8"></div>
                  <h3 className="text-[20px] font-black text-[#333333] tracking-tighter mb-2">Recommended for your Knee case</h3>
                  <p className="text-[14px] font-bold text-gray-400">Top-rated specialists in Bangalore</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[800px]">
                  {RECOMMENDATIONS.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-xl shadow-gray-200/40 hover:scale-[1.02] transition-all group">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00766C] font-black text-[18px] group-hover:bg-[#00766C] group-hover:text-white transition-colors">
                             {doc.name.charAt(4)}
                          </div>
                          <div>
                            <p className="text-[17px] font-black text-[#333333] leading-none mb-1">{doc.name}</p>
                            <p className="text-[13px] font-bold text-gray-400">{doc.specialty}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1 text-[13px] font-black text-[#FF6B35]">
                                <span>★</span> {doc.rating}
                             </div>
                             <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{doc.distance}</div>
                          </div>
                          <Link href="/search" className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-[#00766C] group-hover:bg-teal-50 transition-all">
                             <ArrowRight size={20} />
                          </Link>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Input Dock */}
          <div className="p-8 md:p-12 pt-4 bg-white border-t border-gray-50 relative">
             <div className="relative group max-w-[900px] mx-auto">
                <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-[44px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                
                <form 
                  onSubmit={handleSubmit}
                  className="relative bg-gray-50 border border-gray-100 rounded-[36px] p-2 flex items-center gap-3 group-focus-within:bg-white group-focus-within:shadow-2xl group-focus-within:shadow-teal-900/10 group-focus-within:border-[#00766C]/40 transition-all duration-500"
                >
                   <div className="w-14 h-14 bg-white border border-gray-100 rounded-[28px] flex items-center justify-center text-gray-400 group-focus-within:text-[#00766C] transition-colors shrink-0">
                      <Heart size={24} strokeWidth={2.5} />
                   </div>
                   <input 
                      autoFocus
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask Motio anything about your pain..."
                      className="flex-1 bg-transparent border-none outline-none text-[17px] font-medium text-[#333333] placeholder:text-gray-400 py-4 w-full"
                      disabled={isLoading}
                   />
                   <button 
                      type="submit" 
                      disabled={!(input || '').trim() || isLoading}
                      className={cn(
                        "w-14 h-14 rounded-[28px] flex items-center justify-center transition-all shrink-0",
                        (input || '').trim() && !isLoading 
                           ? "bg-[#00766C] text-white shadow-lg shadow-teal-100 hover:scale-[1.05] active:scale-95"
                           : "bg-gray-200 text-white cursor-not-allowed"
                      )}
                   >
                      <Send size={24} />
                   </button>
                </form>
             </div>
             <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                   <CheckCircle2 size={12} className="text-emerald-500" />
                   AI Symptom Triaging
                </div>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                   <CheckCircle2 size={12} className="text-emerald-500" />
                   Verified Physio Matching
                </div>
             </div>
          </div>
        </div>

        {/* ── Utility Sidebar (Desktop) ── */}
        <aside className="hidden xl:flex w-[340px] border-l border-gray-100 flex-col shrink-0 bg-gray-50/30">
          <div className="p-8 space-y-10">
            
            {/* Quick Actions */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Quick Triage</p>
              <div className="grid grid-cols-2 gap-3">
                 {['Knee Pain', 'Back Pain', 'Shoulder', 'Neck Stiffness'].map((tag) => (
                    <button key={tag} className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-black text-[#333333] hover:border-[#00766C] hover:text-[#00766C] transition-all">
                       {tag}
                    </button>
                 ))}
              </div>
            </div>

            {/* Recovery Progress */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40">
               <div className="flex items-center justify-between mb-6">
                  <p className="text-[15px] font-black text-[#333333]">My Recovery</p>
                  <Sparkles size={18} className="text-orange-400" />
               </div>
               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[12px] font-bold text-gray-400 mb-2">
                       <span>Mobility Phase</span>
                       <span>60%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                       <div className="h-full bg-[#00766C] w-[60%] rounded-full shadow-[0_0_8px_rgba(0,118,108,0.3)]" />
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-gray-500 leading-snug">
                    You've improved by <span className="text-emerald-600">12%</span> this week. Keep going!
                  </p>
               </div>
            </div>

            {/* Smart Library */}
            <div className="p-6 bg-teal-900 rounded-[32px] text-white overflow-hidden relative group">
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
               <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3">Learn More</p>
               <h4 className="text-[18px] font-black mb-4 leading-tight">Exercise Library</h4>
               <p className="text-[13px] font-bold text-white/70 mb-6 leading-relaxed">
                  Browse over 500+ clinical exercise videos curated by top physios.
               </p>
               <button className="flex items-center gap-2 text-[14px] font-black text-emerald-400 hover:gap-3 transition-all">
                  Open Library <ArrowRight size={16} />
               </button>
            </div>

          </div>
        </aside>

      </div>
    </div>
  )
}
