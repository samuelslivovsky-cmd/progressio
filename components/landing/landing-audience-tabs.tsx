"use client";

type LandingAudienceTabsProps = {
  audience: "trainer" | "member";
  onAudienceChange: (a: "trainer" | "member") => void;
  /** Compact: smaller, less margin. Inline: optional label */
  compact?: boolean;
  label?: string;
};

const tabBase = {
  padding: "10px 22px",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  border: "none",
  transition: "background .2s, color .2s",
} as const;

export function LandingAudienceTabs({
  audience,
  onAudienceChange,
  compact = false,
  label,
}: LandingAudienceTabsProps) {
  const padding = compact ? "16px 0" : "24px 0";
  const gap = compact ? 8 : 10;
  const fontSize = compact ? 14 : 15;
  const pad = compact ? "8px 18px" : "10px 22px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap,
        padding,
      }}
      role="tablist"
      aria-label={label ?? "Prehliadaš obsah pre"}
    >
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: "inline-flex",
          gap,
          background: "rgba(255,255,255,.05)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 14,
          padding: 6,
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={audience === "trainer"}
          onClick={() => onAudienceChange("trainer")}
          style={{
            ...tabBase,
            padding: pad,
            fontSize,
            background: audience === "trainer" ? "#22c55e" : "rgba(255,255,255,.06)",
            color: audience === "trainer" ? "#040e07" : "rgba(255,255,255,.55)",
          }}
        >
          Som tréner
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={audience === "member"}
          onClick={() => onAudienceChange("member")}
          style={{
            ...tabBase,
            padding: pad,
            fontSize,
            background: audience === "member" ? "#a78bfa" : "rgba(255,255,255,.06)",
            color: audience === "member" ? "#fff" : "rgba(255,255,255,.55)",
          }}
        >
          Som člen
        </button>
      </div>
    </div>
  );
}
