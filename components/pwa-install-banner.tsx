"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

type InstallPromptEvent = Event & { prompt: () => Promise<{ outcome: string }> };

export function PwaInstallBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installing, setInstalling] = useState(false);
  const installPromptRef = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const dismissedUntil = getDismissedUntil();
    if (dismissedUntil && Date.now() < dismissedUntil) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    );
    if (!isMobile) return;

    setVisible(true);

    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as InstallPromptEvent;
      installPromptRef.current = ev;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      installPromptRef.current = null;
    };
  }, [mounted]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed();
  };

  const handleInstall = async () => {
    const prompt = installPromptRef.current;
    if (!prompt?.prompt) return;
    setInstalling(true);
    try {
      const result = await prompt.prompt();
      if (result?.outcome === "accepted") setVisible(false);
    } catch {
      // User dismissed or error
    } finally {
      setInstalling(false);
    }
  };

  if (!mounted || !visible) return null;

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
            disabled={installing}
            className="shrink-0"
            type="button"
          >
            {installing ? "Inštalujem…" : "Nainštaluj"}
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
