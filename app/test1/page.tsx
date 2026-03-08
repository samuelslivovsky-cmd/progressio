import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata = { title: "Progressio — Varianta A" };

const CSS = `
  @keyframes t1-fade { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes t1-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes t1-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

  .t1-a1{animation:t1-fade .7s ease both}
  .t1-a2{animation:t1-fade .7s .15s ease both}
  .t1-a3{animation:t1-fade .7s .3s ease both}
  .t1-a4{animation:t1-fade .7s .45s ease both}
  .t1-a5{animation:t1-fade .7s .6s ease both}
  .t1-mockup{animation:t1-fade .7s .2s ease both,t1-float 7s 1s ease-in-out infinite}

  .t1-tile{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:28px;transition:border-color .25s,background .25s,transform .2s}
  .t1-tile:hover{border-color:rgba(34,197,94,.28);background:rgba(34,197,94,.03);transform:translateY(-3px)}
  .t1-tile-ai:hover{border-color:rgba(167,139,250,.32);background:rgba(167,139,250,.04);transform:translateY(-3px)}

  .t1-plan{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:28px 24px;transition:border-color .25s,transform .2s}
  .t1-plan:hover{border-color:rgba(34,197,94,.2);transform:translateY(-2px)}
  .t1-plan-pro{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.28)}
  .t1-plan-pro:hover{border-color:rgba(34,197,94,.5);transform:translateY(-2px)}

  .t1-dot{width:8px;height:8px;border-radius:50%;animation:t1-pulse 2s ease-in-out infinite}

  /* nav */
  .t1-nav{display:none}
  @media(min-width:1024px){.t1-nav{display:flex}}

  /* hero */
  @media(max-width:767px){
    .t1-hero{flex-direction:column!important;padding:52px 20px 48px!important;gap:40px!important}
    .t1-h1{font-size:46px!important;line-height:1.06!important}
    .t1-hero-right{display:none!important}
    .t1-stats{flex-wrap:wrap;gap:16px 24px!important}
  }

  /* bento */
  .t1-bento{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:minmax(140px,auto);gap:12px}
  .t1-b1{grid-column:span 7;grid-row:span 2}
  .t1-b2{grid-column:span 5;grid-row:span 2}
  .t1-b3{grid-column:span 4}
  .t1-b4{grid-column:span 4}
  .t1-b5{grid-column:span 4}
  @media(max-width:767px){
    .t1-bento{grid-template-columns:1fr!important}
    .t1-b1,.t1-b2,.t1-b3,.t1-b4,.t1-b5{grid-column:span 1!important;grid-row:span 1!important}
  }
  @media(min-width:768px)and(max-width:1023px){
    .t1-bento{grid-template-columns:repeat(2,1fr)!important}
    .t1-b1{grid-column:span 2!important}
    .t1-b2,.t1-b3,.t1-b4,.t1-b5{grid-column:span 1!important;grid-row:span 1!important}
  }

  /* pricing */
  .t1-pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  @media(max-width:767px){.t1-pgrid{grid-template-columns:1fr!important}}
  @media(min-width:768px)and(max-width:1023px){.t1-pgrid{grid-template-columns:repeat(2,1fr)!important}}

  /* reviews */
  .t1-rgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  @media(max-width:767px){.t1-rgrid{grid-template-columns:1fr!important}}

  /* how it works */
  .t1-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
  @media(max-width:767px){.t1-steps{grid-template-columns:1fr!important}}
  @media(min-width:768px)and(max-width:1023px){.t1-steps{grid-template-columns:repeat(2,1fr)!important}}

  /* comparison */
  .t1-compare{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
  @media(max-width:767px){.t1-compare{grid-template-columns:1fr!important}}

  /* faq */
  .t1-faq-list{display:flex;flex-direction:column;gap:12px}
`;

export default function Test1Page() {
  const ff = font.style.fontFamily;

  return (
    <div className={font.className} style={{ background: "#080c09", minHeight: "100vh", color: "#fff", fontFamily: ff }}>
      <style>{CSS}</style>

      {/* ── NAVBAR ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,12,9,.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(34,197,94,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.025em" }}>Progressio</span>
          </div>
          <nav className="t1-nav" style={{ alignItems: "center", gap: 28 }}>
            {[["#funkcie", "Funkcie"], ["#ako", "Ako to funguje"], ["#inteligencia", "Inteligencia"], ["#ceny", "Ceny"], ["#recenzie", "Recenzie"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: "rgba(255,255,255,.58)", textDecoration: "none", fontWeight: 600, letterSpacing: "-.01em" }}>{label}</a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/login" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.68)", textDecoration: "none" }}>Prihlásiť</Link>
            <Link href="/register" style={{ padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none" }}>Registrovať sa</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px" }}>
        <div className="t1-hero" style={{ display: "flex", alignItems: "center", gap: "60px", minHeight: "88vh", padding: "72px 0 64px" }}>

          {/* LEFT */}
          <div style={{ flex: "1 1 520px", maxWidth: 560 }}>
            <div className="t1-a1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.22)", borderRadius: 100, padding: "5px 14px", marginBottom: 28 }}>
              <span className="t1-dot" style={{ background: "#22c55e" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: ".06em", textTransform: "uppercase" }}>Platforma pre trénerov a členov</span>
            </div>

            <h1 className="t1-a2 t1-h1" style={{ fontFamily: ff, fontSize: 68, lineHeight: 1.04, letterSpacing: "-.02em", margin: "0 0 24px", fontWeight: 400 }}>
              Fitness bez&nbsp;<em style={{ fontStyle: "italic", color: "#4ade80" }}>chaosu</em>.<br />
              Výsledky bez&nbsp;<em style={{ fontStyle: "italic" }}>tabuliek</em>.
            </h1>

            <p className="t1-a3" style={{ fontSize: 17, color: "rgba(255,255,255,.62)", lineHeight: 1.65, margin: "0 0 36px", maxWidth: 460 }}>
              Progressio spája trénerov a členov. Plány, logovanie, analytika a AI kouč — všetko na jednom mieste. Bez WhatsApp, bez Excelu.
            </p>

            <div className="t1-a4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none", letterSpacing: "-.01em" }}>
                Začni ako tréner
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.82)", background: "rgba(255,255,255,.06)", textDecoration: "none", border: "1px solid rgba(255,255,255,.1)" }}>
                Začni ako člen
              </Link>
            </div>

            <div className="t1-a5 t1-stats" style={{ display: "flex", gap: 32, marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.07)" }}>
              {[["100+", "trénerov"], ["500+", "členov"], ["0€", "pre členov"], ["4.9★", "hodnotenie"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em", color: "#fff" }}>{n}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontWeight: 500, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — dashboard mockup */}
          <div className="t1-mockup t1-hero-right" style={{ flex: "0 0 460px", position: "relative" }}>
            {/* Glow */}
            <div style={{ position: "absolute", inset: "-40px", background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(34,197,94,.12) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 20, position: "relative" }}>
              {/* Header bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: ".08em", textTransform: "uppercase" }}>Klienti — tento týždeň</span>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ef4444", "#eab308", "#22c55e"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: .7 }} />)}
                </div>
              </div>

              {/* Client rows */}
              {[
                { name: "Mária S.", bar: 88, color: "#22c55e", tag: "na ceste", weight: "↓ 2.1 kg" },
                { name: "Adam K.", bar: 55, color: "#eab308", tag: "pozor", weight: "→ 0 kg" },
                { name: "Petra N.", bar: 72, color: "#22c55e", tag: "aktívna", weight: "↓ 0.8 kg" },
                { name: "Tomáš B.", bar: 22, color: "#ef4444", tag: "riziko", weight: "↑ 0.5 kg" },
              ].map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", flexShrink: 0 }}>
                    {c.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                    <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${c.bar}%`, background: c.color, borderRadius: 4, opacity: .8 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.color, textAlign: "right", flexShrink: 0 }}>
                    <div>{c.weight}</div>
                    <div style={{ color: "rgba(255,255,255,.35)", fontWeight: 500 }}>{c.tag}</div>
                  </div>
                </div>
              ))}

              {/* Bottom stats */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {[{ label: "Avg. adherencia", val: "74%", color: "#22c55e" }, { label: "Plató klienti", val: "1", color: "#eab308" }, { label: "Riziko dropout", val: "1", color: "#ef4444" }].map(s => (
                  <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: "-.02em" }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="funkcie" style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Funkcie</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(32px,4vw,52px)", fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1.1, margin: 0 }}>
            Všetko na jednom mieste
          </h2>
        </div>

        <div className="t1-bento">
          {/* Tile 1 — Trainer intelligence (large) */}
          <div className="t1-tile t1-b1" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", letterSpacing: ".08em", textTransform: "uppercase" }}>Trénerská inteligencia</span>
              </div>
              <h3 style={{ fontSize: "clamp(20px,2vw,26px)", fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1.2, margin: "0 0 10px" }}>
                Vidíš, kto potrebuje pozornosť — ešte pred tým, ako odíde.
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.6, margin: "0 0 24px" }}>
                Drop-off riziko, detekcia plató, vynechané cviky — systém monitoruje všetkých klientov automaticky a zobrazí ti len to, čo si vyžaduje akciu.
              </p>
            </div>
            {/* Alert feed preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "🔴", text: "Tomáš B. neaktívny 5 dní", action: "Poslať správu" },
                { icon: "🟡", text: "Adam K. — plató 3 týždne", action: "Zmeniť plán" },
                { icon: "🟡", text: "Lucia M. vynecháva drepy 4×", action: "Nahradiť cvik" },
              ].map(a => (
                <div key={a.text} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 14px" }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,.7)" }}>{a.text}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", whiteSpace: "nowrap" }}>{a.action} →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tile 2 — AI Coach */}
          <div className="t1-tile t1-tile-ai t1-b2" style={{ borderColor: "rgba(167,139,250,.18)", background: "rgba(167,139,250,.03)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(167,139,250,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", letterSpacing: ".08em", textTransform: "uppercase" }}>AI Kouč</span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1.2, margin: "0 0 10px" }}>Tréner v mobile. 24/7.</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6, margin: "0 0 20px" }}>Členovia bez trénera dostanú AI kouča — týždenné hodnotenie, TDEE, chat a predikciu cieľovej váhy.</p>
            {/* Chat bubbles */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ alignSelf: "flex-end", background: "rgba(167,139,250,.18)", border: "1px solid rgba(167,139,250,.2)", borderRadius: "14px 14px 4px 14px", padding: "9px 14px", maxWidth: "85%", fontSize: 13, color: "rgba(255,255,255,.85)" }}>
                Bolí ma chrbát, mám dnes cvičiť?
              </div>
              <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,.05)", borderRadius: "14px 14px 14px 4px", padding: "9px 14px", maxWidth: "90%", fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>
                Podľa tvojho dnešného plánu máš drepy a mŕtvy ťah — to by som dnes vynechal. Namiesto toho odporúčam horné partie (bench, rowing) bez axioloading.
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: "rgba(167,139,250,.7)", fontWeight: 600 }}>4.99€ / mesiac · Člen AI</div>
          </div>

          {/* Tile 3 — Logging */}
          <div className="t1-tile t1-b3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 8px" }}>Denník stravy</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6, margin: 0 }}>Jedlo, kalórie, makrá, voda. Loguješ každý deň — tréner to vidí v reálnom čase.</p>
          </div>

          {/* Tile 4 — Training */}
          <div className="t1-tile t1-b4">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 5v14" /><path d="M18 5v14" /><path d="M2 9h4" /><path d="M2 15h4" /><path d="M18 9h4" /><path d="M18 15h4" /><path d="M6 9h12" /><path d="M6 15h12" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 8px" }}>Tréningové plány</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6, margin: 0 }}>Tréner navrhne plán, priradí ho členovi. Člen ho plní, tréner vidí progres cvik po cviku.</p>
          </div>

          {/* Tile 5 — Progress photos + weight */}
          <div className="t1-tile t1-b5" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 8px" }}>Pokrok & grafy</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6, margin: "0 0 16px" }}>Váha, merania, fotky — každý deň, každý týždeň. Trend a predikcia cieľovej váhy.</p>
            {/* Mini sparkline */}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
              {[60, 45, 55, 40, 50, 38, 44, 35, 42, 32, 38, 28].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i >= 9 ? "#22c55e" : "rgba(34,197,94,.25)", borderRadius: "3px 3px 0 0", transition: "height .3s" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 6 }}>Váha — posledné 3 mesiace</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="ako" style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Ako to funguje</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.15, margin: 0 }}>
            Štyri kroky k lepším výsledkom
          </h2>
        </div>
        <div className="t1-steps">
          {[
            { num: "1", title: "Registrácia", desc: "Tréner alebo člen sa zaregistruje zadarmo. Člen môže byť s trénerom alebo solo s AI koučom." },
            { num: "2", title: "Plán", desc: "Tréner vytvorí stravovací a tréningový plán. Priradí ho členovi. Členovia AI dostanú TDEE a makrá od systému." },
            { num: "3", title: "Logovanie", desc: "Člen loguje jedlo, tréningy, váhu a merania každý deň. Všetko na jednom mieste, aj v mobile." },
            { num: "4", title: "Výsledky", desc: "Tréner vidí pokrok v reálnom čase. Analytika upozorní na riziká. AI kouč hodnotí týždeň a odpovedá na otázky." },
          ].map(s => (
            <div key={s.num} style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(34,197,94,.15)", color: "#22c55e", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{s.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 8px" }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTELLIGENCE ── */}
      <section id="inteligencia" style={{ background: "rgba(34,197,94,.04)", borderTop: "1px solid rgba(34,197,94,.1)", borderBottom: "1px solid rgba(34,197,94,.1)", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Prediktívna analytika</div>
            <h2 style={{ fontFamily: ff, fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1.15, margin: "0 0 18px" }}>
              Tréner Pro vidí problémy, kým nastanú.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.65, margin: "0 0 28px" }}>
              7 algoritmov monitoruje všetkých klientov automaticky. Dropout riziko (0–100), detekcia plató, vynechané cviky, riziková vzorka dní — všetko v jednej fronte.
            </p>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none" }}>
              Vyskúšať Tréner Pro
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div style={{ flex: "1 1 420px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[
                { metric: "Drop-off skóre", val: "0–100", desc: "Kompozitné riziko člena — workout adherencia, dni bez aktivity, logging trend.", color: "#22c55e" },
                { metric: "Plató detekcia", val: "21 dní", desc: "Ak váha stagnuje 3 týždne pri dobrej adherencii — systém navrhne úpravu.", color: "#22c55e" },
                { metric: "Vynechané cviky", val: "3×", desc: "Cvik vynechaný 3× za sebou → alert trénerovi s návrhom náhrady.", color: "#eab308" },
                { metric: "Rizikový deň", val: ">60%", desc: "Konkrétny deň v týždni s vysokou mierou vynechávky.", color: "#eab308" },
              ].map(m => (
                <div key={m.metric} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: m.color, letterSpacing: "-.03em", marginBottom: 4 }}>{m.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{m.metric}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="ceny" style={{ maxWidth: "1180px", margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Cenník</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(32px,4vw,52px)", fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1.1, margin: "0 0 14px" }}>
            Jednoduché ceny
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", margin: 0 }}>S trénerom je Progressio zadarmo. Solo? AI preberá rolu trénera za 4.99€.</p>
        </div>

        <div className="t1-pgrid">
          {[
            { name: "Člen", price: "0", period: "navždy", desc: "S trénerom", features: ["Denník stravy + kalórie", "Tréningový denník", "Váha, merania, grafy", "Progress fotky", "Plán od trénera"], cta: "Registrovať sa", ai: false, pro: false },
            { name: "Člen AI", price: "4.99", period: "mesiac", desc: "Solo bez trénera", features: ["Všetko z Člena", "AI týždenné hodnotenie", "TDEE + makrá", "Chat s AI 24/7", "Predikcia cieľovej váhy"], cta: "Vyskúšať AI", ai: true, pro: false },
            { name: "Tréner Starter", price: "0", period: "navždy", desc: "Až 3 klienti", features: ["Tvorba plánov", "Správa klientov", "Pokrok v reálnom čase", "Email podpora"], cta: "Začať zadarmo", ai: false, pro: false },
            { name: "Tréner Pro", price: "9", period: "mesiac", desc: "Neobmedzení klienti", features: ["Neobmedzení klienti", "Drop-off riziko skóre", "Detekcia plató + cvikov", "Prioritná fronta", "Navrhnuté akcie"], cta: "Vybrať Pro", ai: false, pro: true },
          ].map(plan => (
            <div key={plan.name} className={`t1-plan ${plan.pro ? "t1-plan-pro" : ""}`}>
              {plan.pro && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "#040e07", background: "#22c55e", display: "inline-block", padding: "3px 10px", borderRadius: 100, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Odporúčané</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: plan.ai ? "#c4b5fd" : plan.pro ? "#4ade80" : "rgba(255,255,255,.5)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.04em" }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>€</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 6 }}>/ {plan.period}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 20 }}>{plan.desc}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "rgba(255,255,255,.65)" }}>
                    <span style={{ color: plan.ai ? "#a78bfa" : "#22c55e", marginTop: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: "block", padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none", background: plan.pro ? "#22c55e" : plan.ai ? "rgba(167,139,250,.15)" : "rgba(255,255,255,.06)", color: plan.pro ? "#040e07" : plan.ai ? "#c4b5fd" : "rgba(255,255,255,.75)", border: plan.pro || plan.ai ? "none" : "1px solid rgba(255,255,255,.1)" }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.28)" }}>Člen AI a Tréner Pro bez záväzkov — zruš kedykoľvek.</p>
      </section>

      {/* ── REVIEWS ── */}
      <section id="recenzie" style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Referencie</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 400, letterSpacing: "-.02em", margin: 0 }}>Čo hovoria používatelia</h2>
        </div>
        <div className="t1-rgrid">
          {[
            { text: "Konečne jeden systém. Nemusím riešiť tabuľky ani WhatsApp — všetko mám v Progressio.", author: "Peter K.", role: "Tréner", since: "6 mesiacov" },
            { text: "Logujem jedlo a tréningy každý deň. Tréner vidí môj pokrok a upraví plán. Jednoduché.", author: "Mária S.", role: "Členka", since: "4 mesiace" },
            { text: "Používam s 15 klientmi. Plány, váha, fotky — všetko na jednom mieste. Šetrí to hodiny týždenne.", author: "Jakub V.", role: "Tréner", since: "8 mesiacov" },
            { text: "Progress fotky a grafy ma motivujú. Tréner to komentuje priamo v aplikácii.", author: "Lucia M.", role: "Členka", since: "3 mesiace" },
            { text: "AI kouč mi dal TDEE a makrá. Za mesiac som -2,5 kg. Bez trénera to konečne dáva zmysel.", author: "Michal R.", role: "Člen AI", since: "2 mesiace" },
            { text: "Prioritná fronta je zlatá. Vidím, kto potrebuje pozornosť, namiesto prezerania zoznamu.", author: "Andrea T.", role: "Trénerka", since: "5 mesiacov" },
          ].map(r => (
            <div key={r.author} style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "28px 28px" }}>
              <svg width="24" height="17" viewBox="0 0 28 20" fill="none" style={{ opacity: .25, marginBottom: 16 }}><path d="M0 20V12.667C0 5.556 4.148 1.185 12.444 0l1.334 2C9.926 2.963 7.63 5.481 7 9.333H12V20H0Zm16 0V12.667C16 5.556 20.148 1.185 28.444 0l1.334 2C25.926 2.963 23.63 5.481 23 9.333H28V20H16Z" fill="#22c55e" /></svg>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.8)", lineHeight: 1.7, margin: "0 0 20px" }}>{r.text}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.author}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{r.role}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.16)", borderRadius: 100, padding: "3px 10px" }}>{r.since}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRE KOHO ── */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Pre koho je Progressio</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.15, margin: 0 }}>
            Tréneri aj členovia — každý má svoj plán
          </h2>
        </div>
        <div className="t1-compare">
          <div style={{ background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 20, padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(34,197,94,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👥</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Pre trénerov</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", margin: "4px 0 0" }}>Starter 0€ · Pro 9€/mes</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.65, margin: "0 0 16px" }}>Vytváraj plány, priraď ich klientom, sleduj pokrok v reálnom čase. Tréner Pro pridáva prediktívnu analytiku, prioritnú frontu a navrhnuté akcie.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13, color: "rgba(255,255,255,.7)" }}>
              {["Tvorba stravovacích a tréningových plánov", "Správa neobmedzeného počtu klientov (Pro)", "Drop-off riziko a detekcia plató", "Strength tracking po cvikoch"].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: "rgba(167,139,250,.06)", border: "1px solid rgba(167,139,250,.2)", borderRadius: 20, padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(167,139,250,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏃</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Pre členov</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", margin: "4px 0 0" }}>S trénerom 0€ · AI 4.99€/mes</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.65, margin: "0 0 16px" }}>Loguj jedlo, tréningy, váhu a merania. S trénerom máš plán a feedback. Bez trénera ťa AI kouč hodnotí týždeň, počíta TDEE a odpovedá v chate 24/7.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13, color: "rgba(255,255,255,.7)" }}>
              {["Denník stravy, kalórie, makrá", "Tréningový denník a plány od trénera", "Váha, merania, progress fotky, grafy", "AI kouč (solo): týždenné hodnotenie + chat"].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ color: "#a78bfa", flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: "rgba(255,255,255,.02)", borderTop: "1px solid rgba(255,255,255,.06)", padding: "80px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontFamily: ff, fontSize: "clamp(26px,3vw,38px)", fontWeight: 700, letterSpacing: "-.02em", margin: 0 }}>Často kladené otázky</h2>
          </div>
          <div className="t1-faq-list">
            {[
              { q: "Je Progressio zadarmo?", a: "Áno. Člen s trénerom a Tréner Starter (až 3 členovia) sú navždy zadarmo. Platené sú len Člen AI (4.99€/mes) a Tréner Pro (9€/mes)." },
              { q: "Môžem použiť Progressio bez trénera?", a: "Áno. S plánom Člen AI dostaneš AI kouča — týždenné hodnotenie, výpočet TDEE a makier, chat 24/7 a predikciu cieľovej váhy za 4.99€/mesiac." },
              { q: "Ako tréner vidím, kto potrebuje pozornosť?", a: "Tréner Pro zobrazuje prioritnú frontu klientov podľa drop-off rizika, detekcie plató a vynechaných cvikov. Ku každému alertu systém navrhne konkrétnu akciu." },
              { q: "Dá sa zrušiť predplatné kedykoľvek?", a: "Áno. Člen AI aj Tréner Pro sú bez záväzkov — zrušíš kedykoľvek v nastaveniach. Žiadne skryté poplatky." },
            ].map((faq, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 22px" }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px" }}>{faq.q}</h4>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "rgba(34,197,94,.06)", borderTop: "1px solid rgba(34,197,94,.12)", padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: ff, fontSize: "clamp(28px,4vw,52px)", fontWeight: 400, letterSpacing: "-.02em", margin: "0 0 16px" }}>
          Začni ešte dnes.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.55)", margin: "0 auto 36px", maxWidth: 420, lineHeight: 1.6 }}>Registrácia zadarmo. Tréner Starter aj Člen sú bez poplatku navždy.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none" }}>
            Registrovať sa zadarmo
          </Link>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", padding: "13px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.06)", textDecoration: "none", border: "1px solid rgba(255,255,255,.1)" }}>
            Prihlásiť sa
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-.02em" }}>Progressio</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)", margin: 0 }}>© 2025 Progressio · Fitness platforma pre trénerov a členov</p>
      </footer>
    </div>
  );
}
