import Link from "next/link";

type LandingFooterProps = { variant?: "trainer" | "member" };

const productLinks = [
  { label: "Funkcie", href: "#features" },
  { label: "Ako to funguje", href: "#how-it-works" },
  { label: "Cenník", href: "#pricing" },
  { label: "Prihlásenie", href: "/login" },
];

const companyLinks = [
  { label: "O nás", href: "#" },
  { label: "Kontakt", href: "#" },
];

const legalLinks = [
  { label: "Podmienky používania", href: "#" },
  { label: "Ochrana súkromia", href: "#" },
];

const FOOTER_CSS = `
  @media (max-width: 767px) {
    .landing-footer-inner { padding: 40px 16px 28px !important; }
    .landing-footer-grid {
      grid-template-columns: 1fr !important;
      gap: 28px !important;
      margin-bottom: 28px !important;
      text-align: center !important;
    }
    .landing-footer-grid .landing-footer-brand-desc { max-width: none !important; margin-left: auto !important; margin-right: auto !important; }
    .landing-footer-grid .landing-footer-links { align-items: center !important; }
    .landing-footer-bottom {
      flex-direction: column !important;
      gap: 12px !important;
      text-align: center !important;
    }
  }
`;

export function LandingFooter({ variant = "trainer" }: LandingFooterProps) {
  const isMember = variant === "member";
  const accentBorder = isMember ? "rgba(167,139,250,0.08)" : "rgba(34,197,94,0.08)";
  const accent = isMember ? "#a78bfa" : "#22c55e";
  const accentGlow = isMember ? "rgba(167,139,250,0.6)" : "rgba(34,197,94,0.6)";

  return (
    <footer
      style={{
        background: "transparent",
        borderTop: `1px solid ${accentBorder}`,
      }}
    >
      <style>{FOOTER_CSS}</style>
      <div
        className="landing-footer-inner"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "64px 24px 40px",
        }}
      >
        <div
          className="landing-footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
                marginBottom: "10px",
              }}
            >
              Progressio
            </div>
            <p
              className="landing-footer-brand-desc"
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.58)",
                lineHeight: 1.7,
                maxWidth: "260px",
                margin: 0,
              }}
            >
              Platforma pre trénerov a členov. Sleduj pokrok, spravuj plány a
              dosahovaj výsledky.
            </p>
          </div>

          {/* Product */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.52)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Produkt
            </div>
            <ul className="landing-footer-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.62)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.52)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Spolocnost
            </div>
            <ul className="landing-footer-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.62)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.52)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Pravne
            </div>
            <ul className="landing-footer-links" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.62)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="landing-footer-bottom"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}
          >
            © {new Date().getFullYear()} Progressio. Vsetky prava vyhradene.
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 8px ${accentGlow}`,
              }}
            />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              Vsetky systemy funkcne
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
