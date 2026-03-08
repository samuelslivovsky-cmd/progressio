"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    window.navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Optional: check for updates
        reg.update();
      })
      .catch(() => {});
  }, []);
  return null;
}
