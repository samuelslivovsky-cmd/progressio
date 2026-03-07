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

const reviews = [
  {
    text: "Konečne jeden systém pre klientov aj pre mňa. Nemusím riešiť tabuľky ani WhatsApp — všetko mám v Progressio.",
    author: "Peter K.",
    role: "Tréner",
    since: "6 mesiacov",
  },
  {
    text: "Logujem jedlo a tréningy každý deň. Tréner vidí môj pokrok a upraví plán. Jednoduché a prehľadné.",
    author: "Mária S.",
    role: "Klientka",
    since: "4 mesiace",
  },
  {
    text: "Používam Progressio s 15 klientmi. Plány, váha, fotky — všetko na jednom mieste. Šetrí to hodiny týždenne.",
    author: "Jakub V.",
    role: "Tréner",
    since: "8 mesiacov",
  },
  {
    text: "Progress fotky a grafy ma motivujú. Vidím, ako sa zlepšujem, a tréner to komentuje priamo v aplikácii.",
    author: "Lucia M.",
    role: "Klientka",
    since: "3 mesiace",
  },
];

export function LandingReviews() {
  const { ref, visible } = useVisible(0.1);

  return (
    <div
      style={{
        background: "transparent",
        padding: "100px 0",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
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
            Referencie
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
            Čo hovoria používatelia
          </h2>
        </div>

        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {reviews.map((r, i) => (
            <div
              key={r.author}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(34,197,94,0.1)",
                borderRadius: "18px",
                padding: "28px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
              }}
            >
              {/* Quote mark */}
              <svg
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                style={{ opacity: 0.3, flexShrink: 0 }}
              >
                <path
                  d="M0 20V12.667C0 5.556 4.148 1.185 12.444 0l1.334 2C9.926 2.963 7.63 5.481 7 9.333H12V20H0Zm16 0V12.667C16 5.556 20.148 1.185 28.444 0l1.334 2C25.926 2.963 23.63 5.481 23 9.333H28V20H16Z"
                  fill="#22c55e"
                />
              </svg>

              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.7,
                  margin: 0,
                  flex: 1,
                }}
              >
                {r.text}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {r.author}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.58)",
                      marginTop: "2px",
                    }}
                  >
                    {r.role}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#4ade80",
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.16)",
                    borderRadius: "20px",
                    padding: "3px 10px",
                    fontWeight: 600,
                  }}
                >
                  {r.since}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
