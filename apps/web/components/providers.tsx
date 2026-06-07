"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import superjson from "superjson";
import { trpc } from "@/lib/trpc/client";
import type { AppRouter } from "@/server/routers";

// Single-flight silent refresh: share one in-flight refresh promise across all
// concurrent operations so we only hit /api/auth/refresh once.
let refreshing: Promise<boolean> | null = null;
const refreshOnce = (): Promise<boolean> =>
  (refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    }));

function isUnauthorized(err: unknown): boolean {
  return (
    err instanceof TRPCClientError &&
    (err as TRPCClientError<AppRouter>).data?.code === "UNAUTHORIZED"
  );
}

/**
 * On a tRPC UNAUTHORIZED error, attempt a one-time silent token refresh and
 * retry the operation once. If refresh fails, surface the original error and
 * redirect to /login.
 */
const refreshLink: TRPCLink<AppRouter> = () => {
  return ({ op, next }) => {
    return observable((observer) => {
      let retried = false;
      let current: ReturnType<ReturnType<typeof next>["subscribe"]> | null = null;

      const subscribe = () => {
        current = next(op).subscribe({
          next: (value) => observer.next(value),
          complete: () => observer.complete(),
          error: (err) => {
            if (retried || !isUnauthorized(err)) {
              observer.error(err);
              return;
            }
            retried = true;
            refreshOnce().then((ok) => {
              if (ok) {
                subscribe();
              } else {
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
                observer.error(err);
              }
            });
          },
        });
      };

      subscribe();
      return () => {
        current?.unsubscribe();
      };
    });
  };
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 300_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        refreshLink,
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
