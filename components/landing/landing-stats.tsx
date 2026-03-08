"use client";

import { useRef, useEffect, useState } from "react";

function useVisible(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const stats = [
  { number: "100+", label: "aktívnych trénerov" },
  { number: "500+", label: "spokojných členov" },
  { number: "0 €", label: "pre členov navždy" },
  { number: "4.9", label: "priemerné hodnotenie" },
];

const STATS_CSS = `
  .landing-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
  .landing-stats-cell { border-right: 1px solid rgba(255,255,255,0.06); }
  .landing-stats-cell:last-child { border-right: none; }
  @media (max-width: 767px) {
    .landing-stats-grid { grid-template-columns: repeat(2, 1fr); padding: 32px 16px; }
    .landing-stats-cell { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .landing-stats-cell:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.06); }
    .landing-stats-cell:nth-last-child(-n+2) { border-bottom: none; }
  }
`;

export function LandingStats() {
  const { ref, visible } = useVisible(0.2);

  return (
    <div
      style={{
        background: "transparent",
        borderTop: "1px solid rgba(34,197,94,0.1)",
        borderBottom: "1px solid rgba(34,197,94,0.1)",
      }}
    >
      <style>{STATS_CSS}</style>
      <div
        ref={ref}
        className="landing-stats-grid"
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "52px 24px",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="landing-stats-cell"
            style={{
              textAlign: "center",
              padding: "8px 16px",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
            }}
          >
            <div
              style={{
                fontSize: "clamp(24px, 3vw, 42px)",
                fontWeight: 800,
                color: "#22c55e",
                lineHeight: 1,
                marginBottom: "6px",
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.number}
            </div>
            <div
              style={{
                fontSize: "clamp(12px, 2vw, 14px)",
                color: "rgba(255,255,255,0.58)",
                letterSpacing: "0.03em",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
