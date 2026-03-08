"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<{ outcome: string }> };

type PwaInstallContextValue = {
  /** True when Chrome/Edge/etc. offers native install prompt */
  canInstall: boolean;
  /** True on iOS Safari where user must manually "Add to Home Screen" */
  isIos: boolean;
  /** True when already running as installed PWA */
  isStandalone: boolean;
  isInstalling: boolean;
  install: () => Promise<void>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const promptRef = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    setIsIos(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as InstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setCanInstall(false);
      setIsStandalone(true);
      promptRef.current = null;
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      promptRef.current = null;
      setCanInstall(false);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt?.prompt) return;
    setIsInstalling(true);
    try {
      const result = await prompt.prompt();
      if (result.outcome === "accepted") {
        setCanInstall(false);
        promptRef.current = null;
      }
    } catch {
      // user dismissed or error
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const value: PwaInstallContextValue = {
    canInstall,
    isIos,
    isStandalone,
    isInstalling,
    install,
  };

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall(): PwaInstallContextValue | null {
  return useContext(PwaInstallContext);
}
