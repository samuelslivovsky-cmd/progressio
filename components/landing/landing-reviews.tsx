"use client";

type LandingReviewsProps = { variant?: "trainer" | "member" };

const reviews = [
  { text: "Konečne jeden systém. Nemusím riešiť tabuľky ani WhatsApp.", author: "Peter K.", role: "Tréner", since: "6 mesiacov" },
  { text: "Logujem jedlo a tréningy každý deň. Tréner vidí môj pokrok.", author: "Mária S.", role: "Členka", since: "4 mesiace" },
  { text: "15 klientov, všetko na jednom mieste. Šetrí hodiny týždenne.", author: "Jakub V.", role: "Tréner", since: "8 mesiacov" },
  { text: "Progress fotky a grafy ma motivujú. Tréner komentuje priamo v apke.", author: "Lucia M.", role: "Členka", since: "3 mesiace" },
  { text: "AI kouč mi zostavil TDEE a makrá. Prvý mesiac: -3,2 kg.", author: "Michal R.", role: "Člen AI", since: "2 mesiace" },
  { text: "Prioritná fronta je presne to, čo som potreboval. Vidím, kto má problém.", author: "Andrea T.", role: "Trénerka", since: "5 mesiacov" },
  { text: "Bez trénera som si nevedel predstaviť štruktúru. AI mi dáva týždenný feedback.", author: "Ján M.", role: "Člen AI", since: "1 mesiac" },
];

const REVIEWS_CSS = `
  @keyframes landing-reviews-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .landing-reviews-marquee-track {
    display: flex;
    width: max-content;
    animation: landing-reviews-marquee 40s linear infinite;
  }
  .landing-reviews-marquee-track:hover {
    animation-play-state: paused;
  }
  @media (max-width: 767px) {
    .landing-reviews-wrap { padding: 56px 0 !important; }
    .landing-reviews-head { margin-bottom: 28px !important; }
    .landing-reviews-marquee-track { animation-duration: 60s; }
  }
`;

function ReviewCard({
  r,
  accentColor,
  accentBg,
  borderColor,
}: {
  r: (typeof reviews)[0];
  accentColor: string;
  accentBg: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 12,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${borderColor}`,
        borderRadius: 18,
        padding: "24px 28px",
        marginRight: 20,
        minWidth: 280,
        maxWidth: 320,
        flexShrink: 0,
      }}
    >
      <p
        style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.82)",
          lineHeight: 1.65,
          margin: 0,
          flex: 1,
        }}
      >
        &ldquo;{r.text}&rdquo;
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{r.author}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{r.role}</div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: accentColor,
            background: accentBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 100,
            padding: "4px 10px",
          }}
        >
          {r.since}
        </div>
      </div>
    </div>
  );
}

export function LandingReviews({ variant = "trainer" }: LandingReviewsProps) {
  const isMember = variant === "member";
  const accentColor = isMember ? "#a78bfa" : "#22c55e";
  const accentLight = isMember ? "#c4b5fd" : "#4ade80";
  const accentBg = isMember ? "rgba(167,139,250,0.08)" : "rgba(34,197,94,0.08)";
  const borderColor = isMember ? "rgba(167,139,250,0.18)" : "rgba(34,197,94,0.12)";

  return (
    <div
      className="landing-reviews-wrap"
      style={{
        background: "transparent",
        padding: "100px 0",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      <style>{REVIEWS_CSS}</style>
      <div style={{ marginBottom: 48, textAlign: "center", padding: "0 24px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Referencie
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 3.5vw, 42px)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Čo hovoria tréneri a členovia
        </h2>
      </div>

      <div
        style={{
          overflow: "hidden",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
        }}
      >
        <div className="landing-reviews-marquee-track">
          {[0, 1].map((pass) =>
            reviews.map((r, i) => (
              <ReviewCard
                key={`${pass}-${i}-${r.author}`}
                r={r}
                accentColor={accentLight}
                accentBg={accentBg}
                borderColor={borderColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
