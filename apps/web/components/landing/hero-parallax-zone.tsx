"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlipWords } from "@/components/ui/flip-words";
import { HeroBackground } from "./hero-background";

const TOTAL_VH = 5;
const TRAIL_VH = 0.3; // extra viewport heights appended after storytelling ends, preventing next section from bleeding in
const MOCKUP_BASE_WIDTH = 520;
const MOCKUP_MOBILE_WIDTH = 280;

function clamp(x: number, a = 0, b = 1) { return Math.min(b, Math.max(a, x)); }
function seg(p: number, a: number, b: number) { return clamp((p - a) / (b - a)); }

// ── Scroll phases (scrollable = 4*vh) — storytelling podľa zariadenia ─
// Desktop & phone: hero → client → AI → trainer (na mobile majú mockupy mobilný dizajn). Tablet: hero → client → trainer.
// 0.00 – 0.05  hero idle
// 0.05 – 0.12  hero text fades out
// 0.08 – 0.20  cards merge
// 0.18 – 0.28  client slides in
// 0.28 – 0.36  client pinned (tablet: client out, trainer in)
// 0.36 – 0.44  desktop: client↔AI crossfade | tablet: trainer pinned
// 0.44 – 0.52  desktop: AI pinned | phone: AI pinned do 1.0
// 0.52 – 0.62  desktop: AI↔trainer crossfade
// 0.62 – 1.00  desktop: trainer pinned
// ─────────────────────────────────────────────────────────────────────────────

const HERO_CSS = `
  .hpz-section {
    height: ${(TOTAL_VH + TRAIL_VH) * 100}vh;
    height: ${(TOTAL_VH + TRAIL_VH) * 100}svh;
  }
  .hpz-sticky {
    height: 100vh;
    height: 100dvh;
    height: 100svh;
    min-height: 100vh;
    min-height: 100dvh;
    min-height: 100svh;
  }
  @media (max-width: 767px) {
    .hpz-sticky {
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      box-sizing: border-box;
    }
    /* Posun hero textu hore — na mobile je inak vypočítaný viewport pri prvom načítaní */
    .hpz-hero-text-inner {
      transform: translateY(-15vh);
    }
  }
  @keyframes hpz-badge-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); }
    50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  @keyframes hpz-scroll-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(7px); }
  }
  @keyframes hpz-scroll-dot {
    0%   { transform: translateY(0); opacity: 1; }
    80%  { transform: translateY(5px); opacity: 0; }
    100% { transform: translateY(0); opacity: 0; }
  }
  @keyframes hpz-live-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }
  @keyframes hpz-typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%            { transform: translateY(-4px); opacity: 1; }
  }
`;

const shell: React.CSSProperties = {
  background: "rgba(6, 18, 10, 0.92)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(34, 197, 94, 0.22)",
  borderRadius: "20px",
  padding: "22px",
  boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(34,197,94,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
  width: "100%",
  maxWidth: `${MOCKUP_BASE_WIDTH}px`,
};

const shellPurple: React.CSSProperties = {
  ...shell,
  border: "1px solid rgba(167,139,250,0.25)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(167,139,250,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const shellMobile: React.CSSProperties = {
  ...shell,
  maxWidth: `${MOCKUP_MOBILE_WIDTH}px`,
  borderRadius: "28px",
  padding: "12px 14px 18px",
  boxShadow: "0 24px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.1), inset 0 1px 0 rgba(255,255,255,0.03)",
};

const shellMobilePurple: React.CSSProperties = {
  ...shellPurple,
  maxWidth: `${MOCKUP_MOBILE_WIDTH}px`,
  borderRadius: "28px",
  padding: "12px 14px 18px",
  boxShadow: "0 24px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(167,139,250,0.1), inset 0 1px 0 rgba(255,255,255,0.03)",
};

const tile: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(34,197,94,0.09)",
  borderRadius: "12px",
  padding: "13px",
};

const tilePurple: React.CSSProperties = {
  ...tile,
  border: "1px solid rgba(167,139,250,0.1)",
};

function Lbl({ children, purple }: { children: React.ReactNode; purple?: boolean }) {
  return (
    <div style={{ fontSize: "10px", fontWeight: 600, color: purple ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
      {children}
    </div>
  );
}

function ClientMockup({ mobile = false }: { mobile?: boolean }) {
  const pts: [number, number][] = [[0,9],[14,13],[28,11],[42,17],[56,21],[70,25],[84,31],[99,38]];
  const line = `M${pts.map(([x,y]) => `${x},${y}`).join(" L")}`;
  const area = `${line} L99,48 L0,48 Z`;
  const r = 22, circ = 2 * Math.PI * r;
  const shellStyle = mobile ? shellMobile : shell;

  return (
    <div style={shellStyle}>
      {mobile && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <div style={{ width: "52px", height: "5px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }} />
        </div>
      )}
      <div style={{ fontSize: mobile ? "9px" : "11px", fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: mobile ? "10px" : "18px" }}>Dashboard — Člen</div>
      {mobile ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
            {[
              { label: "Váha",    value: "73.4 kg",    accent: false },
              { label: "Kalórie", value: "1 840",      accent: false },
              { label: "Séria",   value: "14 dní",     accent: true  },
              { label: "Tréning", value: "Hotový ✓",   accent: true  },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ ...tile, padding: "8px" }}>
                <Lbl>{label}</Lbl>
                <div style={{ fontSize: "11px", fontWeight: 700, color: accent ? "#22c55e" : "#fff" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ ...tile, marginBottom: "8px", padding: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <Lbl>Váha — 30 dní</Lbl>
              <span style={{ fontSize: "8px", background: "rgba(34,197,94,0.12)", color: "#4ade80", padding: "2px 6px", borderRadius: "12px", fontWeight: 600 }}>↓ −2.1 kg</span>
            </div>
            <svg viewBox="0 0 99 48" width="100%" height="36">
              <defs>
                <linearGradient id="hpz-wg-m" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#hpz-wg-m)" />
              <path d={line} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="99" cy="38" r="2.5" fill="#22c55e" />
            </svg>
          </div>
          <div style={{ ...tile, display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", padding: "8px" }}>
            <svg width="36" height="36" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
              <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle cx="26" cy="26" r={r} fill="none" stroke="#22c55e" strokeWidth="5"
                strokeDasharray={`${circ * 0.84} ${circ}`} strokeLinecap="round" transform="rotate(-90 26 26)" />
              <text x="26" y="30" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">84%</text>
            </svg>
            <div>
              <Lbl>Kalórie</Lbl>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>1 840 / 2 200 kcal</div>
            </div>
          </div>
          <div style={tile}>
            <Lbl>Dnešný tréning</Lbl>
            {[{ name: "Bench Press", done: 3, total: 4 }, { name: "Squat", done: 4, total: 4 }, { name: "Pull-ups", done: 2, total: 3 }].map((ex, i) => (
              <div key={i} style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)" }}>{ex.name}</span>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.35)" }}>{ex.done}/{ex.total}</span>
                </div>
                <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${ex.done / ex.total * 100}%`, background: ex.done === ex.total ? "#22c55e" : "#4ade80", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
            {[
              { label: "Váha",    value: "73.4 kg",    accent: false },
              { label: "Kalórie", value: "1 840 kcal", accent: false },
              { label: "Séria",   value: "14 dní",     accent: true  },
              { label: "Tréning", value: "Hotový ✓",   accent: true  },
            ].map(({ label, value, accent }) => (
              <div key={label} style={tile}>
                <Lbl>{label}</Lbl>
                <div style={{ fontSize: "13px", fontWeight: 700, color: accent ? "#22c55e" : "#fff" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ ...tile, marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <Lbl>Váha — 30 dní</Lbl>
              <span style={{ fontSize: "10px", background: "rgba(34,197,94,0.12)", color: "#4ade80", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(34,197,94,0.22)", fontWeight: 600 }}>↓ −2.1 kg</span>
            </div>
            <svg viewBox="0 0 99 48" width="100%" height="44">
              <defs>
                <linearGradient id="hpz-wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#hpz-wg)" />
              <path d={line} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.5))" }} />
              <circle cx="99" cy="38" r="3" fill="#22c55e" style={{ filter: "drop-shadow(0 0 5px #22c55e)" }} />
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ ...tile, display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="48" height="48" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
                <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle cx="26" cy="26" r={r} fill="none" stroke="#22c55e" strokeWidth="5"
                  strokeDasharray={`${circ * 0.84} ${circ}`} strokeLinecap="round" transform="rotate(-90 26 26)"
                  style={{ filter: "drop-shadow(0 0 5px rgba(34,197,94,0.6))" }} />
                <text x="26" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">84%</text>
              </svg>
              <div>
                <Lbl>Kalórie</Lbl>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>1 840</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>/ 2 200 kcal</div>
              </div>
            </div>
            <div style={tile}>
              <Lbl>Dnešný tréning</Lbl>
              {[{ name: "Bench Press", done: 3, total: 4 }, { name: "Squat", done: 4, total: 4 }, { name: "Pull-ups", done: 2, total: 3 }].map((ex, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)" }}>{ex.name}</span>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>{ex.done}/{ex.total}</span>
                  </div>
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", width: `${ex.done / ex.total * 100}%`, background: ex.done === ex.total ? "#22c55e" : "#4ade80", borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AiMockup({ mobile = false }: { mobile?: boolean }) {
  const shellStyle = mobile ? shellMobilePurple : shellPurple;
  return (
    <div style={shellStyle}>
      {mobile && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <div style={{ width: "52px", height: "5px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }} />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mobile ? "10px" : "16px", flexWrap: "wrap", gap: "6px" }}>
        <div style={{ fontSize: mobile ? "9px" : "11px", fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Dashboard — Člen AI</div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.22)", borderRadius: "20px", padding: "3px 8px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px rgba(167,139,250,0.9)", animation: "hpz-live-dot 2s ease-in-out infinite" }} />
          <span style={{ fontSize: mobile ? "8px" : "10px", color: "#c4b5fd", fontWeight: 600 }}>AI aktívny</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(3,1fr)" : "repeat(3,1fr)", gap: mobile ? "6px" : "8px", marginBottom: mobile ? "10px" : "12px" }}>
        {[{ label: "TDEE", value: "2 420" }, { label: "Plató", value: "nie" }, { label: "Séria", value: "14 dní" }].map(({ label, value }) => (
          <div key={label} style={{ ...tilePurple, padding: mobile ? "6px" : undefined }}><Lbl purple>{label}</Lbl><div style={{ fontSize: mobile ? "10px" : "13px", fontWeight: 700, color: "#fff" }}>{value}</div></div>
        ))}
      </div>
      <div style={{ ...tilePurple, padding: mobile ? "10px" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: mobile ? "8px" : "12px" }}>
          <div style={{ width: mobile ? "4px" : "5px", height: mobile ? "4px" : "5px", borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px rgba(167,139,250,0.8)" }} />
          <span style={{ fontSize: mobile ? "8px" : "10px", fontWeight: 600, color: "rgba(167,139,250,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Koučing</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: mobile ? "6px" : "9px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "85%", padding: mobile ? "6px 9px" : "8px 11px", borderRadius: "12px 12px 2px 12px", background: "rgba(167,139,250,0.13)", border: "1px solid rgba(167,139,250,0.22)", fontSize: mobile ? "9px" : "10.5px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
              Bolí ma chrbát, mám dnes cvičiť?
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ maxWidth: "90%", padding: mobile ? "6px 9px" : "8px 11px", borderRadius: "12px 12px 12px 2px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontSize: mobile ? "9px" : "10.5px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              Na základe tvojich dát — cvič, nahraď deadlift plankom a RDL.
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: mobile ? "6px 10px" : "8px 14px", borderRadius: "12px 12px 12px 2px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa", animation: "hpz-typing 1.4s ease-in-out infinite", animationDelay: `${j * 0.18}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerMockup({ mobile = false }: { mobile?: boolean }) {
  const clients = [
    { name: "Mirka V.",  active: true,  ago: "dnes",  risk: null },
    { name: "Adam T.",   active: true,  ago: "dnes",  risk: null },
    { name: "Jana K.",   active: false, ago: "2 dni", risk: "plató" },
    { name: "Tomáš M.",  active: false, ago: "4 dni", risk: "riziko" },
  ];
  const activity = [
    { msg: "Mirka zalogovala váhu",   color: "#22c55e", warn: false },
    { msg: "Adam dokončil tréning",   color: "#22c55e", warn: false },
    { msg: "Jana K. — plató 3 týždne", color: "#f59e0b", warn: true  },
  ];
  const shellStyle = mobile ? shellMobile : shell;
  return (
    <div style={shellStyle}>
      {mobile && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <div style={{ width: "52px", height: "5px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }} />
        </div>
      )}
      <div style={{ fontSize: mobile ? "9px" : "11px", fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: mobile ? "10px" : "18px" }}>Dashboard — Tréner</div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: mobile ? "6px" : "8px", marginBottom: mobile ? "10px" : "12px" }}>
        {[
          { label: "Klienti",    value: "12", accent: false },
          { label: "Plány",      value: "8",  accent: false },
          { label: "Jedálničky", value: "5",  accent: false },
          { label: "Aktívni",    value: "7",  accent: true  },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ ...tile, padding: mobile ? "8px" : undefined }}><Lbl>{label}</Lbl><div style={{ fontSize: mobile ? "16px" : "22px", fontWeight: 700, color: accent ? "#22c55e" : "#fff" }}>{value}</div></div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "8px" : "8px" }}>
        <div style={tile}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mobile ? "8px" : "10px" }}>
            <Lbl>Klienti</Lbl>
            <span style={{ fontSize: mobile ? "8px" : "10px", color: "#4ade80", fontWeight: 700 }}>12 aktívnych</span>
          </div>
          {clients.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: mobile ? "5px" : "7px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.active ? "#22c55e" : (c.risk === "riziko" ? "#ef4444" : "rgba(255,255,255,0.2)"), boxShadow: c.active ? "0 0 5px #22c55e" : "none", flexShrink: 0 }} />
              <span style={{ fontSize: mobile ? "10px" : "11px", color: "rgba(255,255,255,0.7)", flex: 1 }}>{c.name}</span>
              {c.risk ? (
                <span style={{ fontSize: "8px", color: c.risk === "riziko" ? "#f87171" : "#f59e0b", background: c.risk === "riziko" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", borderRadius: "4px", padding: "1px 4px", fontWeight: 600 }}>{c.risk}</span>
              ) : (
                <span style={{ fontSize: mobile ? "9px" : "10px", color: c.active ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.25)" }}>{c.ago}</span>
              )}
            </div>
          ))}
          <div style={{ paddingTop: "5px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: mobile ? "9px" : "10px", color: "rgba(255,255,255,0.3)" }}>+ 8 ďalších</div>
        </div>
        <div style={tile}>
          <Lbl>Priradený plán</Lbl>
          <div style={{ fontSize: mobile ? "11px" : "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Silový cyklus A</div>
          <div style={{ fontSize: mobile ? "9px" : "10px", color: "rgba(255,255,255,0.35)", marginBottom: mobile ? "8px" : "12px" }}>8 klientov · 4 týždne</div>
          <div style={{ display: "flex", gap: "4px", marginBottom: mobile ? "6px" : "8px" }}>
            {[{ l: "T1", d: true }, { l: "T2", d: true }, { l: "T3", d: false }, { l: "T4", d: false }].map(({ l, d }, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: mobile ? "14px" : "20px", borderRadius: "4px", background: d ? "#22c55e" : "rgba(255,255,255,0.06)", boxShadow: d ? "0 0 6px rgba(34,197,94,0.4)" : "none", marginBottom: "3px" }} />
                <div style={{ textAlign: "center", fontSize: "8px", color: d ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.25)", fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: mobile ? "9px" : "10px", color: "rgba(255,255,255,0.3)", marginBottom: mobile ? "8px" : "10px" }}>
            Týždeň <span style={{ color: "#4ade80", fontWeight: 600 }}>2</span> / 4
          </div>
          <div style={{ paddingTop: mobile ? "6px" : "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Lbl>Živá aktivita</Lbl>
            {activity.map((a, i) => (
              <div key={i} style={{ fontSize: mobile ? "9px" : "10px", color: a.warn ? "rgba(245,158,11,0.85)" : "rgba(255,255,255,0.4)", display: "flex", gap: "5px", alignItems: "center", marginBottom: "3px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                {a.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// phaseIn: 0→1 progress of THIS phase sliding in (used for bullets + badge entrance)
function SideCopy({
  eyebrow, headline, sub, bullets, badge,
  accent = "green", phaseIn, side, isMobile, mobileOrder,
}: {
  eyebrow: string; headline: string; sub: string; bullets: string[];
  badge?: string; accent?: "green" | "purple";
  phaseIn: number; side: "left" | "right"; isMobile: boolean; mobileOrder?: number;
}) {
  const dx = side === "left" ? -50 : 50;
  const isGreen = accent === "green";
  const accentColor  = isGreen ? "#22c55e" : "#a78bfa";
  const accentLight  = isGreen ? "#4ade80" : "#c4b5fd";
  const accentBg     = isGreen ? "rgba(34,197,94,0.08)"  : "rgba(167,139,250,0.08)";
  const accentBorder = isGreen ? "rgba(34,197,94,0.2)"   : "rgba(167,139,250,0.2)";

  return (
    <div style={{
      opacity: phaseIn,
      transform: isMobile ? `translateY(${(1 - phaseIn) * -24}px)` : `translateX(${(1 - phaseIn) * dx}px)`,
      transition: "none",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: isMobile ? "0" : (side === "left" ? "0 48px 0 0" : "0 0 0 48px"),
      order: isMobile && mobileOrder !== undefined ? mobileOrder : undefined,
      textAlign: isMobile ? "center" : "left",
      alignItems: isMobile ? "center" : "flex-start",
    }}>
      {badge && !isMobile && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: "20px", padding: "5px 12px", marginBottom: "20px", width: "fit-content" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: accentLight, letterSpacing: "0.06em" }}>{badge}</span>
        </div>
      )}
      <div style={{ fontSize: isMobile ? "10px" : "12px", fontWeight: 600, color: accentColor, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: isMobile ? "8px" : "14px" }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: isMobile ? "clamp(22px, 6vw, 30px)" : "clamp(28px, 3.5vw, 46px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: isMobile ? "10px" : "18px", whiteSpace: "pre-line" }}>
        {headline}
      </h2>
      <p style={{ fontSize: isMobile ? "13px" : "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: isMobile ? "0" : "28px" }}>
        {sub}
      </p>
      {!isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          {bullets.map((b, i) => (
            <div key={b} style={{
              display: "flex", alignItems: "center", gap: "12px",
              opacity: phaseIn > 0.4 + i * 0.15 ? 1 : 0,
              transform: phaseIn > 0.4 + i * 0.15 ? "translateX(0)" : `translateX(${side === "left" ? -16 : 16}px)`,
              transition: "none",
            }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: isGreen ? "rgba(34,197,94,0.1)" : "rgba(167,139,250,0.1)", border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.78)", fontWeight: 500 }}>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// phaseIn: 0→1, badge appears after phaseIn > 0.5
function FloatingBadge({ text, sub, phaseIn, position, accent = "green", isMobile }: {
  text: string; sub?: string; phaseIn: number;
  position: React.CSSProperties; accent?: "green" | "purple"; isMobile: boolean;
}) {
  if (isMobile) return null;
  const show = clamp((phaseIn - 0.5) / 0.4);
  const isGreen = accent === "green";
  return (
    <div style={{
      position: "absolute", ...position,
      background: "rgba(6,18,10,0.96)",
      border: isGreen ? "1px solid rgba(34,197,94,0.28)" : "1px solid rgba(167,139,250,0.28)",
      borderRadius: "12px", padding: "9px 14px",
      boxShadow: isGreen ? "0 8px 32px rgba(0,0,0,0.55), 0 0 16px rgba(34,197,94,0.08)" : "0 8px 32px rgba(0,0,0,0.55), 0 0 16px rgba(167,139,250,0.08)",
      opacity: show, transform: `scale(${0.88 + show * 0.12})`,
      transformOrigin: "center", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 5,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: isGreen ? "#22c55e" : "#a78bfa", boxShadow: isGreen ? "0 0 6px rgba(34,197,94,0.9)" : "0 0 6px rgba(167,139,250,0.9)" }} />
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{text}</div>
      </div>
      {sub && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.42)", marginTop: "3px", paddingLeft: "11px" }}>{sub}</div>}
    </div>
  );
}

function PhaseDots({
  progress,
  isMobile,
  isPhone,
  isTablet,
}: {
  progress: number;
  isMobile: boolean;
  isPhone: boolean;
  isTablet: boolean;
}) {
  const phasesDesktop = [
    { label: "Úvod",    range: [0,    0.18] as [number, number] },
    { label: "Člen",  range: [0.18, 0.44] as [number, number] },
    { label: "AI Kouč", range: [0.44, 0.62] as [number, number] },
    { label: "Tréner",  range: [0.62, 1.01] as [number, number] },
  ];
  const phasesTablet = [
    { label: "Úvod",   range: [0,    0.18] as [number, number] },
    { label: "Člen", range: [0.18, 0.36] as [number, number] },
    { label: "Tréner", range: [0.36, 1.01] as [number, number] },
  ];
  const phases = isTablet ? phasesTablet : phasesDesktop;
  const activeIdx = phases.findIndex(({ range }) => progress >= range[0] && progress < range[1]);
  const effectiveIdx = activeIdx === -1 ? phases.length - 1 : activeIdx;
  const visible = !isMobile && progress > 0.05 && progress < 0.995;

  return (
    <div style={{ position: "absolute", right: "28px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "12px", opacity: visible ? 1 : 0, transition: "opacity 0.5s ease", zIndex: 30, pointerEvents: "none" }}>
      {phases.map((p, i) => {
        const isActive = i === effectiveIdx;
        const isAi = p.label === "AI Kouč";
        const dotColor = isActive ? (isAi ? "#a78bfa" : "#22c55e") : "rgba(255,255,255,0.15)";
        return (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "9px", color: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.15)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.35s ease" }}>{p.label}</span>
            <div style={{ width: isActive ? "8px" : "5px", height: isActive ? "8px" : "5px", borderRadius: "50%", background: dotColor, boxShadow: isActive ? `0 0 8px ${isAi ? "rgba(167,139,250,0.7)" : "rgba(34,197,94,0.7)"}` : "none", transition: "all 0.35s ease" }} />
          </div>
        );
      })}
    </div>
  );
}

function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <div style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease", zIndex: 30, pointerEvents: "none", animation: visible ? "hpz-scroll-bounce 2s ease-in-out infinite" : "none" }}>
      <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
        <rect x="1" y="1" width="20" height="32" rx="10" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <circle cx="11" cy="10" r="3" fill="#22c55e" style={{ animation: "hpz-scroll-dot 2s ease-in-out infinite" }} />
        <path d="M7 22l4 5 4-5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Scroll</span>
    </div>
  );
}

function ScrollBar({ progress }: { progress: number }) {
  const visible = progress > 0.18 && progress < 0.99;
  const pct = clamp((progress - 0.18) / 0.82) * 100;
  return (
    <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: visible ? 1 : 0, zIndex: 30, pointerEvents: "none", transition: "opacity 0.4s ease" }}>
      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Pokračuj scrollovaním</div>
      <div style={{ width: "100px", height: "2px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#22c55e", borderRadius: "2px", boxShadow: "0 0 6px rgba(34,197,94,0.6)", transition: "none" }} />
      </div>
    </div>
  );
}

function MockupWrap({ children, isMobile, windowWidth }: { children: React.ReactNode; isMobile: boolean; windowWidth: number }) {
  if (!isMobile) {
    return <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>{children}</div>;
  }
  const mockupWidth = MOCKUP_MOBILE_WIDTH;
  const scale = Math.min(1.2, (windowWidth - 32) / mockupWidth);
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ zoom: scale, width: "100%", maxWidth: mockupWidth }}>{children}</div>
    </div>
  );
}

type Props = {
  role?: "TRAINER" | "CLIENT" | null;
  dashboardHref: string;
  staticMode?: boolean;
  audience?: "trainer" | "member";
  onAudienceChange?: (a: "trainer" | "member") => void;
};

export function HeroParallaxZone({ role, dashboardHref, staticMode = false, audience = "trainer", onAudienceChange }: Props) {
  const [progress, setProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [viewportH, setViewportH] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const isPhone = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = isPhone;

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (staticMode) return;
    const el = sectionRef.current;
    if (!el) return;
    const vh = window.innerHeight;
    setViewportH(vh);
    const scrollable = (TOTAL_VH - 1) * vh;
    const updateScroll = () => {
      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      setProgress(clamp((window.scrollY - sectionTop) / scrollable));
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [staticMode]);

  useEffect(() => {
    if (!staticMode) return;
    setViewportH(window.innerHeight);
  }, [staticMode]);

  // ── Animation values ──────────────────────────────────────────────────────
  const textOpacity   = 1 - seg(progress, 0.05, 0.12);
  const mergeProgress = seg(progress, 0.08, 0.20);

  // Desktop & phone: Client → AI → Trainer. Tablet: Client + Trainer (no AI).
  const clientInBase  = seg(progress, 0.18, 0.28);
  const clientOutBase = seg(progress, 0.36, 0.44);
  const clientIn      = clientInBase;
  const clientOut     = isTablet ? seg(progress, 0.28, 0.36) : clientOutBase;
  const clientOpacity = Math.min(clientIn, 1 - clientOut);
  const clientY       = (1 - clientIn) * -120 + clientOut * 80;

  const aiIn      = seg(progress, 0.36, 0.44);
  const aiOut     = seg(progress, 0.52, 0.62);
  const aiOpacityRaw = Math.min(aiIn, 1 - aiOut);
  const aiOpacity = isTablet ? 0 : aiOpacityRaw;
  const aiY       = (1 - aiIn) * -120 + aiOut * 80;

  const trainerInBase = seg(progress, 0.52, 0.62);
  const trainerInTablet = seg(progress, 0.36, 0.48);
  const trainerIn      = isTablet ? trainerInTablet : trainerInBase;
  const trainerOpacity = trainerIn;
  const trainerY       = (1 - trainerIn) * -120;

  const showClient  = clientOpacity  > 0.01;
  const showAi      = aiOpacity      > 0.01 && !isTablet;
  const showTrainer = trainerOpacity > 0.01;

  const splitGrid = (): React.CSSProperties => ({
    display: isMobile ? "flex" : "grid",
    flexDirection: isMobile ? "column" : undefined,
    gridTemplateColumns: isMobile ? undefined : "1fr 1fr",
    gap: isMobile ? "20px" : "0",
    maxWidth: isMobile ? "100%" : "1100px",
    width: "100%",
    padding: isMobile ? "0 20px" : "0 32px",
    alignItems: "center",
  });

  // ── Static hero: no storytelling, no big card; centered text + tabs ───────────
  if (staticMode) {
    const tabBase = { padding: "10px 22px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", transition: "background .2s, color .2s" } as const;
    const heroAccent = audience === "member" ? "purple" : "green";
    const ctaBg = audience === "member" ? "#a78bfa" : "#22c55e";
    const ctaColor = audience === "member" ? "#fff" : "#040e07";
    return (
      <section id="uvod" aria-label="Úvod" style={{ minHeight: "100vh", position: "relative" }}>
        <style>{HERO_CSS}</style>
        <div style={{ position: "sticky", top: 0, minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HeroBackground mergeProgress={0} accent={heroAccent} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "720px", padding: isMobile ? "60px 24px 40px" : "0 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", gap: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 6, marginBottom: 28 }}>
              <button type="button" onClick={() => onAudienceChange?.("trainer")} style={{ ...tabBase, background: audience === "trainer" ? "#22c55e" : "rgba(255,255,255,.06)", color: audience === "trainer" ? "#040e07" : "rgba(255,255,255,.55)" }}>Som tréner</button>
              <button type="button" onClick={() => onAudienceChange?.("member")} style={{ ...tabBase, background: audience === "member" ? "#a78bfa" : "rgba(255,255,255,.06)", color: audience === "member" ? "#fff" : "rgba(255,255,255,.55)" }}>Som člen</button>
            </div>
            <h1 style={{ fontSize: isMobile ? "clamp(32px,8vw,48px)" : "clamp(38px,4.5vw,56px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 16 }}>
              Platforma pre {audience === "trainer" ? "trénerov" : "členov"}.
            </h1>
            <h1 style={{ fontSize: isMobile ? "clamp(32px,8vw,48px)" : "clamp(38px,4.5vw,56px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 24 }}>
              Na jednom mieste.
            </h1>
            <p style={{ fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,.55)", lineHeight: 1.65, marginBottom: 32, maxWidth: 480, marginInline: "auto" }}>
              {audience === "trainer" ? "Vytváraj plány, sleduj členov v reálnom čase. Systém upozorní na problémy skôr, než nastanú." : "Loguj jedlo, tréningy a váhu. S trénerom alebo s AI koučom — všetko na jednom mieste."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {role ? (
                <Link href={dashboardHref} className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")} style={{ background: ctaBg, color: ctaColor, borderColor: "transparent" }}>Prejsť do dashboardu <ChevronRight className="size-4 shrink-0" /></Link>
              ) : (
                <>
                  <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")} style={{ background: ctaBg, color: ctaColor, borderColor: "transparent" }}>Začať zadarmo <ChevronRight className="size-4 shrink-0" /></Link>
                  <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "inline-flex")}>Prihlásiť sa</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="hpz-section"
      style={{
        // Use locked px value once measured; CSS class handles pre-JS fallback (100svh → 100vh)
        ...(viewportH > 0 ? { height: `${(TOTAL_VH + TRAIL_VH) * viewportH}px` } : {}),
        position: "relative",
      }}
      aria-label="Hero"
    >
      <style>{HERO_CSS}</style>

      <div
        className="hpz-sticky"
        style={{
          position: "sticky", top: 0, overflow: "hidden",
          // Locked px once measured; CSS class handles pre-JS fallback (100svh → 100vh)
          ...(viewportH > 0 ? { height: `${viewportH}px` } : {}),
        }}
      >
        <HeroBackground mergeProgress={mergeProgress} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.5))", pointerEvents: "none" }} />

        {/* ── Phase 1: Hero text ─────────────────────────────────────────── */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, opacity: textOpacity, pointerEvents: textOpacity < 0.05 ? "none" : "auto", padding: isMobile ? "0 24px" : "0" }}>
          <div className="hpz-hero-text-inner" style={{ textAlign: "center", maxWidth: isMobile ? "100%" : "820px", padding: isMobile ? "0" : "0 24px" }}>
            {!isMobile && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "24px", padding: "6px 16px", marginBottom: "32px", animation: "hpz-badge-pulse 3s ease-in-out infinite" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px rgba(34,197,94,1)" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#4ade80", letterSpacing: "0.05em" }}>Pre trénerov, členov aj samostatných</span>
              </div>
            )}
            <h1 style={{ fontSize: isMobile ? "clamp(32px, 9vw, 48px)" : "clamp(38px, 5.5vw, 72px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: isMobile ? "8px" : "12px" }}>
              Platforma pre{" "}
              <FlipWords
                words={["trénerov", "členov", "všetkých"]}
                duration={3200}
                className="bg-linear-to-r from-green-400 via-green-300 to-emerald-200 bg-clip-text text-transparent px-0"
              />
            </h1>
            <h1 style={{ fontSize: isMobile ? "clamp(32px, 9vw, 48px)" : "clamp(38px, 5.5vw, 72px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: isMobile ? "16px" : "24px" }}>
              Na jednom mieste.
            </h1>
            <p style={{ fontSize: isMobile ? "15px" : "clamp(16px, 1.8vw, 20px)", color: "rgba(255,255,255,0.52)", lineHeight: 1.7, marginBottom: isMobile ? "28px" : "40px", maxWidth: isMobile ? "100%" : "600px", marginInline: "auto" }}>
              {isMobile ? "Tréneri: prehľad a plány na jednom mieste. Členovia: logovanie a pokrok — s trénerom alebo s AI koučom. Jedna platforma pre všetkých." : "Tréneri majú prehľad nad členmi a plány na jednom mieste. Členovia logujú a sledujú pokrok — s trénerom alebo s AI koučom. Jedna platforma pre všetkých."}
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
              {role ? (
                <Link href={dashboardHref} className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")}>Prejsť do dashboardu <ChevronRight className="size-4 shrink-0" /></Link>
              ) : (
                <>
                  <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")}>Začať zadarmo <ChevronRight className="size-4 shrink-0" /></Link>
                  <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "inline-flex")}>Prihlásiť sa</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Phase 2: Client ────────────────────────────────────────────── */}
        {showClient && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, pointerEvents: "none", opacity: clientOpacity, transform: `translateY(${clientY}px)` }}>
            <div style={splitGrid()}>
              <SideCopy
                eyebrow="Pre členov"
                headline={"Tvoj pokrok.\nKaždý deň viditeľný."}
                sub={isMobile ? "Loguj váhu, jedlo a tréning. Tréner vidí všetko naživo." : "Loguj váhu, jedlo a tréning. Sleduj svoju sériu, trendy a ciele. Tréner vidí všetko v reálnom čase — bez správ, bez tabuliek."}
                bullets={["14-dňová séria bez prerušenia", "−2.1 kg za posledný mesiac", "Tréner vidí tvoj pokrok naživo"]}
                badge="Live synchronizácia" accent="green"
                phaseIn={clientIn} side="left" isMobile={isMobile}
              />
              <MockupWrap isMobile={isMobile} windowWidth={windowWidth}>
                <ClientMockup mobile={isMobile} />
                <FloatingBadge text="Tréner vidí toto práve teraz" sub="Posledná aktualizácia: pred 2 min" phaseIn={clientIn} position={{ top: "-18px", right: "0px" }} accent="green" isMobile={isMobile} />
              </MockupWrap>
            </div>
          </div>
        )}

        {/* ── Phase 3: AI ────────────────────────────────────────────────── */}
        {showAi && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, pointerEvents: "none", opacity: aiOpacity, transform: `translateY(${aiY}px)` }}>
            <div style={splitGrid()}>
              <SideCopy
                eyebrow="Člen AI — 4,99 €/mes"
                headline={"Bez trénera?\nMáš AI kouča."}
                sub={isMobile ? "AI analyzuje tvoje dáta a funguje ako osobný kouč — 24/7." : "AI analyzuje tvoje dáta každý deň a funguje ako tvoj osobný kouč — dostupný 24/7. Stojí menej ako jedna káva týždenne."}
                bullets={["Vypočíta TDEE a makrá podľa teba", "Deteguje plató a navrhne zmenu", "Odpovedá s kontextom tvojich dát"]}
                badge="Powered by Claude AI" accent="purple"
                phaseIn={aiIn} side="left" isMobile={isMobile}
              />
              <MockupWrap isMobile={isMobile} windowWidth={windowWidth}>
                <AiMockup mobile={isMobile} />
                <FloatingBadge text="AI kouč je vždy online" sub="Odpovedá do 3 sekúnd" phaseIn={aiIn} position={{ top: "-18px", right: "0px" }} accent="purple" isMobile={isMobile} />
              </MockupWrap>
            </div>
          </div>
        )}

        {/* ── Phase 4: Trainer ───────────────────────────────────────────── */}
        {showTrainer && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, pointerEvents: "none", opacity: trainerOpacity, transform: `translateY(${trainerY}px)` }}>
            <div style={splitGrid()}>
              <MockupWrap isMobile={isMobile} windowWidth={windowWidth}>
                <TrainerMockup mobile={isMobile} />
                <FloatingBadge text="3 upozornenia vyžadujú akciu" sub="Tomáš M. · 4 dni bez aktivity" phaseIn={trainerIn} position={{ top: "-18px", left: "0px" }} accent="green" isMobile={isMobile} />
              </MockupWrap>
              <SideCopy
                eyebrow="Pre trénerov"
                headline={"12 klientov.\nJeden pohľad."}
                sub={isMobile ? "Systém sám zistí, kto potrebuje pozornosť. Ty len potvrdíš akciu." : "Koniec tabuliek a WhatsApp správ. Systém sám zistí, kto potrebuje pozornosť — ty len potvrdíš akciu."}
                bullets={["Kto je aktívny a kto nie — ihneď", "Jana: plató 3 týždne — alert", "Systém navrhne konkrétnu akciu"]}
                badge="Prediktívna inteligencia" accent="green"
                phaseIn={trainerIn} side="right" isMobile={isMobile} mobileOrder={-1}
              />
            </div>
          </div>
        )}

        <PhaseDots progress={progress} isMobile={isMobile} isPhone={isPhone} isTablet={isTablet} />
        <ScrollHint visible={progress < 0.05} />
        <ScrollBar progress={progress} />
      </div>
    </section>
  );
}
