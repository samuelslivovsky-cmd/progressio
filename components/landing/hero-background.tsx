"use client";

const PARTICLES: { x: number; y: number; s: number; d: number; dur: number }[] = [
  { x: 8,  y: 12, s: 2,   d: 0,   dur: 3.1 },
  { x: 23, y: 45, s: 1.5, d: 0.8, dur: 4.0 },
  { x: 67, y: 8,  s: 2.5, d: 1.5, dur: 3.5 },
  { x: 78, y: 32, s: 1.5, d: 0.3, dur: 5.0 },
  { x: 91, y: 67, s: 2,   d: 2.1, dur: 3.2 },
  { x: 45, y: 89, s: 1,   d: 1.0, dur: 4.5 },
  { x: 12, y: 75, s: 1.5, d: 2.5, dur: 3.8 },
  { x: 56, y: 20, s: 2,   d: 0.6, dur: 4.2 },
  { x: 34, y: 60, s: 1,   d: 1.8, dur: 3.6 },
  { x: 82, y: 85, s: 2.5, d: 0.4, dur: 5.1 },
  { x: 18, y: 35, s: 1.5, d: 2.8, dur: 3.3 },
  { x: 94, y: 22, s: 1,   d: 1.3, dur: 4.8 },
  { x: 48, y: 78, s: 2,   d: 0.9, dur: 3.9 },
  { x: 73, y: 55, s: 1.5, d: 2.2, dur: 4.4 },
  { x: 29, y: 88, s: 1,   d: 1.6, dur: 3.7 },
  { x: 62, y: 42, s: 2,   d: 0.1, dur: 5.2 },
  { x: 5,  y: 58, s: 1,   d: 3.1, dur: 4.1 },
  { x: 87, y: 48, s: 1.5, d: 1.9, dur: 3.4 },
];

const CSS = `
  @keyframes hb-float-1 {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50%       { transform: translateY(-20px) rotate(-0.5deg); }
  }
  @keyframes hb-float-2 {
    0%, 100% { transform: translateY(0px) rotate(2.5deg); }
    50%       { transform: translateY(-16px) rotate(1deg); }
  }
  @keyframes hb-float-3 {
    0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
    50%       { transform: translateY(-24px) rotate(-2.5deg); }
  }
  @keyframes hb-float-4 {
    0%, 100% { transform: translateY(0px) rotate(3deg); }
    50%       { transform: translateY(-18px) rotate(1.5deg); }
  }
  @keyframes hb-float-5 {
    0%, 100% { transform: translateY(0px) rotate(1deg); }
    50%       { transform: translateY(-14px) rotate(-1deg); }
  }
  @keyframes hb-float-6 {
    0%, 100% { transform: translateY(0px) rotate(-2.5deg); }
    50%       { transform: translateY(-22px) rotate(-1deg); }
  }
  @keyframes hb-twinkle {
    0%, 100% { opacity: 0.12; transform: scale(1); }
    50%       { opacity: 0.7;  transform: scale(1.8); }
  }
  @keyframes hb-orb {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.06); }
  }
`;

const cardBase: React.CSSProperties = {
  background: "rgba(6, 18, 10, 0.72)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(34, 197, 94, 0.16)",
  borderRadius: "16px",
  padding: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const lbl: React.CSSProperties = {
  fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "10px",
};

const bdg: React.CSSProperties = {
  fontSize: "10px", background: "rgba(34,197,94,0.12)", color: "#4ade80",
  padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(34,197,94,0.22)", fontWeight: 600,
};

function WeightCard() {
  const pts: [number, number][] = [
    [0,9],[11,13],[22,11],[33,17],[44,21],[55,25],[66,29],[77,33],[88,38],[99,42],
  ];
  const line = `M${pts.map(([x, y]) => `${x},${y}`).join(" L")}`;
  const area = `${line} L99,52 L0,52 Z`;
  return (
    <div style={{ ...cardBase, width: "200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ ...lbl, margin: 0 }}>Váha</span>
        <span style={bdg}>↓ −2.1 kg</span>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: "12px", fontVariantNumeric: "tabular-nums" }}>
        73.4 <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>kg</span>
      </div>
      <svg viewBox="0 0 99 52" width="100%" height="44" overflow="visible">
        <defs>
          <linearGradient id="hb-wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#hb-wg)" />
        <path d={line} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.55))" }} />
        <circle cx="99" cy="42" r="3.5" fill="#22c55e" style={{ filter: "drop-shadow(0 0 5px rgba(34,197,94,0.8))" }} />
      </svg>
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "5px" }}>Posledných 30 dní</div>
    </div>
  );
}

function CaloriesCard() {
  const r = 24, circ = 2 * Math.PI * r, filled = circ * 0.84;
  return (
    <div style={{ ...cardBase, width: "196px" }}>
      <span style={lbl}>Kalórie dnes</span>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <svg width="62" height="62" viewBox="0 0 62 62" style={{ flexShrink: 0 }}>
          <defs>
            <filter id="hb-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx="31" cy="31" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx="31" cy="31" r={r} fill="none" stroke="#22c55e" strokeWidth="5"
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 31 31)" filter="url(#hb-glow)" />
          <text x="31" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">84%</text>
        </svg>
        <div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>1,840</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.32)", marginTop: "3px" }}>/ 2,200 kcal</div>
          <div style={{ fontSize: "10px", color: "#4ade80", marginTop: "7px", fontWeight: 600 }}>360 zostatok</div>
        </div>
      </div>
    </div>
  );
}

function WorkoutCard() {
  const exercises = [
    { name: "Bench Press", done: 3, total: 4 },
    { name: "Squat",       done: 4, total: 4 },
    { name: "Pull-ups",    done: 2, total: 3 },
  ];
  return (
    <div style={{ ...cardBase, width: "214px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ ...lbl, margin: 0 }}>Dnešný tréning</span>
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {exercises.map((ex, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{ex.name}</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>{ex.done}/{ex.total}</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(ex.done / ex.total) * 100}%`, background: ex.done === ex.total ? "#22c55e" : "linear-gradient(90deg,#22c55e,#86efac)", borderRadius: "2px", boxShadow: ex.done === ex.total ? "0 0 6px rgba(34,197,94,0.55)" : "none" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCard() {
  const total = 21, active = 14;
  return (
    <div style={{ ...cardBase, width: "178px" }}>
      <span style={lbl}>Aktívna séria</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "14px" }}>
        <span style={{ fontSize: "44px", fontWeight: 800, color: "#22c55e", lineHeight: 1, textShadow: "0 0 24px rgba(34,197,94,0.35)" }}>{active}</span>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>dní v rade</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ width: "11px", height: "11px", borderRadius: "3px", background: i < active ? (i >= active - 3 ? "#22c55e" : "rgba(34,197,94,0.38)") : "rgba(255,255,255,0.05)", boxShadow: i < active && i >= active - 3 ? "0 0 6px rgba(34,197,94,0.5)" : "none" }} />
        ))}
      </div>
    </div>
  );
}

function TrainerClientsCard() {
  const clients = [
    { name: "Mirka V.",  active: true,  ago: "dnes" },
    { name: "Adam T.",   active: true,  ago: "dnes" },
    { name: "Jana K.",   active: false, ago: "2 dni" },
    { name: "Tomáš M.",  active: false, ago: "4 dni" },
  ];
  return (
    <div style={{ ...cardBase, width: "206px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ ...lbl, margin: 0 }}>Moji klienti</span>
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
      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+ 8 ďalších klientov</div>
    </div>
  );
}

function TrainerPlanCard() {
  const weeks = [{ label: "T1", done: true }, { label: "T2", done: true }, { label: "T3", done: false }, { label: "T4", done: false }];
  return (
    <div style={{ ...cardBase, width: "196px" }}>
      <span style={lbl}>Priradený plán</span>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px", lineHeight: 1.3 }}>Silový cyklus A</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "14px" }}>8 klientov · 4 týždne</div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: "28px", borderRadius: "6px", background: w.done ? "#22c55e" : "rgba(255,255,255,0.06)", border: !w.done ? "1px solid rgba(255,255,255,0.08)" : "none", boxShadow: w.done ? "0 0 8px rgba(34,197,94,0.4)" : "none", marginBottom: "4px" }} />
            <span style={{ fontSize: "9px", color: w.done ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.25)", fontWeight: 600 }}>{w.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
        Týždeň <span style={{ color: "#4ade80", fontWeight: 600 }}>2</span> / 4
      </div>
    </div>
  );
}

// Wraps each card with scroll-driven merge transform
function MergeWrap({ children, mergeP, side, position, anim, delay }: {
  children: React.ReactNode;
  mergeP: number;
  side: "left" | "right";
  position: React.CSSProperties;
  anim: string;
  delay: string;
}) {
  const dx = side === "left" ? mergeP * 44 : -mergeP * 44;
  return (
    <div style={{ position: "absolute", ...position, transform: `translateX(${dx}vw)`, opacity: 1 - mergeP }}>
      <div style={{ animation: anim, animationDelay: delay }}>
        {children}
      </div>
    </div>
  );
}

export function HeroBackground({ mergeProgress = 0 }: { mergeProgress?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Base gradient */}
      <div style={{ position: "absolute", inset: 0, background: "#080c09" }} />

      {/* Central nebula glow */}
      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, -50%)", width: "70vw", height: "50vh", background: "radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, rgba(16,185,129,0.03) 40%, transparent 70%)", animation: "hb-orb 7s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "65%", left: "5%", width: "35vw", height: "35vh", background: "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 65%)", animation: "hb-orb 9s ease-in-out infinite", animationDelay: "2s" }} />
      <div style={{ position: "absolute", top: "15%", right: "8%", width: "28vw", height: "40vh", background: "radial-gradient(ellipse, rgba(20,184,166,0.04) 0%, transparent 65%)", animation: "hb-orb 8s ease-in-out infinite", animationDelay: "1s" }} />

      {/* Star particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{ position: "absolute", top: `${p.y}%`, left: `${p.x}%`, width: `${p.s}px`, height: `${p.s}px`, borderRadius: "50%", background: "#ffffff", animation: `hb-twinkle ${p.dur}s ease-in-out infinite`, animationDelay: `${p.d}s` }} />
      ))}

      {/* Floating metric cards — desktop only, merge on scroll */}
      <div className="hidden lg:block">
        <MergeWrap side="left"  mergeP={mergeProgress} position={{ top: "10%", left: "2.5%" }}   anim="hb-float-1 7s ease-in-out infinite"   delay="0s">   <WeightCard /></MergeWrap>
        <MergeWrap side="right" mergeP={mergeProgress} position={{ top: "8%",  right: "2.5%" }}  anim="hb-float-2 8.5s ease-in-out infinite" delay="1.5s"> <CaloriesCard /></MergeWrap>
        <MergeWrap side="left"  mergeP={mergeProgress} position={{ top: "38%", left: "2.5%" }}   anim="hb-float-5 8s ease-in-out infinite"   delay="1.2s"> <TrainerClientsCard /></MergeWrap>
        <MergeWrap side="right" mergeP={mergeProgress} position={{ top: "35%", right: "2.5%" }}  anim="hb-float-6 9.5s ease-in-out infinite" delay="3s">   <TrainerPlanCard /></MergeWrap>
        <MergeWrap side="left"  mergeP={mergeProgress} position={{ bottom: "22%", left: "2.5%" }} anim="hb-float-3 9s ease-in-out infinite"  delay="0.8s"> <WorkoutCard /></MergeWrap>
        <MergeWrap side="right" mergeP={mergeProgress} position={{ bottom: "20%", right: "2.5%" }} anim="hb-float-4 7.5s ease-in-out infinite" delay="2.2s"><StreakCard /></MergeWrap>
      </div>
    </div>
  );
}
