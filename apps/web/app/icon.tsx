import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          borderRadius: 6,
        }}
      >
        {/* Gray circle */}
        <div
          style={{
            position: "absolute",
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid #e5e7eb",
            background: "#080c09",
            boxSizing: "border-box",
          }}
        />
        {/* Green arc (top-right quarter) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 16,
            height: 16,
            borderTop: "2px solid #22c55e",
            borderRight: "2px solid #22c55e",
            borderTopRightRadius: 16,
            boxSizing: "border-box",
          }}
        />
        {/* V shape - two segments */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            width: 2,
            height: 10,
            background: "#22c55e",
            transform: "translateX(-1px) translateY(-2px) rotate(-38deg)",
            transformOrigin: "center bottom",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            width: 2,
            height: 10,
            background: "#22c55e",
            transform: "translateX(-1px) translateY(-2px) rotate(38deg)",
            transformOrigin: "center bottom",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
