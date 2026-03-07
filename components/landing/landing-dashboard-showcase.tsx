"use client";

import { useEffect, useRef, useState } from "react";

function useVisible(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const cardBase: React.CSSProperties = {
  background: "rgba(6, 18, 10, 0.85)",
  border: "1px solid rgba(34, 197, 94, 0.18)",
  borderRadius: "16px",
  padding: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
};

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ ...cardBase, padding: "14px" }}>
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: accent ? "#22c55e" : "#fff", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

function ClientMockup() {
  const r = 24, circ = 2 * Math.PI * r;
  const sparkPts: [number, number][] = [[0,9],[11,13],[22,11],[33,17],[44,21],[55,25],[66,29],[77,33],[88,38],[99,42]];
  const sparkLine = `M${sparkPts.map(([x,y]) => `${x},${y}`).join(" L")}`;
  const sparkArea = `${sparkLine} L99,52 L0,52 Z`;

  return (
    <div style={{ ...cardBase, borderRadius: "20px", padding: "20px", border: "1px solid rgba(34,197,94,0.22)", boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.08)" }}>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
        Dashboard — Klient
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        <StatTile label="Váha" value="73.4 kg" />
        <StatTile label="Kalórie" value="1 840 / 2 200" />
        <StatTile label="Tréning" value="Dokončený" accent />
        <StatTile label="Séria" value="14 dní" accent />
      </div>

      {/* Sparkline */}
      <div style={{ ...cardBase, padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Váha — 30 dní</span>
          <span style={{ fontSize: "10px", background: "rgba(34,197,94,0.12)", color: "#4ade80", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(34,197,94,0.22)", fontWeight: 600 }}>↓ −2.1 kg</span>
        </div>
        <svg viewBox="0 0 99 52" width="100%" height="48">
          <defs>
            <linearGradient id="ds-wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={sparkArea} fill="url(#ds-wg)" />
          <path d={sparkLine} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.5))" }} />
          <circle cx="99" cy="42" r="3" fill="#22c55e" style={{ filter: "drop-shadow(0 0 5px rgba(34,197,94,0.8))" }} />
        </svg>
      </div>

      {/* Calorie ring */}
      <div style={{ ...cardBase, padding: "14px", marginTop: "10px", display: "flex", alignItems: "center", gap: "16px" }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx="28" cy="28" r={r} fill="none" stroke="#22c55e" strokeWidth="5"
            strokeDasharray={`${circ * 0.84} ${circ}`} strokeLinecap="round" transform="rotate(-90 28 28)"
            style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.6))" }} />
          <text x="28" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">84%</text>
        </svg>
        <div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Kalórie dnes</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>1 840</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>/ 2 200 kcal · 360 zostatok</div>
        </div>
      </div>
    </div>
  );
}

function TrainerMockup() {
  const clients = [
    { name: "Mirka V.", active: true, ago: "dnes" },
    { name: "Adam T.", active: true, ago: "dnes" },
    { name: "Jana K.", active: false, ago: "2 dni" },
    { name: "Tomáš M.", active: false, ago: "4 dni" },
  ];
  const weeks = [
    { label: "T1", done: true },
    { label: "T2", done: true },
    { label: "T3", done: false },
    { label: "T4", done: false },
  ];

  return (
    <div style={{ ...cardBase, borderRadius: "20px", padding: "20px", border: "1px solid rgba(34,197,94,0.22)", boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.08)" }}>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
        Dashboard — Tréner
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        <StatTile label="Klienti" value="12" />
        <StatTile label="Jedálničky" value="5" />
        <StatTile label="Tréningové plány" value="8" />
        <StatTile label="Aktívnych dnes" value="7" accent />
      </div>

      {/* Clients list */}
      <div style={{ ...cardBase, padding: "14px", marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Moji klienti</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80" }}>12 aktívnych</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {clients.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, background: c.active ? "#22c55e" : "rgba(255,255,255,0.2)", boxShadow: c.active ? "0 0 6px rgba(34,197,94,0.7)" : "none" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: "10px", color: c.active ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.25)" }}>{c.ago}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+ 8 ďalších klientov</div>
      </div>

      {/* Plan progress */}
      <div style={{ ...cardBase, padding: "14px" }}>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Priradený plán</div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Silový cyklus A</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>8 klientov · 4 týždne</div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: "24px", borderRadius: "6px", background: w.done ? "#22c55e" : "rgba(255,255,255,0.06)", border: !w.done ? "1px solid rgba(255,255,255,0.08)" : "none", boxShadow: w.done ? "0 0 8px rgba(34,197,94,0.4)" : "none", marginBottom: "4px" }} />
              <span style={{ fontSize: "9px", color: w.done ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.25)", fontWeight: 600 }}>{w.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>Týždeň <span style={{ color: "#4ade80", fontWeight: 600 }}>2</span> / 4</div>
      </div>
    </div>
  );
}

function ShowcasePanel({ title, subtitle, side, children, visible }: {
  title: string;
  subtitle: string;
  side: "left" | "right";
  children: React.ReactNode;
  visible: boolean;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "48px",
      alignItems: "center",
    }}>
      {side === "right" && (
        <div style={{
          minWidth: 0,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-100px)",
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {children}
        </div>
      )}
      <div style={{
        order: side === "right" ? 2 : 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease-out 0.15s, transform 0.7s ease-out 0.15s",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#22c55e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
          {side === "left" ? "Pre klientov" : "Pre trénerov"}
        </div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "16px" }}>{title}</h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{subtitle}</p>
      </div>
      {side === "left" && (
        <div style={{
          minWidth: 0,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-100px)",
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function LandingDashboardShowcase() {
  const client = useVisible(0.1);
  const trainer = useVisible(0.1);

  return (
    <div style={{
      background: "linear-gradient(180deg, #020d05 0%, #040e07 100%)",
      padding: "80px 0",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "100px" }}>

        {/* Client section */}
        <div ref={client.ref}>
          <ShowcasePanel
            side="left"
            title="Sleduj pokrok, plnenie plánu a výsledky každý deň"
            subtitle="Loguj jedlo, tréningy a váhu. Tréner vidí tvoj pokrok v reálnom čase a upraví plán podľa teba."
            visible={client.visible}
          >
            <ClientMockup />
          </ShowcasePanel>
        </div>

        {/* Trainer section */}
        <div ref={trainer.ref}>
          <ShowcasePanel
            side="right"
            title="Spravuj klientov, plány a výsledky na jednom mieste"
            subtitle="Vytváraj jedálničky a tréningové plány, priraďuj ich klientom a sleduj ich pokrok bez zbytočných tabuliek."
            visible={trainer.visible}
          >
            <TrainerMockup />
          </ShowcasePanel>
        </div>

      </div>
    </div>
  );
}
