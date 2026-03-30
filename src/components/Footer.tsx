import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Smartphone, ChevronRight } from 'lucide-react';

const COLUMNS = [
  {
    heading: 'BookPhysio',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About us', href: '/about' },
      { label: 'Press', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Help', href: '/help' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'The Physio Journal', href: '/journal' },
      { label: 'Resources for providers', href: '/resources' },
      { label: 'Community Standards', href: '/community' },
      { label: 'Data and privacy', href: '/privacy' },
      { label: 'Verified reviews', href: '/reviews' },
      { label: 'Tech Blog', href: '/tech-blog', isNew: true },
    ],
  },
  {
    heading: 'Popular Treatments',
    links: [
      { label: 'Back Pain Relief', href: '/treatments/back-pain' },
      { label: 'Post-Surgery Rehab', href: '/treatments/post-surgery' },
      { label: 'Sports Injuries', href: '/treatments/sports-injuries' },
      { label: 'Neck Pain Treatment', href: '/treatments/neck-pain' },
      { label: 'Joint Mobility', href: '/treatments/joint-mobility' },
    ],
  },
  {
    heading: 'Top Specialties',
    links: [
      { label: 'Sports Physio', href: '/specialties/sports' },
      { label: 'Neuro Physio', href: '/specialties/neuro' },
      { label: 'Ortho Physio', href: '/specialties/ortho' },
      { label: 'Paediatric Physio', href: '/specialties/paediatric' },
      { label: "Women's Health", href: '/specialties/womens-health' },
    ],
  },
  {
    heading: 'For Providers',
    links: [
      { label: 'Try our AI scheduler', href: '/providers/ai-scheduler', isNew: true },
      { label: 'List your practice', href: '/providers/list' },
      { label: 'Become an EHR partner', href: '/providers/ehr' },
      { label: 'Developers', href: '/developers' },
      { label: 'Enterprise Solutions', href: '/enterprise' },
    ],
  },
];

const LEGAL_LINKS = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Consumer Health', href: '/consumer-health' },
  { label: 'Site map', href: '/sitemap' },
  { label: 'Your privacy choices', href: '/privacy-choices' },
];

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white overflow-hidden">
      {/* Main content grid */}
      <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[14px] font-bold text-white mb-6 uppercase tracking-wider">
                {col.heading}
              </h3>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-[#CCCCCC] hover:text-white transition-colors flex items-center gap-2 group/link"
                    >
                      {link.label}
                      {link.isNew && (
                        <span className="bg-[#FEED5A] text-[#333333] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
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

        {/* Action Row: App Store + Social */}
        <div className="mt-16 md:mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
             <div className="bg-black border border-white/20 rounded-[8px] px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors group h-[52px]">
                <Smartphone className="w-6 h-6 text-[#00766C]" />
                <div className="text-[10px] uppercase font-bold leading-tight">
                   Download on the <br/> <span className="text-[14px]">App Store</span>
                </div>
             </div>
             <div className="bg-black border border-white/20 rounded-[8px] px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors group h-[52px]">
                <div className="w-6 h-6 bg-[#00766C] rounded-full flex items-center justify-center text-[10px]">▶</div>
                <div className="text-[10px] uppercase font-bold leading-tight">
                   Get it on <br/> <span className="text-[14px]">Google Play</span>
                </div>
             </div>
          </div>

          {/* Social icons using simple text for stability during polish */}
          <div className="flex gap-6">
            {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map((label) => (
              <a 
                key={label}
                href="#"
                className="text-[14px] font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="bg-[#222222] py-8 border-t border-white/5">
        <div className="max-w-[1142px] mx-auto px-6 md:px-[60px]">
          <p className="text-[12px] text-[#999999] leading-relaxed mb-8 max-w-[800px]">
            The content provided here and elsewhere on the BookPhysio.in site or mobile app is provided for general informational purposes only. 
            It is not intended as, and BookPhysio does not provide, medical advice, diagnosis or treatment. Always contact your healthcare provider directly.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-[#999999]">
                <span>© 2026 BookPhysio.in</span>
                {LEGAL_LINKS.map((link) => (
                   <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                     {link.label}
                   </Link>
                ))}
             </div>
             
             <div className="flex items-center gap-4 text-[12px] text-[#999999]">
                <span>Made with care in India</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]"></div>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
