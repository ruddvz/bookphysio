import { cn } from "@/lib/utils";

interface Insurer {
  name: string;
  shortName: string;
}

const insurers: Insurer[] = [
  { name: "Star Health", shortName: "Star Health" },
  { name: "Niva Bupa", shortName: "Niva Bupa" },
  { name: "HDFC ERGO", shortName: "HDFC ERGO" },
  { name: "Medi Assist", shortName: "Medi Assist" },
  { name: "ICICI Lombard", shortName: "ICICI Lombard" },
];

function InsuranceCard({ shortName }: { shortName: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white cursor-pointer transition-all duration-150",
        "hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:border-[#00766C]"
      )}
      style={{
        height: "80px",
        border: "1px solid #E5E5E5",
        borderRadius: "8px",
        padding: "16px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#333333",
        textAlign: "center",
      }}
    >
      {shortName}
    </div>
  );
}

export default function InsurancePlans() {
  return (
    <section style={{ padding: "64px 0", background: "#FFFFFF" }}>
      <div className="max-w-[1142px] mx-auto px-[60px]">
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#333333",
            marginBottom: "8px",
          }}
        >
          Find an in-network physio from over 100+ insurance plans
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#666666",
            marginBottom: "32px",
          }}
        >
          Add your insurance to see in-network physiotherapists
        </p>

        {/* Cards: 2-col mobile, 3-col tablet, 5-col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {insurers.map((ins) => (
            <InsuranceCard key={ins.name} shortName={ins.shortName} />
          ))}
        </div>

        <a
          href="#"
          style={{
            fontSize: "16px",
            color: "#00766C",
            textDecoration: "underline",
            display: "block",
            marginBottom: "24px",
          }}
        >
          See all (100+)
        </a>

        <button
          type="button"
          className={cn("transition-colors duration-150 hover:bg-[#F5F5F5]")}
          style={{
            background: "transparent",
            border: "1.5px solid #333333",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: 500,
            color: "#333333",
            cursor: "pointer",
          }}
        >
          Add your insurance coverage
        </button>
      </div>
    </section>
  );
}
