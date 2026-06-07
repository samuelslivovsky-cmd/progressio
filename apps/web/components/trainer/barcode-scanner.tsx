"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerIdRef = useRef("barcode-reader-" + Math.random().toString(36).slice(2));
  const containerId = containerIdRef.current;

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        const html5Qr = new Html5Qrcode(containerId);
        await html5Qr.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            if (!mounted) return;
            html5Qr.stop().catch(() => {});
            onScan(decodedText);
          },
          () => {}
        );
        if (mounted) {
          scannerRef.current = html5Qr;
          setHasPermission(true);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Nepodarilo sa spustiť kameru");
          setHasPermission(false);
        }
      }
    }
    start();
    return () => {
      mounted = false;
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current?.clear();
      scannerRef.current = null;
    };
  }, [onScan]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Skenovať čiarový kód</span>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {hasPermission !== false && (
        <div
          id={containerId}
          className="rounded-lg overflow-hidden bg-black min-h-[200px] w-full"
        />
      )}
    </div>
  );
}
