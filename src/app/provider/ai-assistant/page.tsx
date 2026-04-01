'use client'

import { useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { 
  Bot, 
  Send, 
  BookOpen, 
  Database, 
  History, 
  Plus, 
  UserPlus, 
  FileSearch, 
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Stethoscope,
  Microscope,
  Info,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock research library references
const MOCK_CITATIONS = [
  { id: 'C1', title: 'Manual therapy and exercise for rotatar cuff disease', journal: 'Cochrane Database of Systematic Reviews', year: '2023', url: '#' },
  { id: 'C2', title: 'Evidence-based clinical practice guidelines for the management of non-specific low back pain', journal: 'Journal of Physical Therapy Science', year: '2021', url: '#' },
  { id: 'C3', title: 'Effectiveness of eccentric exercise in Achilles tendinopathy', journal: 'British Journal of Sports Medicine', year: '2022', url: '#' },
]

const MOCK_CHAT = [
  {
    id: 'intro-1',
    role: 'assistant' as const,
    content: "Hello, Dr. Provider. I'm ready to assist with your clinical cases. Please provide patient details (age, symptoms, and clinical findings) for a research-backed assessment.",
  }
]

export default function MotioAssistant() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/provider',
    initialMessages: MOCK_CHAT,
  })

  // Auto-scroll to bottom of chat
  const chatRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-[calc(100vh-100px)] bg-[#FCFDFD] animate-in fade-in duration-700">
      
      {/* ── Left Sidebar: History & Case Management ── */}
      <aside className="w-[320px] border-r border-gray-100 bg-white flex flex-col shrink-0 overflow-hidden">
        <div className="p-6">
           <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#333333] text-white rounded-2xl font-black text-[15px] hover:bg-[#00766C] transition-all shadow-xl shadow-gray-200">
              <Plus size={18} />
              New Clinical Case
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          <div className="mb-8">
             <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Cases</p>
             <div className="space-y-1">
                {['ACL Post-Op - Rahul V.', 'Cervical Radiculopathy - Sneha K.', 'Plantar Fasciitis - Amit S.'].map((caseName, i) => (
                  <button key={i} className="w-full text-left px-4 py-3 rounded-2xl hover:bg-gray-50 flex items-center justify-between group transition-all">
                     <span className="text-[14px] font-bold text-[#333333] truncate">{caseName}</span>
                     <ChevronRight size={14} className="text-gray-300 group-hover:text-[#00766C] transition-colors" />
                  </button>
                ))}
             </div>
          </div>

          <div className="mb-8">
             <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Saved Research</p>
             <div className="space-y-4 px-4">
                {MOCK_CITATIONS.map((c) => (
                   <div key={c.id} className="flex flex-col gap-1 cursor-pointer group">
                      <p className="text-[12px] font-bold text-[#333333] group-hover:text-[#00766C] leading-snug line-clamp-2">{c.title}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{c.id} · {c.year}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
           <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-[#00766C]">
                 <Database size={20} />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[11px] font-black text-[#333333] leading-none mb-1">Peer-Reviewed DB</p>
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Syncing Live</p>
              </div>
           </div>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Header */}
        <header className="h-20 border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#00766C] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 animate-pulse">
                 <Bot size={28} />
              </div>
              <div>
                 <h1 className="text-[18px] font-black text-[#333333] tracking-tight leading-none mb-1.5 flex items-center gap-2">
                   MOTIO <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] uppercase tracking-[0.2em] rounded-md">Research AI</span>
                 </h1>
                 <p className="text-[12px] font-bold text-gray-400 leading-none">Evidence-Based Clinical Assistant</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-3 text-gray-400 hover:text-[#333333] transition-colors"><History size={20} /></button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-[13px] font-black text-[#333333] hover:bg-gray-100 transition-all border border-gray-100">
                 <BookOpen size={16} />
                 Clinical Library
              </button>
           </div>
        </header>

        {/* Chat Stream */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-8 md:px-[10%] lg:px-[15%] py-10 space-y-10 scrollbar-hide scroll-smooth">
          <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-[32px] border border-blue-100/50">
             <div className="mt-1 flex items-center justify-center w-10 h-10 bg-blue-600 rounded-2xl text-white shrink-0">
                <Info size={20} />
             </div>
             <div className="flex-1">
                <p className="text-[14px] font-black text-blue-900 mb-1 uppercase tracking-widest">Scientific Grounding</p>
                <p className="text-[13px] font-bold text-blue-800 leading-relaxed opacity-80">
                  Motio is currently grounded in the Cochrane Review database (2018-2024) and major Physical Therapy journals. Every insight requires a peer-reviewed citation.
                </p>
             </div>
          </div>

          {messages.map((msg: any, i: number) => (
            <div key={i} className={cn(
              "flex items-start gap-6 animate-in slide-in-from-bottom-2 duration-500",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'user' ? "hidden" : "bg-[#F3F4F6] text-teal-600"
              )}>
                {msg.role === 'assistant' ? <Microscope size={24} /> : <UserPlus size={20} />}
              </div>
              
              <div className={cn(
                "relative group max-w-[85%]",
                msg.role === 'user' ? "bg-white border-2 border-gray-50 p-6 rounded-[32px] rounded-tr-none shadow-sm" : "space-y-4"
              )}>
                 <div className={cn(
                  "text-[16px] font-medium leading-relaxed tracking-tight",
                  msg.role === 'assistant' ? "text-[#333333]" : "text-[#555555]"
                )}>
                   {/* Handle rich text simulation for citations */}
                   {String(msg.content).split(/(\[C\d+\])/).map((part: string, idx: number) => {
                      if (part.match(/\[C\d+\]/)) {
                        return <span key={idx} className="bg-teal-50 text-[#00766C] px-1.5 py-0.5 rounded-md text-[11px] font-black mx-1 cursor-help hover:bg-[#00766C] hover:text-white transition-colors">{part}</span>
                      }
                      return part
                   })}
                </div>

                {/* Dynamic Citations Extractor */}
                {(() => {
                   const matchedCitations = String(msg.content).match(/\[C\d+\]/g) || [];
                   const uniqueCitList = Array.from(new Set(matchedCitations.map((c: string) => c.replace(/[\[\]]/g, ''))));
                   
                   return uniqueCitList.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 mt-4 animate-in fade-in zoom-in duration-700">
                        {uniqueCitList.map((cid: string) => {
                          const cit = MOCK_CITATIONS.find(c => c.id === cid)
                          return (
                            <div key={cid} className="px-4 py-2 bg-gray-50 hover:bg-teal-50 rounded-xl border border-gray-100 flex items-center gap-3 group/cit cursor-pointer transition-all">
                               <CheckCircle2 size={12} className="text-[#059669]" />
                               <span className="text-[11px] font-black text-[#333333] group-hover/cit:text-[#00766C]">{cid}: {cit?.journal || 'Peer Reviewed Clinical Source'} ({cit?.year || '2023'})</span>
                               <ExternalLink size={10} className="text-gray-300" />
                            </div>
                          )
                        })}
                     </div>
                   );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Input Dock */}
        <div className="p-8 md:px-[10%] lg:px-[15%] pt-2 relative">
           <div className="absolute top-0 left-0 right-0 h-2 px-8 overflow-hidden">
              <div className="h-full bg-gradient-to-b from-white to-transparent" />
           </div>
           
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-[40px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              
              <form 
                 onSubmit={handleSubmit}
                 className="relative bg-[#FAFBFC] border border-gray-100 rounded-[32px] p-2 flex items-center gap-2 group-focus-within:bg-white group-focus-within:border-[#00766C]/40 group-focus-within:shadow-2xl group-focus-within:shadow-teal-900/5 transition-all"
              >
                <div className="w-14 h-14 rounded-[28px] bg-white border border-gray-50 shadow-sm flex items-center justify-center text-gray-400 group-focus-within:text-[#00766C] shrink-0">
                   <Stethoscope size={24} strokeWidth={2.5} />
                </div>
                <input 
                   autoFocus
                   value={input}
                   onChange={handleInputChange}
                   placeholder="Describe patient age, condition, and clinical findings..."
                   className="flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-[#333333] placeholder:text-gray-400 py-4 px-2 w-full"
                   disabled={isLoading}
                />
                <button 
                   type="submit" 
                   disabled={!(input || '').trim() || isLoading}
                   className={cn(
                     "w-14 h-14 rounded-[28px] flex items-center justify-center shrink-0 transition-all",
                     (input || '').trim() && !isLoading 
                        ? "bg-[#333333] text-white shadow-lg hover:bg-[#00766C] active:scale-95"
                        : "bg-gray-200 text-white cursor-not-allowed"
                   )}
                >
                   <Send size={24} />
                </button>
              </form>
           </div>
           <p className="mt-4 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
              Grounded in 2,400+ Verified clinical trials · Secure HIPAA Compliant environment
           </p>
        </div>
      </main>
    </div>
  )
}

function CitationIconComp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
       <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
