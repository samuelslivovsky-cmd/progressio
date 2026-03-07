"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Pencil } from "lucide-react";

interface MealPlanHeaderProps {
  id: string;
  name: string;
  description: string | null;
  assignmentCount: number;
}

export function MealPlanHeader({
  id,
  name,
  description,
  assignmentCount,
}: MealPlanHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description ?? "");
  const [error, setError] = useState<string | null>(null);

  const update = trpc.mealPlan.update.useMutation({
    onSuccess: () => {
      setOpen(false);
      setError(null);
      router.refresh();
    },
    onError: (err) => setError(err.message),
  });

  function openDialog() {
    setEditName(name);
    setEditDescription(description ?? "");
    setError(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    update.mutate({
      id,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainer/plans/meal">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-muted-foreground">
            {description || "Bez popisu"}
            {assignmentCount > 0 && (
              <> · Priradené {assignmentCount} klientom</>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openDialog}>
          <Pencil className="h-4 w-4" />
          Upraviť
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upraviť jedálniček</DialogTitle>
            <DialogDescription>
              Zmeň názov alebo popis plánu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Názov</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Popis</Label>
                <Input
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Zrušiť
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Ukladám..." : "Uložiť"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
