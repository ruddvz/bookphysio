import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeatureCardData {
  emoji: string;
  title: string;
  cta: string;
  href: string;
}

const cards: FeatureCardData[] = [
  { emoji: "🩺", title: "Browse verified physios near you", cta: "See specialties", href: "/search" },
  { emoji: "⭐", title: "Read reviews from patients", cta: "See providers", href: "#" },
  { emoji: "📅", title: "Book an appointment today, online", cta: "See availability", href: "#" },
];

function FeatureCard({ emoji, title, cta, href }: FeatureCardData) {
  return (
    <div
      className={cn("flex flex-col flex-1 rounded-xl bg-white transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]")}
      style={{
        padding: "32px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderRadius: "12px",
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg mb-5"
        style={{
          height: "160px",
          background: "#F5F5F5",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "56px",
        }}
      >
        {emoji}
      </div>
      <p
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#333333",
          marginBottom: "20px",
          lineHeight: "28px",
        }}
      >
        {title}
      </p>
      <Link
        href={href}
        className={cn(
          "inline-block text-center mt-auto transition-colors duration-150",
          "hover:bg-[#333333] hover:text-white"
        )}
        style={{
          border: "1.5px solid #333333",
          background: "transparent",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "15px",
          fontWeight: 500,
          color: "#333333",
          cursor: "pointer",
        }}
      >
        {cta}
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
