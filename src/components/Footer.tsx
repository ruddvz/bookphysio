'use client'

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Smartphone, Mail, Send, ShieldCheck, Heart, MapPin, Globe, Share2, Activity, User } from 'lucide-react';

const COLUMNS = [
  {
    heading: 'BookPhysio',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Our Experts', href: '/search' },
      { label: 'Press & Media', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Patient Care',
    links: [
      { label: 'Physio Journal', href: '/journal' },
      { label: 'Verified Reviews', href: '/reviews' },
      { label: 'Help Center', href: '/help' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Tech Blog', href: '/tech-blog', isNew: true },
    ],
  },
  {
    heading: 'Top Specialties',
    links: [
      { label: 'Sports Physio', href: '/search?specialty=Sports+Physio' },
      { label: 'Neuro Physio', href: '/search?specialty=Neuro+Physio' },
      { label: 'Ortho Physio', href: '/search?specialty=Ortho+Physio' },
      { label: 'Paediatric', href: '/search?specialty=Paediatric+Physio' },
      { label: "Women's Health", href: '/search?specialty=Womens+Health' },
    ],
  },
  {
    heading: 'For Practice',
    links: [
      { label: 'AI Scheduler', href: '/providers/ai-scheduler', isNew: true },
      { label: 'List Practice', href: '/providers/list' },
      { label: 'EHR Partners', href: '/providers/ehr' },
      { label: 'Developer Portal', href: '/developers' },
      { label: 'Enterprise', href: '/enterprise' },
    ],
  },
];

const SOCIALS = [
  { icon: Globe, href: '#' },
  { icon: Heart, href: '#' },
  { icon: Activity, href: '#' },
  { icon: Share2, href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-24 overflow-hidden border-t border-white/5">
      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px]">
        
        {/* Top Branding & Newsletter Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20">
           <div className="max-w-[400px]">
              <div className="text-[28px] font-black tracking-tighter mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 bg-[#00766C] rounded-lg flex items-center justify-center text-sm">BP</div>
                 BookPhysio.
              </div>
              <p className="text-[16px] font-bold text-gray-400 leading-relaxed mb-8">
                Revolutionizing recovery by connecting you with India's most verified physiotherapy experts. Your journey to pain-free living starts here.
              </p>
              <div className="flex items-center gap-4">
                 {SOCIALS.map((social, i) => (
                   <a key={i} href={social.href} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#00766C] hover:text-white transition-all text-gray-400 group">
                      <social.icon size={18} strokeWidth={2.5} />
                   </a>
                 ))}
              </div>
           </div>

           <div className="w-full lg:max-w-[450px]">
              <h3 className="text-[14px] font-black text-white uppercase tracking-widest mb-6">Stay Updated</h3>
              <p className="text-[14px] font-bold text-gray-400 mb-6">Get recovery tips and platform updates delivered to your inbox.</p>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-5 flex items-center text-gray-400"><Mail size={18} /></div>
                 <input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-32 outline-none focus:border-[#00766C]/50 transition-all font-bold placeholder:text-gray-600"
                 />
                 <button className="absolute right-2 top-2 bottom-2 px-6 bg-[#00766C] text-white font-black rounded-[14px] text-[14px] hover:bg-[#005A52] active:scale-95 transition-all">
                    Join Us
                 </button>
              </div>
           </div>
        </div>

        <div className="h-px w-full bg-white/5 mb-20" />

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-y-12 gap-x-8 mb-20">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[13px] font-black text-white/40 mb-8 uppercase tracking-[0.2em]">
                {col.heading}
              </h3>
              <ul className="space-y-5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-black text-gray-300 hover:text-white transition-all flex items-center gap-2 group"
                    >
                      {link.label}
                      {link.isNew && (
                        <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest border border-emerald-500/20">
                          NEW
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Action Row: App Stores */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-16 border-b border-white/5">
           <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="px-6 py-3 bg-black border border-white/10 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all group h-[64px]">
                 <div className="w-10 h-10 bg-[#00766C] rounded-xl flex items-center justify-center text-white"><Smartphone size={24} /></div>
                 <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Download on</p>
                    <p className="text-[16px] font-black text-white tracking-tight">App Store</p>
                 </div>
              </button>
              <button className="px-6 py-3 bg-black border border-white/10 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all group h-[64px]">
                 <div className="w-10 h-10 bg-[#00766C] rounded-xl flex items-center justify-center text-white"><Send size={24} /></div>
                 <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Get it on</p>
                    <p className="text-[16px] font-black text-white tracking-tight">Google Play</p>
                 </div>
              </button>
           </div>
           
           <div className="flex items-center gap-8 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <ShieldCheck size={40} className="text-[#00766C]" strokeWidth={1} />
              <div className="h-10 w-px bg-white/10" />
              <MapPin size={40} className="text-[#00766C]" strokeWidth={1} />
           </div>
        </div>

        {/* Legal & Footer Bottom */}
        <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-center md:text-left">
              <p className="text-[12px] font-bold text-gray-400 max-w-[700px] leading-relaxed mb-6">
                Disclaimer: BookPhysio is an appointment booking platform. We do not provide medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[12px] font-black text-gray-300">
                 <span>© 2026 BookPhysio.in</span>
                 <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                 <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                 <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
              </div>
           </div>
           
           <div className="flex items-center gap-3 text-[12px] font-black text-gray-400 whitespace-nowrap">
              Made in India with <Heart size={14} className="text-[#E85D2A] fill-[#E85D2A]" /> for Health
           </div>
        </div>
      </div>
    </footer>
  );
}
