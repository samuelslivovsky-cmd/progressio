"use client";

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

const trainerSteps = [
  { num: "1", title: "Registrácia", desc: "Zaregistruj sa ako tréner. Zadarmo, bez kreditnej karty. Hneď môžeš pridávať členov." },
  { num: "2", title: "Pozvi členov", desc: "Pošli pozývací odkaz alebo e-mail. Člen sa zaregistruje a automaticky sa ti priradí." },
  { num: "3", title: "Vytvor plány", desc: "Stravovací a tréningový plán — vytvoríš raz a priradíš viacerým členom. Sleduj plnenie v reále." },
  { num: "4", title: "Sleduj a konaj", desc: "Prioritná fronta ti ukáže, kto potrebuje pozornosť. Systém navrhne akcie — ty len potvrdíš." },
];

const memberSteps = [
  { num: "1", title: "Registrácia", desc: "Zaregistruj sa ako člen. Zadarmo. S trénerom sa pripojíš cez jeho odkaz, alebo pôjdeš solo s AI." },
  { num: "2", title: "Plán alebo TDEE", desc: "S trénerom dostaneš plán od neho. Solo? Systém ti vypočíta TDEE a makrá podľa cieľa." },
  { num: "3", title: "Denné logovanie", desc: "Jedlo, tréningy, váha, merania — všetko v jednej aplikácii. Tréner alebo AI to vidí naživo." },
  { num: "4", title: "Pokrok a feedback", desc: "Grafy, séria, predikcia cieľa. S trénerom: jeho komentáre. S AI: týždenné hodnotenie a chat 24/7." },
];

const HOW_CSS = `
  .landing-how-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  @media (max-width: 767px) {
    .landing-how-wrap { padding: 56px 0 !important; }
    .landing-how-steps { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .landing-how-steps { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

type LandingHowItWorksProps = { variant?: "trainer" | "member" };

export function LandingHowItWorks({ variant = "trainer" }: LandingHowItWorksProps) {
  const { ref, visible } = useVisible(0.1);
  const steps = variant === "member" ? memberSteps : trainerSteps;
  const isMember = variant === "member";
  const accentColor = isMember ? "#a78bfa" : "#22c55e";
  const accentBg = isMember ? "rgba(167,139,250,0.15)" : "rgba(34,197,94,0.15)";

  return (
    <div
      className="landing-how-wrap"
      style={{
        background: "transparent",
        padding: "100px 0 48px",
      }}
    >
      <style>{HOW_CSS}</style>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: accentColor,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Ako to funguje
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3vw, 40px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {isMember ? "Štyri kroky pre člena" : "Štyri kroky pre trénera"}
          </h2>
        </div>

        <div ref={ref} className="landing-how-steps">
          {steps.map((s, i) => (
            <div
              key={`${variant}-${s.num}`}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "24px 20px",
                textAlign: "center",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: accentBg,
                  color: accentColor,
                  fontSize: 16,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                {s.num}
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 6px",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.52)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
