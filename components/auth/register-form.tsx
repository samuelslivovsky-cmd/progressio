"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
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

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Registrácia zlyhala.");
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, session is available immediately
    if (data.session) {
      await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      router.push(role === "TRAINER" ? "/trainer" : "/client");
    } else {
      // Email confirmation required — profile created in /auth/callback
      router.push("/login?registered=1");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrovať sa</CardTitle>
        <CardDescription>Vytvor si nový účet</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
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
            />
          </div>
          <div className="space-y-2">
            <Label>Typ účtu</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  role === "CLIENT"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-input"
                }`}
              >
                Klient
              </button>
              <button
                type="button"
                onClick={() => setRole("TRAINER")}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  role === "TRAINER"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-input"
                }`}
              >
                Tréner
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 mt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrujem..." : "Zaregistrovať sa"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Máš účet?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Prihlásiť sa
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
