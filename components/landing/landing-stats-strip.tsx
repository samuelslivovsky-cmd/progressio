"use client";

const STATS = [
  { n: "100+", l: "aktívnych trénerov" },
  { n: "500+", l: "členov na platforme" },
  { n: "0€", l: "základný plán navždy" },
  { n: "4.9★", l: "priemerné hodnotenie" },
];

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 1,
  background: "rgba(255,255,255,0.06)",
  maxWidth: 1100,
  margin: "0 auto",
};

const cellStyle: React.CSSProperties = {
  background: "#080c09",
  padding: "28px 20px",
  textAlign: "center",
};

export function LandingStatsStrip() {
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="landing-stats-strip-grid" style={gridStyle}>
        {STATS.map((item) => (
          <div key={item.l} style={cellStyle}>
            <div style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>
              {item.n}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 500 }}>
              {item.l}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .landing-stats-strip-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
