import Link from "next/link";
import { cn } from "@/lib/utils";

interface Specialty {
  emoji: string;
  label: string;
  href: string;
  bg?: string;
}

const specialties: Specialty[] = [
  { emoji: "🏃", label: "Sports Physio", href: "/specialty/sports-physio", bg: "#E6F4F3" },
  { emoji: "🧠", label: "Neuro Physio", href: "/specialty/neuro-physio", bg: "#DCE9FD" },
  { emoji: "🦴", label: "Ortho Physio", href: "/specialty/ortho-physio", bg: "#FFF1BF" },
  { emoji: "👶", label: "Paediatric Physio", href: "/specialty/paediatric-physio", bg: "#FFC794" },
  { emoji: "🌸", label: "Women's Health", href: "/specialty/womens-health", bg: "#F9F8F7" },
  { emoji: "👴", label: "Geriatric Physio", href: "/specialty/geriatric-physio", bg: "#E6F4F3" },
];

function SpecialtyCard({ emoji, label, href, bg }: Specialty) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-[16px] transition-all duration-300",
        "border border-transparent hover:border-[#00766C] hover:shadow-xl hover:-translate-y-1"
      )}
      style={{ backgroundColor: bg || "#FFF1BF" }}
    >
      <div className="text-[40px] md:text-[48px] mb-3 h-16 flex items-center justify-center">
        {emoji}
      </div>
      <span className="text-[14px] md:text-[15px] font-bold text-[#333333] text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

export default function TopSpecialties() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1142px] mx-auto px-6 md:px-[60px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-bold text-[#333333] tracking-tight">
              Top specialties
            </h2>
            <p className="text-[16px] text-[#666666] mt-2">
              Book verified experts across all major clinical specializations.
            </p>
          </div>
          <Link href="/search" className="text-[#00766C] font-bold hover:underline flex items-center gap-1">
             View all specialties 
             <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {specialties.map((s) => (
            <SpecialtyCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
