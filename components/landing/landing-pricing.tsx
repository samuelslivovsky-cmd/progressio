"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

function useVisible(threshold = 0.1) {
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

const plans = [
  {
    id: "client-free",
    name: "Klient",
    price: "0",
    period: "navždy",
    desc: "S trénerom — logging a plány",
    cta: "Registrovať sa",
    href: "/register",
    highlighted: false,
    aiTier: false,
  },
  {
    id: "client-ai",
    name: "Klient AI",
    price: "4.99",
    period: "mesiac",
    desc: "Solo — bez trénera, s AI koučom",
    cta: "Vyskúšať AI",
    href: "/register",
    highlighted: false,
    aiTier: true,
  },
  {
    id: "trainer-starter",
    name: "Tréner Starter",
    price: "0",
    period: "navždy",
    desc: "Až 3 klienti, základné nástroje",
    cta: "Začať zadarmo",
    href: "/register",
    highlighted: false,
    aiTier: false,
  },
  {
    id: "trainer-pro",
    name: "Tréner Pro",
    price: "9",
    period: "mesiac",
    desc: "Neobmedzení klienti + inteligencia",
    cta: "Vybrať Pro",
    href: "/register",
    highlighted: true,
    aiTier: false,
  },
];

type Cell = true | false | string;

const groups: {
  label: string;
  rows: { feature: string; cells: [Cell, Cell, Cell, Cell] }[];
}[] = [
  {
    label: "Logovanie",
    rows: [
      { feature: "Denník stravy a kalórie",       cells: [true,  true,  true,  true]  },
      { feature: "Tréningový denník",              cells: [true,  true,  true,  true]  },
      { feature: "Váha, merania, grafy",           cells: [true,  true,  true,  true]  },
      { feature: "Progress fotky",                 cells: [true,  true,  true,  true]  },
    ],
  },
  {
    label: "Plány",
    rows: [
      { feature: "Priradený plán od trénera",      cells: [true,  false, "tvorí", "tvorí"] },
      { feature: "Tvorba stravovacích plánov",     cells: [false, false, true,  true]  },
      { feature: "Tvorba tréningových plánov",     cells: [false, false, true,  true]  },
      { feature: "Počet klientov",                 cells: [false, false, "Až 3", "Neobmedzene"] },
      { feature: "Pokrok klientov v reálnom čase", cells: [false, false, true,  true]  },
    ],
  },
  {
    label: "AI koučing",
    rows: [
      { feature: "Týždenné AI hodnotenie",         cells: [false, true,  false, false] },
      { feature: "AI adaptácia plánu",             cells: [false, true,  false, false] },
      { feature: "Výpočet TDEE a makier",          cells: [false, true,  false, false] },
      { feature: "Chat s AI koučom",               cells: [false, true,  false, false] },
      { feature: "Predikcia dosiahnutia cieľa",    cells: [false, true,  false, true]  },
      { feature: "Inteligentné upozornenia",       cells: [false, true,  false, true]  },
    ],
  },
  {
    label: "Trénerská inteligencia",
    rows: [
      { feature: "Drop-off riziko score (0–100)",  cells: [false, false, false, true]  },
      { feature: "Detekcia plató klientov",        cells: [false, false, false, true]  },
      { feature: "Detekcia vynechaných cvikov",    cells: [false, false, false, true]  },
      { feature: "Prioritná fronta klientov",      cells: [false, false, false, true]  },
      { feature: "Navrhnuté akcie pre trénera",    cells: [false, false, false, true]  },
      { feature: "Export dát a reporty",           cells: [false, false, false, true]  },
    ],
  },
  {
    label: "Ostatné",
    rows: [
      { feature: "Podpora", cells: ["Email", "Prioritná", "Email", "Prioritná"] },
    ],
  },
];

function Check({ highlighted, ai }: { highlighted?: boolean; ai?: boolean }) {
  const color = ai ? "#a78bfa" : "#22c55e";
  const bg = ai ? "rgba(167,139,250,0.14)" : "rgba(34,197,94,0.14)";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill={highlighted ? bg : bg} />
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dash() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6 9h6" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CellValue({ value, plan }: { value: Cell; plan: typeof plans[0] }) {
  if (value === true) return <Check highlighted={plan.highlighted} ai={plan.aiTier} />;
  if (value === false) return <Dash />;
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: 600,
      color: plan.highlighted ? "#4ade80" : plan.aiTier ? "#c4b5fd" : "rgba(255,255,255,0.62)",
      whiteSpace: "nowrap",
    }}>
      {value}
    </span>
  );
}

export function LandingPricing() {
  const { ref, visible } = useVisible(0.08);

  const COLS = "1fr repeat(4, minmax(0, 138px))";

  return (
    <div style={{ background: "transparent", padding: "100px 0" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, color: "#22c55e",
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px",
          }}>
            Cenník
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#fff",
            lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 14px",
          }}>
            Jednoduché ceny
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.58)", margin: 0 }}>
            S trénerom? Zadarmo. Solo? AI preberá rolu trénera za 4.99€.
          </p>
        </div>

        {/* Table */}
        <div
          ref={ref}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            overflow: "hidden",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Plan headers */}
          <div style={{ display: "grid", gridTemplateColumns: COLS, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ padding: "24px 20px" }}>
              {/* Two-group label */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Klienti</div>
                  <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.08)" }} />
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Tréneri</div>
                  <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.08)" }} />
                </div>
              </div>
            </div>

            {plans.map((plan) => {
              const accentColor = plan.highlighted ? "#22c55e" : plan.aiTier ? "#a78bfa" : "rgba(255,255,255,0.5)";
              const topBarColor = plan.highlighted ? "#22c55e" : plan.aiTier ? "#a78bfa" : "transparent";
              const bgColor = plan.highlighted ? "rgba(34,197,94,0.05)" : plan.aiTier ? "rgba(167,139,250,0.04)" : "transparent";
              return (
                <div
                  key={plan.id}
                  style={{
                    padding: "20px 14px",
                    textAlign: "center",
                    borderLeft: "1px solid rgba(255,255,255,0.07)",
                    background: bgColor,
                    position: "relative",
                  }}
                >
                  {(plan.highlighted || plan.aiTier) && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      height: "2px", background: topBarColor,
                      boxShadow: `0 0 12px ${topBarColor}80`,
                    }} />
                  )}
                  {plan.highlighted && (
                    <div style={{
                      position: "absolute", top: "-13px", left: "50%",
                      transform: "translateX(-50%)",
                      background: "#22c55e", color: "#040e07",
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                      padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap",
                    }}>
                      Odporúčané
                    </div>
                  )}
                  <div style={{
                    fontSize: "11px", fontWeight: 700, color: accentColor,
                    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px",
                  }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>€</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
                    / {plan.period}
                  </div>
                  <Link
                    href={plan.href}
                    style={{
                      display: "block",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textDecoration: "none",
                      background: plan.highlighted
                        ? "#22c55e"
                        : plan.aiTier
                        ? "rgba(167,139,250,0.15)"
                        : "rgba(255,255,255,0.06)",
                      color: plan.highlighted
                        ? "#040e07"
                        : plan.aiTier
                        ? "#c4b5fd"
                        : "rgba(255,255,255,0.65)",
                      border: plan.aiTier
                        ? "1px solid rgba(167,139,250,0.3)"
                        : plan.highlighted
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Feature groups */}
          {groups.map((group, gi) => (
            <div key={group.label}>
              {/* Group label row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: COLS,
                background: "rgba(255,255,255,0.02)",
                borderTop: gi > 0 ? "1px solid rgba(255,255,255,0.07)" : undefined,
              }}>
                <div style={{
                  padding: "9px 20px",
                  fontSize: "10px", fontWeight: 700,
                  color: group.label === "AI koučing" ? "#a78bfa" : "#22c55e",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  {group.label === "AI koučing" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5S7 9.76 7 7a5 5 0 0 1 5-5z" />
                      <path d="M3 21c0-4.42 4.03-8 9-8s9 3.58 9 8" />
                    </svg>
                  )}
                  {group.label}
                </div>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      borderLeft: "1px solid rgba(255,255,255,0.07)",
                      background: plan.highlighted
                        ? "rgba(34,197,94,0.03)"
                        : plan.aiTier
                        ? "rgba(167,139,250,0.03)"
                        : "transparent",
                    }}
                  />
                ))}
              </div>

              {/* Feature rows */}
              {group.rows.map((row, ri) => (
                <div
                  key={row.feature}
                  style={{
                    display: "grid",
                    gridTemplateColumns: COLS,
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                    background: ri % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent",
                  }}
                >
                  <div style={{
                    padding: "12px 20px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.68)",
                    display: "flex",
                    alignItems: "center",
                  }}>
                    {row.feature}
                  </div>
                  {row.cells.map((cell, ci) => {
                    const plan = plans[ci];
                    return (
                      <div
                        key={plan.id}
                        style={{
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderLeft: "1px solid rgba(255,255,255,0.07)",
                          background: plan.highlighted
                            ? "rgba(34,197,94,0.02)"
                            : plan.aiTier
                            ? "rgba(167,139,250,0.02)"
                            : "transparent",
                        }}
                      >
                        <CellValue value={cell} plan={plan} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {/* Bottom CTA row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: COLS,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.01)",
          }}>
            <div style={{ padding: "18px 20px" }} />
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: "18px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderLeft: "1px solid rgba(255,255,255,0.07)",
                  background: plan.highlighted
                    ? "rgba(34,197,94,0.03)"
                    : plan.aiTier
                    ? "rgba(167,139,250,0.03)"
                    : "transparent",
                }}
              >
                <Link
                  href={plan.href}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "9px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textDecoration: "none",
                    textAlign: "center",
                    background: plan.highlighted
                      ? "#22c55e"
                      : plan.aiTier
                      ? "rgba(167,139,250,0.15)"
                      : "rgba(255,255,255,0.05)",
                    color: plan.highlighted
                      ? "#040e07"
                      : plan.aiTier
                      ? "#c4b5fd"
                      : "rgba(255,255,255,0.65)",
                    border: plan.aiTier
                      ? "1px solid rgba(167,139,250,0.3)"
                      : plan.highlighted
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.28)" }}>
          Klient AI a Tréner Pro bez záväzkov — zruš kedykoľvek.
        </p>
      </div>
    </div>
  );
}
