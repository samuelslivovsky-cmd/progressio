"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

function useVisible(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

type LandingCtaProps = {
  role?: "TRAINER" | "CLIENT" | null;
  dashboardHref: string;
};

export function LandingCta({ role, dashboardHref }: LandingCtaProps) {
  const { ref, visible } = useVisible(0.2);

  return (
    <div
      style={{
        background: "transparent",
        padding: "100px 0 120px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "300px",
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: "20px",
            padding: "5px 14px",
            marginBottom: "28px",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0s",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.7)",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#4ade80",
              letterSpacing: "0.06em",
            }}
          >
            Pripravený začať?
          </span>
        </div>

        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 58px)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          {role ? "Pokračuj v práci" : "Sprav prvý krok"}
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.65,
            marginBottom: "44px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
          }}
        >
          {role
            ? "Pokračuj do svojho dashboardu a pokračuj v práci."
            : "Zaregistruj sa ako tréner alebo klient. Bezplatne, bez kreditnej karty, do 2 minút."}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
          }}
        >
          {role ? (
            <Link
              href={dashboardHref}
              style={{
                display: "inline-block",
                padding: "15px 36px",
                background: "#22c55e",
                color: "#020d05",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                style={{
                  display: "inline-block",
                  padding: "15px 36px",
                  background: "#22c55e",
                  color: "#020d05",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                Vytvoriť účet zadarmo
              </Link>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "15px 36px",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Prihlásiť sa
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
