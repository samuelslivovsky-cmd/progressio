import { cn } from "@/lib/utils";

const gradientId = "progressioLogoGradient";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size }: LogoProps) {
  return (
    <svg
      {...(size != null ? { width: size, height: size } : {})}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <circle
        cx="64"
        cy="64"
        r="54"
        stroke="#e5e7eb"
        strokeWidth={12}
        fill="none"
      />
      <path
        d="M64 10 a54 54 0 0 1 54 54"
        stroke={`url(#${gradientId})`}
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M48 74 L64 54 L80 74"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
