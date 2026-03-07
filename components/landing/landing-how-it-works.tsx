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

const steps = [
  {
    num: "01",
    title: "Registrácia",
    desc: "Zaregistruj sa ako tréner alebo klient. Tréner môže hneď pridávať klientov, klient sa pripojí cez pozývací odkaz.",
    tag: "2 minúty",
  },
  {
    num: "02",
    title: "Prepojenie",
    desc: "Tréner pozve klienta emailom. Po prijatí pozvánky tréner okamžite vidí klientove dáta a aktivitu.",
    tag: "Automaticky",
  },
  {
    num: "03",
    title: "Plány a logovanie",
    desc: "Tréner vytvorí stravovací a tréningový plán. Klient loguje jedlo, váhu a merania každý deň podľa plánu.",
    tag: "Deň za dňom",
  },
  {
    num: "04",
    title: "Sleduj pokrok",
    desc: "Tréner hodnotí výsledky, komentuje pokrok a upravuje plány. Klient vidí grafy, série a progress fotky.",
    tag: "V reálnom čase",
  },
];

export function LandingHowItWorks() {
  const { ref, visible } = useVisible(0.1);

  return (
    <div
      style={{
        background: "transparent",
        padding: "100px 0",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#22c55e",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Postup
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Ako to funguje
          </h2>
        </div>

        <div ref={ref}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: "28px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transition: `opacity 0.6s ease ${i * 0.13}s, transform 0.6s ease ${i * 0.13}s`,
              }}
            >
              {/* Left: number node + connecting line */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "rgba(34,197,94,0.07)",
                    border: "1px solid rgba(34,197,94,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 24px rgba(34,197,94,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#22c55e",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {step.num}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      width: "1px",
                      background:
                        "linear-gradient(180deg, rgba(34,197,94,0.22), rgba(34,197,94,0.04))",
                      margin: "10px 0",
                      minHeight: "40px",
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div
                style={{
                  paddingBottom: i < steps.length - 1 ? "48px" : "0",
                  paddingTop: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "21px",
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#4ade80",
                      background: "rgba(34,197,94,0.09)",
                      border: "1px solid rgba(34,197,94,0.18)",
                      borderRadius: "20px",
                      padding: "2px 10px",
                    }}
                  >
                    {step.tag}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.68)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
