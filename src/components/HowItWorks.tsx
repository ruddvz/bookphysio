import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeatureCardData {
  emoji: string;
  title: string;
  cta: string;
  href: string;
  step: number;
}

const cards: FeatureCardData[] = [
  { step: 1, emoji: "🔍", title: "Browse verified physios near you", cta: "See specialties", href: "/search" },
  { step: 2, emoji: "⭐", title: "Read real reviews from patients", cta: "See providers", href: "/search" },
  { step: 3, emoji: "📅", title: "Book an appointment in minutes", cta: "Book now", href: "/search" },
];

function FeatureCard({ emoji, title, cta, href, step }: FeatureCardData) {
  return (
    <div
      className={cn("flex flex-col flex-1 rounded-xl bg-white transition-shadow duration-200 hover:shadow-[0_6px_24px_rgba(0,118,108,0.12)]")}
      style={{
        padding: "32px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderRadius: "16px",
        border: "1px solid #F0F0F0",
      }}
    >
      {/* Step number + icon */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: "44px",
            height: "44px",
            background: "#E6F4F3",
            fontSize: "22px",
          }}
        >
          {emoji}
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#00766C",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Step {step}
        </span>
      </div>
      <p
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#333333",
          marginBottom: "20px",
          lineHeight: "28px",
          flex: 1,
        }}
      >
        {title}
      </p>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 mt-auto transition-colors duration-150",
          "text-[#00766C] hover:text-[#005A52] font-semibold"
        )}
        style={{
          fontSize: "15px",
          textDecoration: "none",
        }}
      >
        {cta} →
      </Link>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section style={{ backgroundColor: "#FEFAE6", padding: "80px 0" }}>
      <div style={{ maxWidth: "1142px", margin: "0 auto", padding: "0 60px" }}>
        <h2
          className="text-center"
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#333333",
            marginBottom: "40px",
          }}
        >
          {"Let's get you a physio who gets you"}
        </h2>

        {/* Desktop: flex row | Tablet: 2+1 grid | Mobile: 1 col */}
        <div className="hidden md:grid grid-cols-2 lg:hidden gap-6">
          {cards.map((card) => (
            <FeatureCard key={card.cta} {...card} />
          ))}
        </div>
        <div className="hidden lg:flex flex-row gap-6">
          {cards.map((card) => (
            <FeatureCard key={card.cta} {...card} />
          ))}
        </div>
        <div className="flex flex-col gap-6 md:hidden">
          {cards.map((card) => (
            <FeatureCard key={card.cta} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
