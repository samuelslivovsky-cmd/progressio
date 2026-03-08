"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

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

const clientFeatures = [
  {
    title: "Denník stravy",
    desc: "Loguj jedlo, sleduj kalórie, makrá a vodnú bilanciu každý deň.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    title: "Tréningový denník",
    desc: "Zaznamenaj cvičenie, série, opakovania a záťaž. Vidíš progres za každé cvičenie.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5v14" /><path d="M18 5v14" /><path d="M2 9h4" /><path d="M2 15h4" /><path d="M18 9h4" /><path d="M18 15h4" /><path d="M6 9h12" /><path d="M6 15h12" />
      </svg>
    ),
  },
  {
    title: "Váha a merania",
    desc: "Sleduj váhu, obvody a percentá tuku v prehľadných grafoch.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Progress fotky",
    desc: "Fotky sa ukladajú chronologicky. Porovnaj začiatok a dnes jedným pohľadom.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
];

const trainerFeatures = [
  {
    title: "Stravovacie plány",
    desc: "Vytváraj jedálničky s jedlami a priraď ich jednému alebo viacerým klientom naraz.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6" /><path d="M9 16h4" />
      </svg>
    ),
  },
  {
    title: "Tréningové plány",
    desc: "Navrhuj tréningové cykly s cvičeniami, sériami a odpočinkom. Priraď viacerým klientom.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Správa klientov",
    desc: "Všetci klienti na jednom mieste. Vidíš ich poslednú aktivitu a výsledky v reálnom čase.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Hodnotenie pokroku",
    desc: "Grafy, série a fotky za každého klienta. Hodnoť a komentuj priamo v aplikácii.",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

function FeatureCard({
  title,
  desc,
  svg,
  delay,
  visible,
}: {
  title: string;
  desc: string;
  svg: ReactNode;
  delay: number;
  visible: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(34,197,94,0.1)",
        borderRadius: "14px",
        padding: "18px 20px",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      <div
        style={{
          color: "#22c55e",
          flexShrink: 0,
          marginTop: "2px",
          opacity: 0.9,
        }}
      >
        {svg}
      </div>
      <div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "5px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function Column({
  label,
  features,
}: {
  label: string;
  features: typeof clientFeatures;
}) {
  const { ref, visible } = useVisible(0.1);
  return (
    <div ref={ref}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 8px rgba(34,197,94,0.6)",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#22c55e",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {features.map((f, i) => (
          <FeatureCard
            key={f.title}
            {...f}
            delay={i * 0.09}
            visible={visible}
          />
        ))}
      </div>
    </div>
  );
}

const FEAT_CSS = `
  @media (max-width: 767px) {
    .landing-feat-wrap { padding: 56px 0 !important; }
    .landing-feat-head { margin-bottom: 40px !important; }
    .landing-feat-head p { font-size: 15px !important; }
    .landing-feat-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
  }
`;

export function LandingFeatures() {
  return (
    <div className="landing-feat-wrap" style={{ background: "transparent", padding: "100px 0" }}>
      <style>{FEAT_CSS}</style>
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}
      >
        <div className="landing-feat-head" style={{ textAlign: "center", marginBottom: "72px" }}>
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
            Funkcie
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
            Všetko na jednom mieste
          </h2>
          <p
            style={{
              marginTop: "16px",
              fontSize: "17px",
              color: "rgba(255,255,255,0.62)",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Progressio spája trénerov a klientov. Bez tabuliek, bez e-mailov,
            bez chaosu.
          </p>
        </div>

        <div
          className="landing-feat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
          }}
        >
          <Column label="Pre klientov" features={clientFeatures} />
          <Column label="Pre trénerov" features={trainerFeatures} />
        </div>
      </div>
    </div>
  );
}
