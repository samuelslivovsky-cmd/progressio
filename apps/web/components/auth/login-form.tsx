"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Nesprávny email alebo heslo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Prihlás sa do účtu</h1>
        <p className="text-sm text-muted-foreground">
          Vitaj späť! Zadaj svoje údaje.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Heslo</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 shadow-sm"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-10 rounded-lg"
          disabled={loading}
        >
          {loading ? "Prihlasujem..." : "Prihlásiť sa"}
        </Button>
      </form>

      {/* Dashed divider - Aceternity style */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-dashed border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
          <span className="bg-background px-2">alebo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg border border-input bg-background shadow-sm ring-offset-background hover:bg-muted/50 hover:ring-2 hover:ring-ring/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg border border-input bg-background shadow-sm ring-offset-background hover:bg-muted/50 hover:ring-2 hover:ring-ring/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled
        >
          Apple
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Nemáš účet?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Registrovať sa
        </Link>
      </p>
    </div>
  );
}
