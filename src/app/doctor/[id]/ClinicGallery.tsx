'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClinicGalleryProps {
  images: string[]
}

export default function ClinicGallery({ images }: ClinicGalleryProps) {
  const [index, setIndex] = useState(0)

  // Fallback for empty gallery
  const galleryImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1629909613654-28711ee13bb6?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200'
  ]

  const next = () => setIndex((index + 1) % galleryImages.length)
  const prev = () => setIndex((index - 1 + galleryImages.length) % galleryImages.length)

  return (
    <section className="bg-white rounded-[32px] border border-gray-100 p-8 mb-8 shadow-sm group/gallery overflow-hidden">
      <div className="flex items-center justify-between mb-8 px-1">
         <div>
            <h2 className="text-[24px] font-black text-[#333333] tracking-tight">Clinic Tour</h2>
            <p className="text-[14px] text-gray-400 font-bold mt-1">High-fidelity preview of our treatment environment</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-1">
               {galleryImages.map((_, i) => (
                  <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === index ? "w-8 bg-[#00766C]" : "w-2 bg-gray-100")} />
               ))}
            </div>
            <div className="flex gap-2">
               <button onClick={prev} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#00766C] transition-all"><ChevronLeft size={20} /></button>
               <button onClick={next} className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-[#333333] hover:bg-[#00766C] hover:text-white transition-all shadow-lg active:scale-95"><ChevronRight size={20} /></button>
            </div>
         </div>
      </div>

      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden bg-gray-50 group-hover/gallery:shadow-2xl group-hover/gallery:shadow-teal-900/5 transition-all duration-700">
         {galleryImages.map((img, i) => (
           <img 
              key={i}
              src={img}
              alt={`Clinic view ${i + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out",
                i === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.05]"
              )}
           />
         ))}

         {/* Overlay Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
         
         <div className="absolute bottom-10 left-10 flex items-center gap-4">
            <div className="px-5 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center gap-3 text-white">
               <ImageIcon size={18} />
               <span className="text-[13px] font-black uppercase tracking-widest">{index + 1} / {galleryImages.length} View</span>
            </div>
            <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#333333] hover:bg-[#00766C] hover:text-white transition-all shadow-xl active:scale-90">
               <Maximize2 size={20} />
            </button>
         </div>
         
         {/* Live Badge */}
         <div className="absolute top-10 right-10 px-4 py-2 bg-emerald-500 rounded-xl text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20">
            Verified Setting
         </div>
      </div>
    </section>
  )
}
