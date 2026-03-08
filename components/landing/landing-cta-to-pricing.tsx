"use client";

import { useRef, useEffect, useState } from "react";

function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

type LandingCtaToPricingProps = {
  title: string;
  subtitle?: string;
};

export function LandingCtaToPricing({ title, subtitle }: LandingCtaToPricingProps) {
  const { ref, visible } = useVisible(0.15);

  return (
    <div
      ref={ref}
      style={{
        padding: "56px 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "clamp(20px, 3vw, 26px)",
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            lineHeight: 1.3,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.6)",
              margin: 0,
              lineHeight: 1.5,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s",
            }}
          >
            {subtitle}
          </p>
        )}
        <a
          href="#pricing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "#22c55e",
            color: "#020d05",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.02em",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
          }}
        >
          Pozri cenník
        </a>
      </div>
    </div>
  );
}
