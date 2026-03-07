import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./hero-background";

type LandingHeroProps = {
  role?: "TRAINER" | "CLIENT" | null;
  dashboardHref: string;
};

export function LandingHero({ role, dashboardHref }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground />
      {/* Subtle center overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" aria-hidden />
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Jedna platforma pre{" "}
            <span className="text-primary">trénerov</span> a{" "}
            <span className="text-primary">klientov</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Sleduj stravu, tréningy, váhu a pokrok na jednom mieste. Tréneri
            vytvárajú plány, klienti logujú a obe strany vidia výsledky.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {role ? (
              <Button size="lg" asChild>
                <Link href={dashboardHref} className="inline-flex items-center gap-2">
                  Prejsť do dashboardu
                  <ChevronRight className="size-4 shrink-0" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register" className="inline-flex items-center gap-2">
                    Začať zadarmo
                    <ChevronRight className="size-4 shrink-0" />
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
    </section>
  );
}
