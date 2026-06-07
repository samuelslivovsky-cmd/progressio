"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { HeroParallaxZone } from "@/components/landing/hero-parallax-zone";
import { LandingHamburgerNav } from "@/components/landing/landing-hamburger-nav";
import { LandingStatsStrip } from "@/components/landing/landing-stats-strip";
import { LandingIntelligence } from "@/components/landing/landing-intelligence";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingReviews } from "@/components/landing/landing-reviews";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingAudienceTabs } from "@/components/landing/landing-audience-tabs";
import { LandingFooter } from "@/components/landing/landing-footer";

type LandingPageProps = {
  role?: "TRAINER" | "CLIENT" | null;
};

export function LandingPage({ role = null }: LandingPageProps) {
  const dashboardHref = role === "TRAINER" ? "/trainer" : "/client";
  const [audience, setAudience] = useState<"trainer" | "member">("trainer");

  const accentHover = audience === "member" ? "#a78bfa" : "#22c55e";
  const accentBorder = audience === "member" ? "rgba(167,139,250,0.08)" : "rgba(34,197,94,0.08)";
  const topbarButtonBg = audience === "member" ? "#a78bfa" : "#22c55e";
  const topbarButtonColor = audience === "member" ? "#fff" : "#040e07";

  return (
    <div className="landing-page-root" data-audience={audience} style={{ minHeight: "100vh", background: "#080c09" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        .landing-topbar-nav { display: none; }
        .landing-hamburger-wrap { display: block; }
        @media (min-width: 1024px) {
          .landing-topbar-nav { display: flex; align-items: center; gap: 6px 20px; }
          .landing-hamburger-wrap { display: none; }
        }
        .landing-topbar-nav a {
          color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 500;
          white-space: nowrap; transition: color 0.2s;
        }
        .landing-topbar-nav a:hover { color: ${accentHover}; }
        @media (max-width: 767px) {
          .landing-header-inner { padding: 0 16px !important; }
          .landing-header-inner span { font-size: 16px !important; }
        }
      `}</style>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(8,12,9,0.88)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${accentBorder}`,
        }}
      >
        <div
          className="landing-header-inner"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Logo className="h-8 w-8" accent={audience === "member" ? "purple" : "green"} />
            <span style={{ fontWeight: 800, fontSize: "18px", color: accentHover, letterSpacing: "-0.02em" }}>
              Progressio
            </span>
          </div>
          <nav className="landing-topbar-nav" aria-label="Sekcie">
            <a href="#uvod">Úvod</a>
            <a href="#statistiky">Štatistiky</a>
            <a href="#inteligencia">Inteligencia</a>
            <a href="#how-it-works">Ako to funguje</a>
            <a href="#features">Funkcie</a>
            <a href="#pricing">Cenník</a>
            <a href="#reviews">Recenzie</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="landing-hamburger-wrap">
              <LandingHamburgerNav />
            </div>
            {role ? (
              <Link href={dashboardHref} className={cn(buttonVariants(), "inline-flex")} style={{ background: topbarButtonBg, color: topbarButtonColor, borderColor: "transparent" }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "inline-flex")}>
                  Prihlásiť sa
                </Link>
                <Link href="/register" className={cn(buttonVariants(), "inline-flex")} style={{ background: topbarButtonBg, color: topbarButtonColor, borderColor: "transparent" }}>
                  Registrovať sa
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — static, no storytelling; tabs Som tréner / Som člen, floating mockup by audience */}
      <HeroParallaxZone
        role={role}
        dashboardHref={dashboardHref}
        staticMode
        audience={audience}
        onAudienceChange={setAudience}
      />

      {/* Stats strip (from test2) */}
      <section id="statistiky" aria-label="Štatistiky">
        <LandingStatsStrip />
      </section>

      <LandingAudienceTabs audience={audience} onAudienceChange={setAudience} label="Prehliadaš obsah pre" />

      {/* Predikcia — iná pre trénera, iná pre člena */}
      <section id="inteligencia" aria-label="Inteligencia">
        <LandingIntelligence variant={audience} />
      </section>

      <LandingAudienceTabs audience={audience} onAudienceChange={setAudience} compact label="Tréner alebo člen?" />

      {/* Štyri kroky — iné pre trénera, iné pre člena */}

      <section id="how-it-works" aria-label="Ako to funguje">
        <LandingHowItWorks variant={audience} />
      </section>

      {/* Všetko na jednom mieste — iné pre trénera, iné pre člena (bento) */}
      <section id="features" aria-label="Funkcie">
        <LandingFeatures variant={audience} />
      </section>

      {/* Cenník (pôvodný landing) */}
      <section id="pricing" aria-label="Cenník">
        <LandingPricing />
      </section>

      {/* Testimonials */}
      <section id="reviews" aria-label="Recenzie">
        <LandingReviews variant={audience} />
      </section>

      {/* Finálna CTA */}
      <LandingCta role={role} dashboardHref={dashboardHref} variant={audience} />

      <LandingFooter variant={audience} />
    </div>
  );
}
