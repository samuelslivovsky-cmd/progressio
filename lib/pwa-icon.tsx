import { ImageResponse } from "next/og";

/** Renders the Progressio app icon at the given size (for PWA manifest). */
export function createPwaIconResponse(size: number) {
  const s = size / 32;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c09",
          borderRadius: Math.round(6 * s),
        }}
      >
        <div
          style={{
            position: "absolute",
            width: Math.round(28 * s),
            height: Math.round(28 * s),
            borderRadius: "50%",
            border: `${Math.max(1, Math.round(2 * s))}px solid #e5e7eb`,
            background: "#080c09",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 16 * s,
            height: 16 * s,
            borderTop: `${Math.max(1, Math.round(2 * s))}px solid #22c55e`,
            borderRight: `${Math.max(1, Math.round(2 * s))}px solid #22c55e`,
            borderTopRightRadius: 16 * s,
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 6 * s,
            left: "50%",
            width: Math.max(1, Math.round(2 * s)),
            height: 10 * s,
            background: "#22c55e",
            transform: `translateX(-50%) translateY(-${2 * s}px) rotate(-38deg)`,
            transformOrigin: "center bottom",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 6 * s,
            left: "50%",
            width: Math.max(1, Math.round(2 * s)),
            height: 10 * s,
            background: "#22c55e",
            transform: `translateX(-50%) translateY(-${2 * s}px) rotate(38deg)`,
            transformOrigin: "center bottom",
          }}
        />
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=604800, immutable",
      },
    }
  );
}
