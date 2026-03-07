import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { HeroParallaxZone } from "@/components/landing/hero-parallax-zone";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingIntelligence } from "@/components/landing/landing-intelligence";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingReviews } from "@/components/landing/landing-reviews";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

type LandingPageProps = {
  role?: "TRAINER" | "CLIENT" | null;
};

export function LandingPage({ role = null }: LandingPageProps) {
  const dashboardHref = role === "TRAINER" ? "/trainer" : "/client";

  return (
    <div style={{ minHeight: "100vh", background: "#080c09" }}>
      {/* Header */}
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
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
          <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {role ? (
              <Button asChild>
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Prihlasiť sa</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrovať sa</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero — sticky parallax zone: cards → merge → client mockup → trainer mockup */}
      <HeroParallaxZone role={role} dashboardHref={dashboardHref} />

      {/* Stats bar */}
      <LandingStats />

      {/* Intelligence / predictive analytics — key differentiator */}
      <LandingIntelligence />

      {/* How it works */}
      <div id="how-it-works">
        <LandingHowItWorks />
      </div>

      {/* Features */}
      <div id="features">
        <LandingFeatures />
      </div>

      {/* Reviews */}
      <LandingReviews />

      {/* Pricing */}
      <div id="pricing">
        <LandingPricing />
      </div>

      {/* Final CTA */}
      <LandingCta role={role} dashboardHref={dashboardHref} />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
