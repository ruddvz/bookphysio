import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BulletItem {
  text: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const bullets: BulletItem[] = [
  { text: "Reach patients who need your physiotherapy expertise" },
  { text: "Smart scheduling that reduces no-shows by up to 30%" },
  { text: "Seamless integration with your existing clinic workflow" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ImagePlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "560px",
        height: "380px",
        backgroundColor: "#F0F0F0",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "80px",
      }}
      aria-hidden="true"
    >
      👨‍⚕️
    </div>
  );
}

function BulletPoint({ text }: BulletItem) {
  return (
    <li
      style={{
        fontSize: "16px",
        lineHeight: "26px",
        color: "#333333",
        paddingLeft: "24px",
        marginBottom: "12px",
        position: "relative",
        listStyle: "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          color: "#00766C",
          fontWeight: 700,
        }}
      >
        ✓
      </span>
      {text}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProviderCTA() {
  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        padding: "80px 0",
      }}
    >
      <div
        className={cn(
          "container-bp",
          "flex flex-col md:flex-row items-center"
        )}
        style={{ gap: "64px" }}
      >
        {/* Left col — image */}
        <div
          className="w-full md:w-1/2"
          style={{ flex: "0 0 50%" }}
        >
          <ImagePlaceholder />
        </div>

        {/* Right col — text */}
        <div
          className="w-full md:w-1/2"
          style={{ flex: "0 0 50%" }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#00766C",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px",
            }}
          >
            bookphysio for private practices
          </p>

          <h2
            style={{
              fontSize: "32px",
              lineHeight: "44px",
              fontWeight: 700,
              color: "#333333",
              marginBottom: "24px",
            }}
          >
            Are you a practice interested in filling your calendar?
          </h2>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              marginBottom: "32px",
            }}
          >
            {bullets.map((bullet) => (
              <BulletPoint key={bullet.text} text={bullet.text} />
            ))}
          </ul>

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
            Learn more about our practice solutions
          </a>
        </div>
      </div>
    </section>
  );
}
