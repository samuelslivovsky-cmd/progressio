"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TRAINER" | "CLIENT">("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await registerAction({ name, email, password, role });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, signIn in the server action handles the redirect
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Vytvor si účet</h1>
        <p className="text-sm text-muted-foreground">
          Zadaj svoje údaje a začni s Progressio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Meno</Label>
          <Input
            id="name"
            placeholder="Ján Novák"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10 shadow-sm"
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Typ účtu</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`h-10 rounded-lg border text-sm font-medium transition-colors shadow-sm ${
                role === "CLIENT"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input bg-background hover:bg-muted/50 hover:ring-2 hover:ring-ring/20"
              }`}
            >
              Klient
            </button>
            <button
              type="button"
              onClick={() => setRole("TRAINER")}
              className={`h-10 rounded-lg border text-sm font-medium transition-colors shadow-sm ${
                role === "TRAINER"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input bg-background hover:bg-muted/50 hover:ring-2 hover:ring-ring/20"
              }`}
            >
              Tréner
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-10 rounded-lg"
          disabled={loading}
        >
          {loading ? "Registrujem..." : "Zaregistrovať sa"}
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
        Už máš účet?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Prihlásiť sa
        </Link>
      </p>
    </div>
  );
}
