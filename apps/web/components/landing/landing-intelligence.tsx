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

const alerts = [
  {
    level: "red",
    name: "Tomáš M.",
    tag: "Riziko odchodu 78 %",
    detail: "Neaktívny 5 dní · adherencia klesá 2. týždeň",
    action: "Odoslať správu",
  },
  {
    level: "yellow",
    name: "Mirka V.",
    tag: "Váhové plató 3 týždne",
    detail: "Adherencia tréning 85 % · deficit OK · váha ±0.2 kg",
    action: "Upraviť plán",
  },
  {
    level: "yellow",
    name: "Adam T.",
    tag: "Vynecháva drepy 4×",
    detail: "Cvik chýba v každom absolvovanom tréningu od 12. marca",
    action: "Skontrolovať",
  },
  {
    level: "green",
    name: "Jana K.",
    tag: "Cieľ za 6 týždňov",
    detail: "Séria 18 dní · −0.45 kg/týždeň · smer správny",
    action: "Zobraziť",
  },
];

const levelColors = {
  red:    { dot: "#ef4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.18)",    tag: "rgba(239,68,68,0.85)"    },
  yellow: { dot: "#f59e0b", bg: "rgba(245,158,11,0.07)",   border: "rgba(245,158,11,0.18)",   tag: "rgba(245,158,11,0.85)"   },
  green:  { dot: "#22c55e", bg: "rgba(34,197,94,0.07)",    border: "rgba(34,197,94,0.18)",    tag: "rgba(34,197,94,0.85)"    },
};

const pillars = [
  { title: "Drop-off riziko", desc: "Kompozitný score 0–100 z adherencie, aktivity a progresu. Červená = okamžitá akcia." },
  { title: "Detekcia plató", desc: "Ak váha nestúpa ani neklesá 3+ týždne napriek dodržiavaniu plánu, systém upozorní." },
  { title: "Vynechané cviky", desc: "Keď klient 3× po sebe preskočí ten istý cvik, dostaneš konkrétne upozornenie." },
  { title: "Predikcia cieľa", desc: "Lineárny trend z posledných 4 týždňov váhy → odhadovaný dátum dosiahnutia cieľa." },
  { title: "Prioritná fronta", desc: "Klienti zoradení podľa naliehavosti, nie abecedne. Vieš, kde začať." },
  { title: "Navrhnuté akcie", desc: "Ku každému alertu systém navrhne konkrétny krok — ty len potvrdíš alebo zamietneš." },
];

const memberPillars = [
  { title: "Predikcia cieľovej váhy", desc: "Lineárny trend z tvojich vážení → odhadovaný dátum, kedy dosiahneš cieľ. Vidíš to priamo v dashboarde." },
  { title: "TDEE a makrá", desc: "Systém (alebo AI) ti vypočíta denný výdaj a odporúčané kalórie a makrá podľa cieľa." },
  { title: "AI týždenné hodnotenie", desc: "Člen AI dostáva každý týždeň zhrnutie: čo bolo dobre, čo zlepšiť. Konkrétne odporúčania z tvojich dát." },
  { title: "Séria a trendy", desc: "Koľko dní v rade si logoval, ako sa mení váha a sila. Všetko v prehľadných grafoch." },
  { title: "Plató detekcia", desc: "Ak váha stagnuje 3+ týždne, systém ťa upozorní a (pri AI) navrhne úpravu kalórií alebo tréningu." },
  { title: "Inteligentné upozornenia", desc: "Streak v ohrození, osobné rekordy, rizikové dni — aplikácia ti povie, kedy si dať pozor alebo sa odmeniť." },
];

function PulsingDot({ color }: { color: string }) {
  return (
    <div style={{ position: "relative", width: "10px", height: "10px", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          opacity: 0.25,
          animation: "intel-pulse 2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "2px",
          borderRadius: "50%",
          background: color,
        }}
      />
    </div>
  );
}

function AlertCard({ alert, delay, visible }: { alert: typeof alerts[0]; delay: number; visible: boolean }) {
  const c = levelColors[alert.level as keyof typeof levelColors];
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(24px)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      <PulsingDot color={c.dot} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{alert.name}</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: c.dot,
              background: `rgba(0,0,0,0.25)`,
              border: `1px solid ${c.border}`,
              borderRadius: "20px",
              padding: "1px 8px",
            }}
          >
            {alert.tag}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{alert.detail}</div>
      </div>
      <button
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: c.dot,
          background: "transparent",
          border: `1px solid ${c.border}`,
          borderRadius: "8px",
          padding: "4px 10px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {alert.action}
      </button>
    </div>
  );
}

const INTEL_CSS = `
  @media (max-width: 767px) {
    .landing-intel-section { padding: 56px 0 48px !important; }
    .landing-intel-head { margin-bottom: 40px !important; }
    .landing-intel-head p { font-size: 15px !important; }
    .landing-intel-twocol { grid-template-columns: 1fr !important; gap: 32px !important; margin-bottom: 48px !important; }
    .landing-intel-pillars { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
  }
  @media (max-width: 480px) {
    .landing-intel-pillars { grid-template-columns: 1fr !important; }
  }
`;

type LandingIntelligenceProps = { variant?: "trainer" | "member" };

export function LandingIntelligence({ variant = "trainer" }: LandingIntelligenceProps) {
  const left = useVisible(0.1);
  const right = useVisible(0.1);
  const pillarsRef = useVisible(0.1);
  const isMember = variant === "member";
  const activePillars = isMember ? memberPillars : pillars;
  const themeColors = isMember
    ? { dot: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", tag: "rgba(167,139,250,0.85)" }
    : levelColors.green;

  const trainerHeadline = (
    <>
      Nie len zapisovanie.
      <br />
      <span style={{ color: "#22c55e" }}>Predikcia.</span>
    </>
  );
  const memberHeadline = (
    <>
      Tvoj pokrok.
      <br />
      <span style={{ color: isMember ? "#a78bfa" : "#22c55e" }}>Predikcia.</span>
    </>
  );
  const trainerSub = "Progressio sleduje vzory v správaní každého klienta a upozorní ťa skôr, ako nastane problém — bez toho, aby si musel niečo kontrolovať manuálne.";
  const memberSub = "Systém analyzuje tvoje váženie, logovanie a tréningy. Predikcia cieľovej váhy, TDEE, týždenné AI hodnotenie a upozornenia — všetko pre teba.";

  return (
    <div className="landing-intel-section" style={{ padding: "110px 0 100px", position: "relative", overflow: "hidden" }}>
      <style>{INTEL_CSS}</style>
      <style>{`
        @keyframes intel-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50%        { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "10%",
          width: "500px",
          height: "400px",
          background: `radial-gradient(ellipse, ${isMember ? "rgba(167,139,250,0.06)" : "rgba(34,197,94,0.07)"} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        <div className="landing-intel-head" style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: isMember ? "rgba(167,139,250,0.08)" : "rgba(34,197,94,0.08)",
              border: `1px solid ${isMember ? "rgba(167,139,250,0.2)" : "rgba(34,197,94,0.2)"}`,
              borderRadius: "20px",
              padding: "5px 14px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isMember ? "#a78bfa" : "#22c55e",
                boxShadow: isMember ? "0 0 8px rgba(167,139,250,0.8)" : "0 0 8px rgba(34,197,94,0.8)",
                animation: "intel-pulse 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600, color: isMember ? "#c4b5fd" : "#4ade80", letterSpacing: "0.06em" }}>
              {isMember ? "Pre členov" : "Prediktívna inteligencia"}
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "18px",
            }}
          >
            {isMember ? memberHeadline : trainerHeadline}
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.62)",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            {isMember ? memberSub : trainerSub}
          </p>
        </div>

        <div
          className="landing-intel-twocol"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
            marginBottom: "80px",
          }}
        >
          <div ref={left.ref}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "28px",
                opacity: left.visible ? 1 : 0,
                transform: left.visible ? "translateX(0)" : "translateX(-20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              {(isMember
                ? [
                    { label: "Predikcia cieľovej váhy", text: "Lineárny trend z tvojich vážení ti povie, kedy približne dosiahneš cieľovú váhu. Vidíš to priamo v aplikácii." },
                    { label: "TDEE a makrá", text: "S trénerom alebo s AI — systém ti vypočíta denný výdaj a odporúčané kalórie a makrá podľa tvojho cieľa." },
                    { label: "Séria a trendy", text: "Koľko dní v rade si logoval, ako sa mení váha a sila. Všetko v prehľadných grafoch a štatistikách." },
                  ]
                : [
                    { label: "Prioritná fronta klientov", text: "Namiesto abecedného zoznamu vidíš klientov zoradených podľa naliehavosti. Vieš presne, kde začať každé ráno." },
                    { label: "Konkrétne upozornenia", text: "Nie grafy, ktoré treba interpretovať. Priame alerty: kto je v ohrození, čo vynecháva, kde stagnuje." },
                    { label: "Navrhnuté akcie", text: "Ku každému alertu systém navrhne konkrétny krok — upravia plán, odošlú správu alebo zaradí deload. Ty len potvrdíš." },
                  ]
              ).map((item: { label: string; text: string }, i: number) => (
                <div key={item.label} style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: themeColors.bg,
                      border: `1px solid ${themeColors.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 800,
                      color: themeColors.dot,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.58)", lineHeight: 1.65 }}>
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isMember ? (
            <div
              ref={right.ref}
              style={{
                opacity: right.visible ? 1 : 0,
                transform: right.visible ? "translateX(0)" : "translateX(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(167,139,250,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Tvoj prehľad</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(167,139,250,0.06)", borderRadius: 12 }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Odhad cieľa</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>6 týždňov</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(167,139,250,0.06)", borderRadius: 12 }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>TDEE</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>2 420 kcal</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(167,139,250,0.06)", borderRadius: 12 }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Séria</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>14 dní</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div
            ref={right.ref}
            style={{ position: "relative" }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(34,197,94,0.14)",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  paddingBottom: "14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Upozornenia — dnes
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "20px",
                    padding: "2px 10px",
                  }}
                >
                  3 vyžadujú akciu
                </span>
              </div>

              {/* Alerts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {alerts.map((alert, i) => (
                  <AlertCard
                    key={alert.name}
                    alert={alert}
                    delay={right.visible ? i * 0.1 : 0}
                    visible={right.visible}
                  />
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                }}
              >
                + 8 ďalších klientov bez aktívnych alertov
              </div>
            </div>
          </div>
          )}
        </div>

        <div
          ref={pillarsRef.ref}
          className="landing-intel-pillars"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {activePillars.map((p, i) => (
            <div
              key={p.title}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "20px 22px",
                opacity: pillarsRef.visible ? 1 : 0,
                transform: pillarsRef.visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: themeColors.dot,
                  marginBottom: "12px",
                  boxShadow: isMember ? "0 0 6px rgba(167,139,250,0.5)" : "0 0 6px rgba(34,197,94,0.5)",
                }}
              />
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                {p.title}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
