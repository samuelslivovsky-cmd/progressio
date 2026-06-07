"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePwaInstall } from "@/components/pwa-install-context";

const STORAGE_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

function getDismissedUntil(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

function setDismissed() {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(until));
  } catch {}
}

export function PwaInstallBanner() {
  const pwaInstall = usePwaInstall();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissedState] = useState(false);

  useEffect(() => {
    setMounted(true);
    const until = getDismissedUntil();
    if (until && Date.now() < until) setDismissedState(true);
  }, []);

  const handleDismiss = () => {
    setDismissedState(true);
    setDismissed();
  };

  const handleInstall = async () => {
    if (!pwaInstall?.canInstall) return;
    await pwaInstall.install();
  };

  if (!mounted || dismissed || !pwaInstall) return null;
  if (pwaInstall.isStandalone) return null;

  // Only show when the platform can install (Chrome/Edge) or on iOS Safari
  // (manual Add to Home Screen).
  const canInstall = pwaInstall.canInstall;
  if (!canInstall && !pwaInstall.isIos) return null;

  return (
    <div
      role="status"
      className={cn(
        "mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm",
        "animate-in fade-in slide-in-from-top-2 duration-300"
      )}
    >
      <Smartphone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">Máš Progressio vždy po ruke</p>
        <p className="mt-0.5 text-muted-foreground">
          {canInstall
            ? "Stlač Nainštaluj a aplikácia sa ti pridá na plochu s ikonou Progressio."
            : "V menu prehliadača (⋮ alebo Share) zvoľ „Pridať na plochu“ alebo „Add to Home Screen“."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {canInstall && (
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={pwaInstall.isInstalling}
            className="shrink-0"
            type="button"
          >
            {pwaInstall.isInstalling ? "Inštalujem…" : "Nainštaluj"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Zavrieť"
          onClick={handleDismiss}
          className="h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
