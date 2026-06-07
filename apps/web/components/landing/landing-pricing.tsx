"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip as TooltipCard } from "@/components/ui/tooltip-card";

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
    name: "Člen",
    price: "0",
    period: "navždy",
    desc: "S trénerom — logging a plány",
    cta: "Registrovať sa",
    href: "/register",
    highlighted: false,
    aiTier: false,
    mobileHighlights: [
      { label: "Denník stravy, kalórie a makrá", tooltip: "Loguješ jedlo každý deň, kalórie a makrá (bielkoviny, sacharidy, tuky) sa počítajú automaticky." },
      { label: "Tréningový denník a progres", tooltip: "Zaznamenávaš cvičenia, série, opakovania a záťaž. Vidíš progres za každý cvik v čase." },
      { label: "Váha, merania, grafy", tooltip: "Sleduješ váhu, obvody a percentá tuku v prehľadných grafoch." },
      { label: "Progress fotky", tooltip: "Fotky sa ukladajú chronologicky. Porovnáš začiatok a súčasnosť jedným pohľadom." },
      { label: "Plán od trénera", tooltip: "Dostaneš stravovací a tréningový plán od trénera a plníš ho podľa pokynov." },
    ],
  },
  {
    id: "client-ai",
    name: "Člen AI",
    price: "4.99",
    period: "mesiac",
    desc: "Solo — bez trénera, s AI koučom",
    cta: "Vyskúšať AI",
    href: "/register",
    highlighted: false,
    aiTier: true,
    mobileHighlights: [
      { label: "Všetko z plánu Člen", tooltip: "Všetky funkcie pre člena — denník stravy, tréningy, váha, progress fotky. Bez trénera, AI preberá jeho úlohu." },
      { label: "Týždenné AI hodnotenie", tooltip: "Každý týždeň AI zhodnotí tvoj týždeň (adherencia, kalórie, váha) a napíše konkrétne odporúčania." },
      { label: "Výpočet TDEE a makier", tooltip: "Systém ti vypočíta denný výdaj energie (TDEE) a odporúča denné kalórie a rozloženie makier podľa cieľa." },
      { label: "Chat s AI koučom 24/7", tooltip: "Pýtaš sa čokoľvek (napr. „bolí ma chrbát, mám cvičiť?“). AI odpovedá na základe tvojich dát a plánu." },
      { label: "Predikcia dosiahnutia cieľa", tooltip: "Podľa trendu váhy z posledných týždňov systém odhadne, kedy dosiahneš cieľovú váhu." },
    ],
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
    mobileHighlights: [
      { label: "Až 3 klienti", tooltip: "Môžeš pridať až 3 klientov. Pozvanie cez odkaz alebo email." },
      { label: "Stravovacie a tréningové plány", tooltip: "Vytváraš jedálničky a tréningové plány (cviky, série, opakovania) a priraďuješ ich klientom." },
      { label: "Pokrok klientov v reálnom čase", tooltip: "Vidíš váhu, logy jedla a tréningov každého klienta tak, ako ich práve zadávajú." },
      { label: "Email podpora", tooltip: "Pri otázkach nás môžeš kontaktovať cez email." },
    ],
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
    mobileHighlights: [
      { label: "Neobmedzený počet klientov", tooltip: "Všetko z Tréner Starter plus neobmedzený počet klientov." },
      { label: "Drop-off riziko a prioritná fronta", tooltip: "Systém hodnotí riziko, že klient prestane. Klienti sú zoradení podľa naliehavosti, nie abecedne." },
      { label: "Detekcia plató a vynechaných cvikov", tooltip: "Upozornenie, keď váha stagnuje 3+ týždne alebo keď klient opakovane vynecháva ten istý cvik." },
      { label: "Navrhnuté akcie pre trénera", tooltip: "Ku každému alertu systém navrhne konkrétny krok (zmeniť plán, poslať správu). Ty len potvrdíš." },
      { label: "Prioritná podpora", tooltip: "Rýchlejšia odpoveď na tvoje otázky." },
    ],
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

const PRICING_CSS = `
  .landing-pricing-cards { display: none; }
  @media (max-width: 767px) {
    .landing-pricing-wrap { padding: 48px 0 56px !important; }
    .landing-pricing-head { margin-bottom: 32px !important; }
    .landing-pricing-head p { font-size: 15px !important; }
    .landing-pricing-outer { padding-left: 16px !important; padding-right: 16px !important; }
    .landing-pricing-table-desk { display: none !important; }
    .landing-pricing-cards { display: flex !important; flex-direction: column; gap: 12px; }
  }
  @media (min-width: 768px) {
    .landing-pricing-cards { display: none !important; }
  }
`;

export function LandingPricing() {
  const { ref, visible } = useVisible(0.08);

  const COLS = "1fr repeat(4, minmax(0, 138px))";

  return (
    <div className="landing-pricing-wrap" style={{ background: "transparent", padding: "100px 0" }}>
      <style>{PRICING_CSS}</style>
      <div className="landing-pricing-outer" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Heading */}
        <div className="landing-pricing-head" style={{ textAlign: "center", marginBottom: "56px" }}>
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

        <div ref={ref}>
        {/* Desktop: table */}
        <div className="landing-pricing-table-desk">
          <div className="landing-pricing-table-wrap">
          <div
            className="landing-pricing-table"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              overflow: "visible",
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
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Členovia</div>
                  <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.08)" }} />
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Tréneri</div>
                  <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.08)" }} />
                </div>
              </div>
            </div>

            {plans.map((plan, planIndex) => {
              const accentColor = plan.highlighted ? "#22c55e" : plan.aiTier ? "#a78bfa" : "rgba(255,255,255,0.5)";
              const topBarColor = plan.highlighted ? "#22c55e" : plan.aiTier ? "#a78bfa" : "transparent";
              const bgColor = plan.highlighted ? "rgba(34,197,94,0.05)" : plan.aiTier ? "rgba(167,139,250,0.04)" : "transparent";
              const isLastPlan = planIndex === plans.length - 1;
              return (
                <div
                  key={plan.id}
                  className="landing-pricing-plan"
                  style={{
                    padding: "20px 14px",
                    textAlign: "center",
                    borderLeft: "1px solid rgba(255,255,255,0.07)",
                    background: bgColor,
                    position: "relative",
                  }}
                >
                  {(plan.highlighted || plan.aiTier) && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: isLastPlan ? "20px" : "2px",
                        overflow: "hidden",
                        borderTopRightRadius: isLastPlan ? "20px" : undefined,
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0,
                        height: "2px", background: topBarColor,
                        boxShadow: `0 0 12px ${topBarColor}80`,
                      }} />
                    </div>
                  )}
                  {plan.highlighted && (
                    <div style={{
                      position: "absolute", top: "-8px", left: "50%",
                      transform: "translateX(-50%)",
                      background: "#22c55e", color: "#040e07",
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                      padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap",
                      zIndex: 1,
                    }}>
                      Odporúčané
                    </div>
                  )}
                  <div className="landing-pricing-plan-name" style={{
                    fontSize: "11px", fontWeight: 700, color: accentColor,
                    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px",
                  }}>
                    {plan.name}
                  </div>
                  <div className="landing-pricing-price" style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px", marginBottom: "4px" }}>
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
                <div className="landing-pricing-group" style={{
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
                  <div className="landing-pricing-feature" style={{
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
        </div>
        </div>

        {/* Mobile: karty plánov */}
        <div className="landing-pricing-cards" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          {plans.map((plan) => {
            const accentColor = plan.highlighted ? "#22c55e" : plan.aiTier ? "#a78bfa" : "rgba(255,255,255,0.6)";
            const bgColor = plan.highlighted ? "rgba(34,197,94,0.08)" : plan.aiTier ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.03)";
            const borderColor = plan.highlighted ? "rgba(34,197,94,0.25)" : plan.aiTier ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.08)";
            const highlights = "mobileHighlights" in plan && Array.isArray(plan.mobileHighlights) ? plan.mobileHighlights : [];
            const hasHighlights = highlights.length > 0;
            return (
              <div
                key={plan.id}
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: accentColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
                      {plan.name}
                      {plan.highlighted && (
                        <span style={{ marginLeft: "8px", fontSize: "10px", background: "#22c55e", color: "#040e07", padding: "2px 8px", borderRadius: "12px" }}>Odporúčané</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>{plan.price}</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>€ / {plan.period}</span>
                    </div>
                  </div>
                  <Link
                    href={plan.href}
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textDecoration: "none",
                      background: plan.highlighted ? "#22c55e" : plan.aiTier ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.08)",
                      color: plan.highlighted ? "#040e07" : plan.aiTier ? "#c4b5fd" : "rgba(255,255,255,0.85)",
                      border: plan.aiTier ? "1px solid rgba(167,139,250,0.35)" : "none",
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", margin: "10px 0 0", lineHeight: 1.5 }}>
                  {plan.desc}
                </p>
                {hasHighlights && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {highlights.map((item) => {
                      const label = typeof item === "string" ? item : item.label;
                      const tooltipText = typeof item === "string" ? null : item.tooltip;
                      return (
                        <li
                          key={label}
                          style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.55)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ color: accentColor, flexShrink: 0 }}>✓</span>
                          <span style={{ flex: 1 }}>{label}</span>
                          {tooltipText && (
                            <TooltipCard
                              content={<span className="block max-w-[260px] text-left">{tooltipText}</span>}
                              containerClassName="inline-flex flex-shrink-0"
                            >
                              <span style={{ display: "inline-flex", cursor: "pointer", color: "rgba(255,255,255,0.4)", flexShrink: 0 }} aria-label="Viac info">
                                <Info className="size-3.5" />
                              </span>
                            </TooltipCard>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.28)" }}>
          Člen AI a Tréner Pro bez záväzkov — zruš kedykoľvek.
        </p>
      </div>
    </div>
  );
}
