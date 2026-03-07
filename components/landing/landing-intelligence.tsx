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

export function LandingIntelligence() {
  const left = useVisible(0.1);
  const right = useVisible(0.1);
  const pillarsRef = useVisible(0.1);

  return (
    <div style={{ padding: "110px 0 100px", position: "relative", overflow: "hidden" }}>
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes intel-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50%        { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "10%",
          width: "500px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Section label + headline */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
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
                background: "#22c55e",
                boxShadow: "0 0 8px rgba(34,197,94,0.8)",
                animation: "intel-pulse 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#4ade80", letterSpacing: "0.06em" }}>
              Prediktívna inteligencia
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
            Nie len zapisovanie.
            <br />
            <span style={{ color: "#22c55e" }}>Predikcia.</span>
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
            Progressio sleduje vzory v správaní každého klienta a upozorní ťa skôr, ako nastane problém — bez toho, aby si musel niečo kontrolovať manuálne.
          </p>
        </div>

        {/* Two-column: copy + mock alert panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
            marginBottom: "80px",
          }}
        >
          {/* Left: value props */}
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
              {[
                {
                  label: "Prioritná fronta klientov",
                  text: "Namiesto abecedného zoznamu vidíš klientov zoradených podľa naliehavosti. Vieš presne, kde začať každé ráno.",
                },
                {
                  label: "Konkrétne upozornenia",
                  text: "Nie grafy, ktoré treba interpretovať. Priame alerty: kto je v ohrození, čo vynecháva, kde stagnuje.",
                },
                {
                  label: "Navrhnuté akcie",
                  text: "Ku každému alertu systém navrhne konkrétny krok — upravia plán, odošlú správu alebo zaradí deload. Ty len potvrdíš.",
                },
              ].map((item, i) => (
                <div key={item.label} style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#22c55e",
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

          {/* Right: mock alert feed */}
          <div
            ref={right.ref}
            style={{ position: "relative" }}
          >
            {/* Card shell */}
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
        </div>

        {/* Bottom: 6 pillars grid */}
        <div
          ref={pillarsRef.ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {pillars.map((p, i) => (
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
                  background: "#22c55e",
                  marginBottom: "12px",
                  boxShadow: "0 0 6px rgba(34,197,94,0.5)",
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
