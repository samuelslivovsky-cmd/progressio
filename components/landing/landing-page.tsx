import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { HeroParallaxZone } from "@/components/landing/hero-parallax-zone";
import { LandingHamburgerNav } from "@/components/landing/landing-hamburger-nav";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingIntelligence } from "@/components/landing/landing-intelligence";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingReviews } from "@/components/landing/landing-reviews";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingCtaToPricing } from "@/components/landing/landing-cta-to-pricing";
import { LandingFooter } from "@/components/landing/landing-footer";

type LandingPageProps = {
  role?: "TRAINER" | "CLIENT" | null;
};

export function LandingPage({ role = null }: LandingPageProps) {
  const dashboardHref = role === "TRAINER" ? "/trainer" : "/client";

  return (
    <div className="landing-page-root" style={{ minHeight: "100vh", background: "#080c09" }}>
      {/* Header */}
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
        .landing-topbar-nav a:hover { color: #22c55e; }
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
          borderBottom: "1px solid rgba(34,197,94,0.08)",
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
            <Logo className="h-8 w-8" />
            <span
              style={{
                fontWeight: 800,
                fontSize: "18px",
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Progressio
            </span>
          </div>
          <nav className="landing-topbar-nav" aria-label="Sekcie">
            <a href="#uvod">Úvod</a>
            <a href="#statistiky">Štatistiky</a>
            <a href="#inteligencia">Inteligencia</a>
            <a href="#how-it-works">Ako to funguje</a>
            <a href="#features">Funkcie</a>
            <a href="#reviews">Recenzie</a>
            <a href="#pricing">Cenník</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="landing-hamburger-wrap">
              <LandingHamburgerNav />
            </div>
            {role ? (
              <Link href={dashboardHref} className={cn(buttonVariants(), "inline-flex")}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "inline-flex")}>
                  Prihlasiť sa
                </Link>
                <Link href="/register" className={cn(buttonVariants(), "inline-flex")}>
                  Registrovať sa
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — sticky parallax zone: cards → merge → client mockup → trainer mockup */}
      <section id="uvod" aria-label="Úvod">
        <HeroParallaxZone role={role} dashboardHref={dashboardHref} />
      </section>

      {/* Stats bar */}
      <section id="statistiky" aria-label="Štatistiky">
        <LandingStats />
      </section>

      {/* Intelligence / predictive analytics — key differentiator */}
      <section id="inteligencia" aria-label="Inteligencia">
        <LandingIntelligence />
      </section>
      <LandingCtaToPricing
        title="Pripravený na pokrok?"
        subtitle="Vyber si plán, ktorý ti sedí."
      />

      {/* How it works */}
      <section id="how-it-works" aria-label="Ako to funguje">
        <LandingHowItWorks />
      </section>
      <LandingCtaToPricing
        title="Začni jednoducho."
        subtitle="Pozri cenník a vyber si tarif za pár minút."
      />

      {/* Features */}
      <section id="features" aria-label="Funkcie">
        <LandingFeatures />
      </section>
      <LandingCtaToPricing
        title="Všetko v jednom."
        subtitle="Žiadne skryté poplatky. Pozri cenník."
      />

      {/* Reviews */}
      <section id="reviews" aria-label="Recenzie">
        <LandingReviews />
      </section>
      <LandingCtaToPricing
        title="Pripoj sa k nim."
        subtitle="Vyber si plán a začni ešte dnes."
      />

      {/* Pricing */}
      <section id="pricing" aria-label="Cenník">
        <LandingPricing />
      </section>

      {/* Final CTA */}
      <LandingCta role={role} dashboardHref={dashboardHref} />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
