import Link from "next/link";
import { cn } from "@/lib/utils";

interface Specialty {
  emoji: string;
  label: string;
  href: string;
}

const specialties: Specialty[] = [
  { emoji: "🏃", label: "Sports Physio", href: "/specialty/sports" },
  { emoji: "🧠", label: "Neuro Physio", href: "/specialty/neuro" },
  { emoji: "🦴", label: "Ortho Physio", href: "/specialty/ortho" },
  { emoji: "👶", label: "Paediatric Physio", href: "/specialty/paediatric" },
  { emoji: "🌸", label: "Women's Health", href: "/specialty/womens-health" },
  { emoji: "👴", label: "Geriatric Physio", href: "/specialty/geriatric" },
];

function SpecialtyCard({ emoji, label, href }: Specialty) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center no-underline cursor-pointer",
        "transition-all duration-150 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
      )}
      style={{
        backgroundColor: "#FFF1BF",
        borderRadius: "12px",
        padding: "16px",
        textDecoration: "none",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          fontSize: "48px",
          marginBottom: "12px",
          height: "64px",
        }}
      >
        {emoji}
      </div>
      <span
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "#333333",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

export default function TopSpecialties() {
  return (
    <section style={{ padding: "48px 0" }}>
      <div className="max-w-[1142px] mx-auto px-[60px]">
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#333333",
            marginBottom: "24px",
          }}
        >
          Top physiotherapy specialties
        </h2>

        {/* 2-col mobile, 3-col tablet, 6-col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.map((s) => (
            <SpecialtyCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
