"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const CSS = `
  @keyframes t2-fade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes t2-marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes t2-glow { 0%,100%{opacity:.6} 50%{opacity:1} }

  .t2-a1{animation:t2-fade .6s ease both}
  .t2-a2{animation:t2-fade .6s .1s ease both}
  .t2-a3{animation:t2-fade .6s .2s ease both}
  .t2-a4{animation:t2-fade .6s .3s ease both}

  .t2-tab{padding:10px 22px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;border:none;transition:background .2s,color .2s,transform .15s}
  .t2-tab:hover{transform:translateY(-1px)}
  .t2-tab-active-trainer{background:#22c55e;color:#040e07}
  .t2-tab-active-client{background:#a78bfa;color:#fff}
  .t2-tab-inactive{background:rgba(255,255,255,.06);color:rgba(255,255,255,.55)}

  .t2-feat-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;transition:border-color .2s,transform .2s}
  .t2-feat-card:hover{border-color:rgba(255,255,255,.15);transform:translateY(-2px)}

  .t2-plan{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:32px 28px;transition:transform .2s,border-color .2s}
  .t2-plan:hover{transform:translateY(-3px)}
  .t2-plan-green{background:linear-gradient(145deg,rgba(34,197,94,.1),rgba(34,197,94,.04));border-color:rgba(34,197,94,.3)}
  .t2-plan-purple{background:linear-gradient(145deg,rgba(167,139,250,.1),rgba(167,139,250,.04));border-color:rgba(167,139,250,.28)}

  .t2-marquee-track{display:flex;width:max-content;animation:t2-marquee 32s linear infinite}
  .t2-marquee-track:hover{animation-play-state:paused}

  /* nav */
  .t2-nav{display:none}
  @media(min-width:1024px){.t2-nav{display:flex}}

  /* hero */
  @media(max-width:767px){
    .t2-hero{padding:52px 20px 60px!important}
    .t2-hero h1{font-size:40px!important;line-height:1.08!important}
    .t2-hero-tabs{flex-direction:row;gap:8px!important}
    .t2-tab{font-size:13px!important;padding:9px 18px!important}
  }

  /* features grid */
  .t2-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  @media(max-width:767px){.t2-feat-grid{grid-template-columns:1fr!important}}
  @media(min-width:768px)and(max-width:1023px){.t2-feat-grid{grid-template-columns:repeat(2,1fr)!important}}

  /* numbers */
  .t2-num-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06)}
  @media(max-width:767px){.t2-num-grid{grid-template-columns:repeat(2,1fr)!important}}

  /* pricing */
  .t2-price-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:740px;margin:0 auto}
  @media(max-width:767px){.t2-price-grid{grid-template-columns:1fr!important}}

  /* intelligence */
  .t2-intel-inner{display:flex;gap:60px;align-items:center}
  @media(max-width:767px){.t2-intel-inner{flex-direction:column!important;gap:40px!important}}

  /* how it works */
  .t2-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  @media(max-width:767px){.t2-steps{grid-template-columns:1fr!important}}
  @media(min-width:768px)and(max-width:1023px){.t2-steps{grid-template-columns:repeat(2,1fr)!important}}

  /* faq */
  .t2-faq-list{display:flex;flex-direction:column;gap:12px}

  /* preco */
  @media(max-width:767px){.t2-preco-grid{grid-template-columns:1fr!important}}
  @media(min-width:768px)and(max-width:1023px){.t2-preco-grid{grid-template-columns:repeat(2,1fr)!important}}
`;

type Role = "trainer" | "client";

const TRAINER_DATA = {
  badge: "Pre trénerov",
  badgeColor: "#22c55e",
  badgeBg: "rgba(34,197,94,.1)",
  badgeBorder: "rgba(34,197,94,.22)",
  headline: ["Spravuj klientov.", "Vidíš každý pokrok."],
  sub: "Vytváraj plány, sleduj klientov v reálnom čase a nechaj AI upozorniť ťa na každý problém skôr, než nastane.",
  cta: { label: "Začni ako tréner — zadarmo", href: "/register", color: "#040e07", bg: "#22c55e" },
  ctaSecondary: { label: "Pozri cenník", href: "#ceny" },
  features: [
    { icon: "📋", title: "Tvorba plánov", desc: "Stravovací aj tréningový plán — vytvoríš raz, priradiš viacerým klientom." },
    { icon: "👥", title: "Správa klientov", desc: "Všetci klienti na jednom mieste. Aktivita, váha, pokrok v reálnom čase." },
    { icon: "🧠", title: "Prediktívna analytika", desc: "Drop-off skóre, plató detekcia, vynechané cviky — Tréner Pro." },
    { icon: "🔔", title: "Prioritná fronta", desc: "Klienti zoradení podľa naliehavosti, nie abecedne." },
    { icon: "📈", title: "Strength tracking", desc: "Sila klienta na každý cvik — zlepšuje sa, stagnuje, klesá?" },
    { icon: "💬", title: "Navrhnuté akcie", desc: "Systém navrhne konkrétny krok ku každému alertu. Ty len potvrdíš." },
    { icon: "📊", title: "Grafy a trendy", desc: "Váha, merania, kalórie — prehľadné grafy pre každého klienta na jednom mieste." },
    { icon: "📧", title: "Pozvánky klientov", desc: "Pošli odkaz, klient sa zaregistruje a automaticky sa ti priradí." },
  ],
  hint: "Tréner Starter: 0€ · 3 klienti · Tréner Pro: 9€/mes · neobmedzene",
};

const CLIENT_DATA = {
  badge: "Pre členov",
  badgeColor: "#a78bfa",
  badgeBg: "rgba(167,139,250,.1)",
  badgeBorder: "rgba(167,139,250,.22)",
  headline: ["Loguj, sleduj,", "dosahuj ciele."],
  sub: "Zaznamenávaj jedlo, tréningy a váhu každý deň. S trénerom alebo s AI koučom — výber je tvoj.",
  cta: { label: "Začni ako člen — zadarmo", href: "/register", color: "#fff", bg: "#a78bfa" },
  ctaSecondary: { label: "Pozri cenník", href: "#ceny" },
  features: [
    { icon: "🥗", title: "Denník stravy", desc: "Jedlo, kalórie, makrá, voda. Jednoduché logovanie každý deň." },
    { icon: "🏋️", title: "Tréningový denník", desc: "Cviky, série, záťaž. Vidíš progres cvik po cviku v čase." },
    { icon: "⚖️", title: "Váha & merania", desc: "Každodenný log váhy, obvody, grafy — trend a predikcia cieľa." },
    { icon: "📸", title: "Progress fotky", desc: "Chronologické fotky, porovnáš začiatok a dnes jedným pohľadom." },
    { icon: "🤖", title: "AI Kouč (4.99€)", desc: "Bez trénera? AI hodnotí týždeň, počíta TDEE, odpovedá na chat 24/7." },
    { icon: "🎯", title: "Predikcia cieľa", desc: "Lineárna regresia z váženia → odhadovaný dátum dosiahnutia cieľovej váhy." },
    { icon: "📱", title: "PWA v mobile", desc: "Aplikácia funguje v prehliadači aj ako inštalovateľná PWA. Loguj kdekoľvek." },
    { icon: "🔒", title: "Súkromie a dáta", desc: "Tvoje dáta sú tvoje. Žiadny predaj tretím stranám. Export kedykoľvek." },
  ],
  hint: "Člen s trénerom: 0€ navždy · Člen AI (solo): 4.99€/mes",
};

export default function Test2Page() {
  const [role, setRole] = useState<Role>("trainer");
  const data = role === "trainer" ? TRAINER_DATA : CLIENT_DATA;
  const accentColor = role === "trainer" ? "#22c55e" : "#a78bfa";
  const accentDim = role === "trainer" ? "rgba(34,197,94,.1)" : "rgba(167,139,250,.1)";
  const ff = font.style.fontFamily;

  return (
    <div className={font.className} style={{ background: "#060a07", minHeight: "100vh", color: "#fff", fontFamily: ff }}>
      <style>{CSS}</style>

      {/* ── NAVBAR ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(6,10,7,.94)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="rgba(34,197,94,.5)" strokeWidth="1.5" />
              <path d="M10 16l3.5 3.5L22 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: ff, fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>Progressio</span>
          </div>
          <nav className="t2-nav" style={{ alignItems: "center", gap: 24 }}>
            {[["#funkcie", "Funkcie"], ["#ako", "Ako to funguje"], ["#inteligencia", "Inteligencia"], ["#ceny", "Ceny"], ["#recenzie", "Recenzie"], ["#faq", "FAQ"]].map(([h, l]) => (
              <a key={h} href={h} style={{ fontSize: 13, color: "rgba(255,255,255,.55)", textDecoration: "none", fontWeight: 500, letterSpacing: "-.01em" }}>{l}</a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", textDecoration: "none", padding: "7px 14px" }}>Prihlásiť</Link>
            <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none", padding: "7px 16px", borderRadius: 8 }}>Registrovať sa</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="t2-hero" style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 24px 72px", textAlign: "center" }}>
        {/* Role tabs */}
        <div className="t2-a1 t2-hero-tabs" style={{ display: "inline-flex", gap: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 6, marginBottom: 44 }}>
          <button className={`t2-tab ${role === "trainer" ? "t2-tab-active-trainer" : "t2-tab-inactive"}`} onClick={() => setRole("trainer")} style={{ fontFamily: ff }}>
            Som tréner
          </button>
          <button className={`t2-tab ${role === "client" ? "t2-tab-active-client" : "t2-tab-inactive"}`} onClick={() => setRole("client")} style={{ fontFamily: ff }}>
            Som člen
          </button>
        </div>

        {/* Badge */}
        <div className="t2-a2" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: data.badgeBg, border: `1px solid ${data.badgeBorder}`, borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: data.badgeColor, letterSpacing: ".05em", textTransform: "uppercase" }}>
            {data.badge}
          </span>
        </div>

        {/* Headline */}
        <h1 className="t2-a3" style={{ fontFamily: ff, fontSize: "clamp(44px,8vw,76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.035em", margin: "0 0 22px" }}>
          {data.headline[0]}<br />
          <span style={{ color: accentColor }}>{data.headline[1]}</span>
        </h1>

        {/* Sub */}
        <p className="t2-a4" style={{ fontSize: "clamp(15px,2vw,18px)", color: "rgba(255,255,255,.58)", lineHeight: 1.65, margin: "0 auto 36px", maxWidth: 580 }}>
          {data.sub}
        </p>

        {/* CTAs */}
        <div className="t2-a4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <Link href={data.cta.href} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 12, fontSize: 15, fontFamily: ff, fontWeight: 700, color: data.cta.color, background: data.cta.bg, textDecoration: "none", boxShadow: `0 4px 24px ${accentColor}33` }}>
            {data.cta.label}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <a href={data.ctaSecondary.href} style={{ display: "inline-flex", alignItems: "center", padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.06)", textDecoration: "none", border: "1px solid rgba(255,255,255,.1)" }}>
            {data.ctaSecondary.label}
          </a>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", margin: 0 }}>{data.hint}</p>
      </section>

      {/* ── NUMBERS STRIP ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div className="t2-num-grid" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {[{ n: "100+", l: "aktívnych trénerov" }, { n: "500+", l: "členov na platforme" }, { n: "0€", l: "základný plán navždy" }, { n: "4.9★", l: "priemerné hodnotenie" }].map(item => (
            <div key={item.l} style={{ background: "#060a07", padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: ff, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-.04em", color: "#fff" }}>{item.n}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 4, fontWeight: 500 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="funkcie" style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Funkcie</div>
            <h2 style={{ fontFamily: ff, fontSize: "clamp(26px,3vw,40px)", fontWeight: 800, letterSpacing: "-.03em", margin: 0 }}>
              {role === "trainer" ? "Nástroje pre trénerov" : "Nástroje pre členov"}
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`t2-tab ${role === "trainer" ? "t2-tab-active-trainer" : "t2-tab-inactive"}`} onClick={() => setRole("trainer")} style={{ fontFamily: ff, fontSize: 12 }}>Tréner</button>
            <button className={`t2-tab ${role === "client" ? "t2-tab-active-client" : "t2-tab-inactive"}`} onClick={() => setRole("client")} style={{ fontFamily: ff, fontSize: 12 }}>Člen</button>
          </div>
        </div>

        <div className="t2-feat-grid">
          {data.features.map((f, i) => (
            <div key={f.title} className="t2-feat-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: ff, fontSize: 17, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.52)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="ako" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>Ako to funguje</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(26px,3vw,40px)", fontWeight: 800, letterSpacing: "-.03em", margin: 0 }}>
            Štyri kroky k výsledkom
          </h2>
        </div>
        <div className="t2-steps">
          {[
            { num: "1", title: "Registrácia", desc: "Zaregistruj sa ako tréner alebo člen. Zadarmo, bez kreditnej karty." },
            { num: "2", title: "Plán", desc: "Tréner vytvorí plány a priradí ich. Člen AI dostane TDEE a makrá od systému." },
            { num: "3", title: "Denné logovanie", desc: "Jedlo, tréningy, váha, merania — všetko v jednej aplikácii." },
            { num: "4", title: "Pokrok a akcie", desc: "Tréner vidí všetko v reále. AI hodnotí týždeň a odpovedá na otázky." },
          ].map(s => (
            <div key={s.num} className="t2-feat-card" style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: accentDim, color: accentColor, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{s.num}</div>
              <h3 style={{ fontFamily: ff, fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.52)", lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTELLIGENCE ── */}
      <section id="inteligencia" style={{ background: "rgba(34,197,94,.04)", borderTop: "1px solid rgba(34,197,94,.09)", borderBottom: "1px solid rgba(34,197,94,.09)", padding: "80px 24px" }}>
        <div className="t2-intel-inner" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ flex: "1 1 360px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>Tréner Pro · Prediktívna analytika</div>
            <h2 style={{ fontFamily: ff, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.12, margin: "0 0 16px" }}>
              Upozorní ťa,<br />kým je ešte čas.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.58)", lineHeight: 1.65, margin: "0 0 28px" }}>
              7 algoritmov monitoruje všetkých klientov automaticky. Vidíš len to, čo si vyžaduje tvoju pozornosť — s konkrétnym návrhom akcie.
            </p>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, fontSize: 14, fontFamily: ff, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none" }}>
              Vyskúšať Tréner Pro — 9€/mes
            </Link>
          </div>

          <div style={{ flex: "1 1 380px" }}>
            {/* Alert feed */}
            <div style={{ background: "rgba(8,12,9,.8)", border: "1px solid rgba(34,197,94,.15)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "t2-glow 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: ".06em", textTransform: "uppercase" }}>Live · Prioritná fronta</span>
              </div>
              <div style={{ padding: "8px 0" }}>
                {[
                  { icon: "🔴", client: "Tomáš B.", alert: "Neaktívny 5 dní", action: "Poslať správu", score: 81 },
                  { icon: "🟡", client: "Adam K.", alert: "Plató váhy 3 týždne", action: "Znížiť kalórie", score: 58 },
                  { icon: "🟡", client: "Lucia M.", alert: "Vynecháva drepy 4×", action: "Nahradiť cvik", score: 44 },
                  { icon: "🟢", client: "Mária S.", alert: "Výborne! Adherencia 94%", action: "", score: 12 },
                ].map(a => (
                  <div key={a.client} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{a.client}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.alert}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {a.action && <div style={{ fontSize: 11, fontWeight: 600, color: "#4ade80" }}>{a.action}</div>}
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 2 }}>skóre {a.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="ceny" style={{ maxWidth: "1100px", margin: "0 auto", padding: "96px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Cenník</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-.035em", margin: "0 0 14px" }}>
            Transparentné ceny
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", margin: 0 }}>S trénerom je Progressio zadarmo. Solo? AI kouč za 4.99€/mes.</p>
        </div>

        {/* CLIENT PLANS */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16, paddingLeft: 4 }}>Členovia</div>
          <div className="t2-price-grid">
            {[
              { name: "Člen", price: "0", period: "navždy", desc: "Pre členov s trénerom", features: ["Denník stravy, kalórie, makrá", "Tréningový denník a pokrok", "Váha, merania, grafy", "Progress fotky", "Plán od trénera"], cta: "Registrovať sa", variant: "default" },
              { name: "Člen AI", price: "4.99", period: "mesiac", desc: "Solo bez trénera", features: ["Všetko z plánu Člen", "Týždenné AI hodnotenie", "TDEE + makrá výpočet", "AI chat kouč 24/7", "Predikcia dosiahnutia cieľa"], cta: "Vyskúšať AI", variant: "purple" },
            ].map(plan => (
              <div key={plan.name} className={`t2-plan ${plan.variant === "purple" ? "t2-plan-purple" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: ff, fontSize: 12, fontWeight: 700, color: plan.variant === "purple" ? "#c4b5fd" : "rgba(255,255,255,.5)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6 }}>{plan.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                      <span style={{ fontFamily: ff, fontSize: 40, fontWeight: 800, letterSpacing: "-.04em" }}>{plan.price}</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>€ / {plan.period}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: "0 0 20px" }}>{plan.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(255,255,255,.68)" }}>
                      <span style={{ color: plan.variant === "purple" ? "#a78bfa" : "#22c55e", flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" style={{ display: "block", padding: "11px 0", borderRadius: 10, fontFamily: ff, fontSize: 14, fontWeight: 700, textAlign: "center", textDecoration: "none", background: plan.variant === "purple" ? "#a78bfa" : "rgba(255,255,255,.08)", color: plan.variant === "purple" ? "#fff" : "rgba(255,255,255,.75)", border: plan.variant === "default" ? "1px solid rgba(255,255,255,.1)" : "none" }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* TRAINER PLANS */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16, paddingLeft: 4 }}>Tréneri</div>
          <div className="t2-price-grid">
            {[
              { name: "Tréner Starter", price: "0", period: "navždy", desc: "Až 3 klienti", features: ["Tvorba stravovacích plánov", "Tvorba tréningových plánov", "Pokrok klientov v reálnom čase", "Email podpora"], cta: "Začať zadarmo", variant: "default" },
              { name: "Tréner Pro", price: "9", period: "mesiac", desc: "Neobmedzení klienti + inteligencia", features: ["Neobmedzený počet klientov", "Drop-off riziko skóre (0–100)", "Detekcia plató a vynechaných cvikov", "Prioritná fronta klientov", "Navrhnuté akcie pre trénera", "Prioritná podpora"], cta: "Vybrať Pro", variant: "green" },
            ].map(plan => (
              <div key={plan.name} className={`t2-plan ${plan.variant === "green" ? "t2-plan-green" : ""}`}>
                {plan.variant === "green" && (
                  <div style={{ fontFamily: ff, fontSize: 10, fontWeight: 700, color: "#040e07", background: "#22c55e", display: "inline-block", padding: "3px 10px", borderRadius: 100, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 14 }}>Odporúčané</div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: ff, fontSize: 12, fontWeight: 700, color: plan.variant === "green" ? "#4ade80" : "rgba(255,255,255,.5)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6 }}>{plan.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                      <span style={{ fontFamily: ff, fontSize: 40, fontWeight: 800, letterSpacing: "-.04em" }}>{plan.price}</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>€ / {plan.period}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: "0 0 20px" }}>{plan.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(255,255,255,.68)" }}>
                      <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" style={{ display: "block", padding: "11px 0", borderRadius: 10, fontFamily: ff, fontSize: 14, fontWeight: 700, textAlign: "center", textDecoration: "none", background: plan.variant === "green" ? "#22c55e" : "rgba(255,255,255,.08)", color: plan.variant === "green" ? "#040e07" : "rgba(255,255,255,.75)", border: plan.variant === "default" ? "1px solid rgba(255,255,255,.1)" : "none" }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.28)" }}>Člen AI a Tréner Pro bez záväzkov — zruš kedykoľvek.</p>
      </section>

      {/* ── REVIEWS MARQUEE ── */}
      <section id="recenzie" style={{ borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)", padding: "48px 0", overflow: "hidden" }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".14em", textTransform: "uppercase" }}>Referencie</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, letterSpacing: "-.03em", margin: "12px 0 0" }}>Čo hovoria tréneri a členovia</h2>
        </div>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)" }}>
          <div className="t2-marquee-track">
            {[...Array(2)].map((_, pass) =>
              [
                { text: "Konečne jeden systém. Nemusím riešiť tabuľky ani WhatsApp.", author: "Peter K.", role: "Tréner", months: "6 mesiacov" },
                { text: "Logujem jedlo a tréningy každý deň. Tréner vidí môj pokrok.", author: "Mária S.", role: "Členka", months: "4 mesiace" },
                { text: "15 klientov, všetko na jednom mieste. Šetrí hodiny týždenne.", author: "Jakub V.", role: "Tréner", months: "8 mesiacov" },
                { text: "Progress fotky a grafy ma motivujú. Tréner komentuje priamo v apke.", author: "Lucia M.", role: "Členka", months: "3 mesiace" },
                { text: "AI kouč mi zostavil TDEE a makrá. Prvý mesiac: -3,2 kg.", author: "Michal R.", role: "Člen AI", months: "2 mesiace" },
                { text: "Prioritná fronta je presne to, čo som potreboval. Vidím, kto má problém.", author: "Andrea T.", role: "Trénerka", months: "5 mesiacov" },
                { text: "Bez trénera som si nevedel predstaviť štruktúru. AI mi dáva týždenný feedback.", author: "Ján M.", role: "Člen AI", months: "1 mesiac" },
              ].map((r, i) => (
                <div key={`${pass}-${i}`} style={{ display: "inline-flex", flexDirection: "column", gap: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px 24px", marginRight: 16, minWidth: 280, maxWidth: 320, verticalAlign: "top" }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)", lineHeight: 1.6, margin: 0, flex: 1 }}>&ldquo;{r.text}&rdquo;</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.author}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{r.role}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.14)", borderRadius: 100, padding: "3px 9px" }}>{r.months}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>FAQ</div>
          <h2 style={{ fontFamily: ff, fontSize: "clamp(26px,3vw,38px)", fontWeight: 800, letterSpacing: "-.03em", margin: 0 }}>Často kladené otázky</h2>
        </div>
        <div className="t2-faq-list" style={{ maxWidth: 680, margin: "0 auto" }}>
          {[
            { q: "Je Progressio naozaj zadarmo?", a: "Áno. Člen s trénerom a Tréner Starter (až 3 členovia) sú navždy zadarmo. Platené sú len Člen AI (4.99€/mes) a Tréner Pro (9€/mes)." },
            { q: "Môžem byť člen bez trénera?", a: "Áno. S plánom Člen AI dostaneš AI kouča — týždenné hodnotenie, TDEE, makrá, chat 24/7 a predikciu cieľovej váhy za 4.99€/mesiac." },
            { q: "Čo je Tréner Pro?", a: "Predplatné pre trénerov s neobmedzeným počtom klientov, prediktívnou analytikou, prioritnou frontou a navrhovanými akciami. 9€/mesiac." },
            { q: "Dá sa zrušiť kedykoľvek?", a: "Áno. Člen AI aj Tréner Pro sú bez záväzkov. Zrušenie v nastaveniach, žiadne skryté poplatky." },
          ].map((faq, i) => (
            <div key={i} className="t2-feat-card" style={{ padding: "20px 24px" }}>
              <h4 style={{ fontFamily: ff, fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>{faq.q}</h4>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PREČO PROGRESSIO ── */}
      <section style={{ background: "rgba(255,255,255,.02)", borderTop: "1px solid rgba(255,255,255,.05)", padding: "72px 24px" }}>
        <div className="t2-preco-grid" style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {[
            { title: "Všetko na jednom mieste", desc: "Plány, logovanie, váha, fotky, analytika — žiadny Excel, žiadny WhatsApp. Jedna platforma pre trénera i člena." },
            { title: "Prediktívna inteligencia", desc: "Systém upozorní na drop-off riziko, plató a vynechané cviky skôr, než člen odíde. Tréner Pro a AI kouč v akcii." },
            { title: "Transparentné ceny", desc: "S trénerom je člen zadarmo navždy. Solo člen = AI za 4.99€/mes. Tréner do 3 klientov = 0€. Jednoduché." },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{["📦", "🧠", "💳"][i]}</div>
              <h3 style={{ fontFamily: ff, fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.52)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: ff, fontSize: "clamp(30px,5vw,56px)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.06, margin: "0 0 18px" }}>
          Pripravený<br />na pokrok?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.52)", lineHeight: 1.65, margin: "0 auto 38px", maxWidth: 460 }}>
          Registrácia zadarmo. Tréner Starter a Člen sú bezplatné navždy. Žiadna kreditná karta.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 12, fontSize: 16, fontFamily: ff, fontWeight: 700, color: "#040e07", background: "#22c55e", textDecoration: "none", boxShadow: "0 4px 32px rgba(34,197,94,.28)" }}>
            Registrovať sa zadarmo
          </Link>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.65)", background: "rgba(255,255,255,.06)", textDecoration: "none", border: "1px solid rgba(255,255,255,.1)" }}>
            Prihlásiť sa
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="rgba(34,197,94,.4)" strokeWidth="1.5" />
            <path d="M10 16l3.5 3.5L22 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: ff, fontWeight: 800, fontSize: 13, letterSpacing: "-.02em" }}>Progressio</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.22)", margin: 0 }}>© 2025 Progressio · Fitness platforma pre trénerov a členov</p>
      </footer>
    </div>
  );
}
