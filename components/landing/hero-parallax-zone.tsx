"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./hero-background";

const TOTAL_VH = 7; // 6vh scrollable distance

function clamp(x: number, a = 0, b = 1) { return Math.min(b, Math.max(a, x)); }
function seg(p: number, a: number, b: number) { return clamp((p - a) / (b - a)); }

// ── Scroll phases ─────────────────────────────────────────────────────────────
// 0.00 – 0.10  hero text + floating cards idle
// 0.10 – 0.20  hero text fades out
// 0.15 – 0.32  cards merge
// 0.28 – 0.42  client mockup + copy slide in
// 0.42 – 0.60  client phase pinned
// 0.58 – 0.66  client slides out
// 0.63 – 0.78  trainer mockup + copy slide in
// 0.78 – 1.00  trainer phase pinned
// ─────────────────────────────────────────────────────────────────────────────

const shell: React.CSSProperties = {
  background: "rgba(6, 18, 10, 0.92)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(34, 197, 94, 0.22)",
  borderRadius: "20px",
  padding: "22px",
  boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(34,197,94,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
  width: "100%",
  maxWidth: "520px",
};

const tile: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(34,197,94,0.09)",
  borderRadius: "12px",
  padding: "13px",
};

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
      {children}
    </div>
  );
}

function ClientMockup() {
  const pts: [number, number][] = [[0,9],[14,13],[28,11],[42,17],[56,21],[70,25],[84,31],[99,38]];
  const line = `M${pts.map(([x,y]) => `${x},${y}`).join(" L")}`;
  const area = `${line} L99,48 L0,48 Z`;
  const r = 22, circ = 2 * Math.PI * r;

  return (
    <div style={shell}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
        Dashboard — Klient
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { label: "Váha",    value: "73.4 kg",    accent: false },
          { label: "Kalórie", value: "1 840 kcal", accent: false },
          { label: "Séria",   value: "14 dní",     accent: true  },
          { label: "Tréning", value: "Hotový",     accent: true  },
        ].map(({ label, value, accent }) => (
          <div key={label} style={tile}>
            <Lbl>{label}</Lbl>
            <div style={{ fontSize: "14px", fontWeight: 700, color: accent ? "#22c55e" : "#fff" }}>{value}</div>
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
    </div>
  );
}

function TrainerMockup() {
  const clients = [
    { name: "Mirka V.",  active: true,  ago: "dnes",  risk: null },
    { name: "Adam T.",   active: true,  ago: "dnes",  risk: null },
    { name: "Jana K.",   active: false, ago: "2 dni", risk: "plató" },
    { name: "Tomáš M.",  active: false, ago: "4 dni", risk: "riziko" },
  ];

  return (
    <div style={shell}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
        Dashboard — Tréner
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { label: "Klienti",    value: "12", accent: false },
          { label: "Plány",      value: "8",  accent: false },
          { label: "Jedálničky", value: "5",  accent: false },
          { label: "Aktívni",    value: "7",  accent: true  },
        ].map(({ label, value, accent }) => (
          <div key={label} style={tile}>
            <Lbl>{label}</Lbl>
            <div style={{ fontSize: "22px", fontWeight: 700, color: accent ? "#22c55e" : "#fff" }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div style={tile}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <Lbl>Klienti</Lbl>
            <span style={{ fontSize: "10px", color: "#4ade80", fontWeight: 700 }}>12 aktívnych</span>
          </div>
          {clients.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.active ? "#22c55e" : (c.risk === "riziko" ? "#ef4444" : "rgba(255,255,255,0.2)"), boxShadow: c.active ? "0 0 5px #22c55e" : "none", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", flex: 1 }}>{c.name}</span>
              {c.risk ? (
                <span style={{ fontSize: "9px", color: c.risk === "riziko" ? "#f87171" : "#f59e0b", background: c.risk === "riziko" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", borderRadius: "4px", padding: "1px 5px", fontWeight: 600 }}>{c.risk}</span>
              ) : (
                <span style={{ fontSize: "10px", color: c.active ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.25)" }}>{c.ago}</span>
              )}
            </div>
          ))}
          <div style={{ paddingTop: "7px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+ 8 ďalších</div>
        </div>
        <div style={tile}>
          <Lbl>Priradený plán</Lbl>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>Silový cyklus A</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>8 klientov · 4 týždne</div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            {[{ l: "T1", d: true }, { l: "T2", d: true }, { l: "T3", d: false }, { l: "T4", d: false }].map(({ l, d }, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: "20px", borderRadius: "4px", background: d ? "#22c55e" : "rgba(255,255,255,0.06)", boxShadow: d ? "0 0 6px rgba(34,197,94,0.4)" : "none", marginBottom: "3px" }} />
                <div style={{ textAlign: "center", fontSize: "8px", color: d ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.25)", fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>
            Týždeň <span style={{ color: "#4ade80", fontWeight: 600 }}>2</span> / 4
          </div>
          <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Lbl>Aktivita</Lbl>
            {["Mirka zalogovala váhu", "Adam dokončil tréning"].map((msg, i) => (
              <div key={i} style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", display: "flex", gap: "5px", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Side copy block shown next to each mockup ─────────────────────────────────
function SideCopy({
  eyebrow,
  headline,
  sub,
  bullets,
  badge,
  progress,
  side,
}: {
  eyebrow: string;
  headline: string;
  sub: string;
  bullets: string[];
  badge?: string;
  progress: number; // 0→1 entrance progress
  side: "left" | "right";
}) {
  const dx = side === "left" ? -50 : 50;
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateX(${(1 - progress) * dx}px)`,
        transition: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "0",
        padding: side === "left" ? "0 48px 0 0" : "0 0 0 48px",
      }}
    >
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "20px",
            padding: "5px 12px",
            marginBottom: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.8)" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80", letterSpacing: "0.06em" }}>{badge}</span>
        </div>
      )}

      <div style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
        {eyebrow}
      </div>

      <h2
        style={{
          fontSize: "clamp(28px, 3.5vw, 46px)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "18px",
          whiteSpace: "pre-line",
        }}
      >
        {headline}
      </h2>

      <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.58)", lineHeight: 1.65, marginBottom: "28px" }}>
        {sub}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        {bullets.map((b, i) => (
          <div
            key={b}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              opacity: progress > 0.4 + i * 0.15 ? 1 : 0,
              transform: progress > 0.4 + i * 0.15 ? "translateX(0)" : `translateX(${side === "left" ? -16 : 16}px)`,
              transition: "none",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "6px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Floating badge that appears near the mockup ───────────────────────────────
function FloatingBadge({ text, sub, progress, position }: {
  text: string;
  sub?: string;
  progress: number;
  position: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        ...position,
        background: "rgba(6,18,10,0.95)",
        border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: "12px",
        padding: "8px 12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.06)",
        opacity: progress > 0.6 ? (progress - 0.6) / 0.3 : 0,
        transform: `scale(${0.85 + (progress > 0.6 ? Math.min((progress - 0.6) / 0.3, 1) * 0.15 : 0)})`,
        transformOrigin: "center",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 5,
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{text}</div>
      {sub && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

// ── Scroll progress bar at bottom ────────────────────────────────────────────
function ScrollBar({ progress }: { progress: number }) {
  // Only show during mockup phases
  const show = progress > 0.28 && progress < 0.99;
  const pct = clamp((progress - 0.28) / 0.71) * 100;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        opacity: show ? 1 : 0,
        zIndex: 30,
        pointerEvents: "none",
        transition: "opacity 0.4s ease",
      }}
    >
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
        Pokračuj scrollovaním
      </div>
      <div style={{ width: "120px", height: "2px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#22c55e", borderRadius: "2px", boxShadow: "0 0 6px rgba(34,197,94,0.6)", transition: "none" }} />
      </div>
    </div>
  );
}

type Props = { role?: "TRAINER" | "CLIENT" | null; dashboardHref: string };

export function HeroParallaxZone({ role, dashboardHref }: Props) {
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const scrollable = (TOTAL_VH - 1) * vh;
      const sectionTop = window.scrollY + el.getBoundingClientRect().top;
      setProgress(clamp((window.scrollY - sectionTop) / scrollable));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // ── Animation values ──────────────────────────────────────────────────────
  const textOpacity   = 1 - seg(progress, 0.10, 0.20);
  const mergeProgress = seg(progress, 0.15, 0.32);

  // Client phase
  const clientIn      = seg(progress, 0.28, 0.42);
  const clientOut     = seg(progress, 0.58, 0.66);
  const clientOpacity = Math.min(clientIn, 1 - clientOut);
  const clientY       = (1 - clientIn) * -120 + clientOut * 80;

  // Trainer phase
  const trainerIn      = seg(progress, 0.63, 0.78);
  const trainerOpacity = trainerIn;
  const trainerY       = (1 - trainerIn) * -120;

  const showClient  = clientOpacity  > 0.01;
  const showTrainer = trainerOpacity > 0.01;

  return (
    <section
      ref={sectionRef}
      style={{ height: `${TOTAL_VH * 100}vh`, position: "relative" }}
      aria-label="Hero"
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        <HeroBackground mergeProgress={mergeProgress} />

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45))", pointerEvents: "none" }} />

        {/* ── Phase 1: Hero text ───────────────────────────────────────────── */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10, opacity: textOpacity,
          pointerEvents: textOpacity < 0.05 ? "none" : "auto",
        }}>
          <div style={{ textAlign: "center", maxWidth: "768px", padding: "0 24px" }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Platforma, ktorá{" "}
              <span className="text-primary">myslí</span>{" "}
              za trénerov
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground" style={{ margin: "24px 0 32px" }}>
              Klienti logujú, tréneri vytvárajú plány — a systém sám detekuje
              vzory, predikuje výsledky a upozorní, keď treba zasiahnuť.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
              {role ? (
                <Button size="lg" asChild>
                  <Link href={dashboardHref} className="inline-flex items-center gap-2">
                    Prejsť do dashboardu <ChevronRight className="size-4 shrink-0" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/register" className="inline-flex items-center gap-2">
                      Začať zadarmo <ChevronRight className="size-4 shrink-0" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Prihlásiť sa</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Phase 2: Client dashboard ────────────────────────────────────── */}
        {showClient && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 20, pointerEvents: "none",
              opacity: clientOpacity,
              transform: `translateY(${clientY}px)`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0",
                maxWidth: "1100px",
                width: "100%",
                padding: "0 32px",
                alignItems: "center",
              }}
            >
              {/* Copy — left */}
              <SideCopy
                eyebrow="Pre klientov"
                headline={"Tvoj pokrok.\nV číslach."}
                sub="Každý deň vidíš kde stojíš — váha, kalórie, tréning, séria. Tréner vidí to isté v reálnom čase."
                bullets={[
                  "14-dňová séria bez prerušenia",
                  "−2.1 kg za posledný mesiac",
                  "Tréner vidí tvoj pokrok živé",
                ]}
                badge="Live synchronizácia"
                progress={clientIn}
                side="left"
              />

              {/* Mockup — right, slides from above */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <ClientMockup />
                <FloatingBadge
                  text="Tréner vidí toto práve teraz"
                  sub="Posledná aktualizácia: pred 2 min"
                  progress={clientIn}
                  position={{ top: "-16px", right: "0px" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 3: Trainer dashboard ───────────────────────────────────── */}
        {showTrainer && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 20, pointerEvents: "none",
              opacity: trainerOpacity,
              transform: `translateY(${trainerY}px)`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0",
                maxWidth: "1100px",
                width: "100%",
                padding: "0 32px",
                alignItems: "center",
              }}
            >
              {/* Mockup — left, slides from above */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <TrainerMockup />
                <FloatingBadge
                  text="3 upozornenia vyžadujú akciu"
                  sub="Tomáš M. · 4 dni bez aktivity"
                  progress={trainerIn}
                  position={{ top: "-16px", left: "0px" }}
                />
              </div>

              {/* Copy — right */}
              <SideCopy
                eyebrow="Pre trénerov"
                headline={"12 klientov.\nJeden pohľad."}
                sub="Koniec tabuliek a WhatsApp správ. Všetci klienti, plány aj upozornenia na jednej obrazovke."
                bullets={[
                  "7 aktívnych klientov dnes",
                  "Tomáš: 4 dni bez aktivity — alert",
                  "Systém navrhne akciu za teba",
                ]}
                badge="Prediktívna inteligencia"
                progress={trainerIn}
                side="right"
              />
            </div>
          </div>
        )}

        {/* Scroll progress bar */}
        <ScrollBar progress={progress} />

      </div>
    </section>
  );
}
