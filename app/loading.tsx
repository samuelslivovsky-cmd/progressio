export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Modern spinning wheel — SVG gradient ring */}
        <div className="relative h-16 w-16" role="status" aria-label="Načítavam">
          <svg
            className="h-full w-full animate-spin"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animationDuration: "0.85s" }}
          >
            <defs>
              <linearGradient
                id="loading-wheel-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                <stop offset="70%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="var(--muted)"
              strokeWidth="4"
              strokeOpacity="0.25"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="url(#loading-wheel-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="120 44"
              fill="none"
              transform="rotate(-90 32 32)"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Načítavam…
        </p>
      </div>
    </div>
  );
}
