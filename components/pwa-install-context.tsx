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
  canInstall: boolean;
  isInstalling: boolean;
  install: () => Promise<void>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const promptRef = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as InstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      promptRef.current = null;
      setCanInstall(false);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt?.prompt) return;
    setIsInstalling(true);
    try {
      await prompt.prompt();
    } catch {
      // user dismissed or error
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const value: PwaInstallContextValue = {
    canInstall,
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
