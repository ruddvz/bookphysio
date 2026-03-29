import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HealthNetwork {
  name: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const networks: HealthNetwork[] = [
  { name: "Apollo Health" },
  { name: "Fortis Healthcare" },
  { name: "Max Healthcare" },
  { name: "Manipal Hospitals" },
  { name: "Narayana Health" },
  { name: "Aster DM Healthcare" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LogoCard({ name }: HealthNetwork) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: "8px",
        padding: "20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "80px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#666666",
        textAlign: "center",
      }}
    >
      {name}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HealthSystems() {
  return (
    <section
      style={{
        backgroundColor: "#F9F8F7",
        padding: "64px 0",
      }}
    >
      <div
        className="container-bp"
        style={{ textAlign: "center" }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#00766C",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "16px",
          }}
        >
          BookPhysio for health systems
        </p>

        <h2
          style={{
            fontSize: "32px",
            lineHeight: "44px",
            fontWeight: 700,
            color: "#333333",
            marginBottom: 0,
          }}
        >
          We&apos;re trusted by top health networks
        </h2>

        {/* Logo grid — 2-col mobile, 3-col tablet, 6-col desktop */}
        <div
          className={cn(
            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
            "items-center"
          )}
          style={{
            gap: "24px",
            marginTop: "40px",
            marginBottom: "40px",
          }}
        >
          {networks.map((network) => (
            <LogoCard key={network.name} name={network.name} />
          ))}
        </div>

        <a
          href="#"
          className={cn("transition-colors duration-150 hover:bg-[#005A52]")}
          style={{
            backgroundColor: "#00766C",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            padding: "14px 28px",
            borderRadius: "24px",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Partner with BookPhysio
        </a>
      </div>
    </section>
  );
}
