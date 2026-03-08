"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewClientPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dayCount, setDayCount] = useState(3);

  const create = trpc.clientTrainingPlan.create.useMutation({
    onSuccess: (plan) => {
      toast.success("Plán vytvorený. Teraz pridaj dni a cvičenia.");
      router.push(`/client/workout/my-plans/${plan.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Zadaj názov plánu.");
      return;
    }
    create.mutate({ name: name.trim(), dayCount });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/client/workout/my-plans"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nový tréningový plán</h1>
          <p className="text-muted-foreground text-sm">
            Názov a počet dní. Cvičenia pridáš v ďalšom kroku.
          </p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Vytvoriť plán</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Názov plánu</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="napr. Push / Pull / Legs"
                disabled={create.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Počet dní</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={7}
                value={dayCount}
                onChange={(e) => setDayCount(Number(e.target.value) || 1)}
                disabled={create.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Prázdne dni môžeš pomenovať a doplniť cvičeniami neskôr.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Vytváram…" : "Vytvoriť plán"}
              </Button>
              <Link
                href="/client/workout/my-plans"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Zrušiť
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
