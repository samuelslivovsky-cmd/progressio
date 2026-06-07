"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dumbbell, Utensils, UserPlus } from "lucide-react";

type Assignment = {
  id: string;
  startDate: Date | string;
  mealPlan?: { id: string; name: string };
  trainingPlan?: { id: string; name: string };
};

type ClientPlanAssignCardsProps = {
  clientId: string;
  assignedMealPlan: Assignment | null;
  assignedTrainingPlan: Assignment | null;
};

export function ClientPlanAssignCards({
  clientId,
  assignedMealPlan,
  assignedTrainingPlan,
}: ClientPlanAssignCardsProps) {
  const router = useRouter();
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [mealPlanId, setMealPlanId] = useState("");
  const [trainingPlanId, setTrainingPlanId] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  const { data: mealPlans = [] } = trpc.mealPlan.list.useQuery(undefined, {
    enabled: mealDialogOpen,
  });
  const { data: trainingPlans = [] } = trpc.trainingPlan.list.useQuery(undefined, {
    enabled: trainingDialogOpen,
  });

  const assignMeal = trpc.mealPlan.assign.useMutation({
    onSuccess: () => {
      toast.success("Jedálniček priradený");
      setMealDialogOpen(false);
      setMealPlanId("");
      setNote("");
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const assignTraining = trpc.trainingPlan.assign.useMutation({
    onSuccess: () => {
      toast.success("Tréningový plán priradený");
      setTrainingDialogOpen(false);
      setTrainingPlanId("");
      setEndDate("");
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAssignMeal = () => {
    if (!mealPlanId || !startDate) {
      toast.error("Vyber plán a dátum začiatku");
      return;
    }
    assignMeal.mutate({
      clientId,
      mealPlanId,
      startDate: new Date(startDate),
      note: note.trim() || undefined,
    });
  };

  const handleAssignTraining = () => {
    if (!trainingPlanId || !startDate) {
      toast.error("Vyber plán a dátum začiatku");
      return;
    }
    assignTraining.mutate({
      clientId,
      trainingPlanId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tréningový plán</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          {assignedTrainingPlan?.trainingPlan ? (
            <>
              <div className="font-semibold truncate">
                {assignedTrainingPlan.trainingPlan.name}
              </div>
              <p className="text-xs text-muted-foreground">
                od {format(new Date(assignedTrainingPlan.startDate), "d. M. yyyy")}
              </p>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">Nepriradený</div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => setTrainingDialogOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            {assignedTrainingPlan ? "Zmeniť plán" : "Priradiť plán"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Jedálniček</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          {assignedMealPlan?.mealPlan ? (
            <>
              <div className="font-semibold truncate">
                {assignedMealPlan.mealPlan.name}
              </div>
              <p className="text-xs text-muted-foreground">
                od {format(new Date(assignedMealPlan.startDate), "d. M. yyyy")}
              </p>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">Nepriradený</div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => setMealDialogOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            {assignedMealPlan ? "Zmeniť plán" : "Priradiť plán"}
          </Button>
        </CardContent>
      </Card>

      {/* Assign meal plan dialog */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Priradiť jedálniček</DialogTitle>
            <DialogDescription>
              Vyber jedálniček a dátum začiatku. Klient uvidí plán vo svojom dashboarde.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Jedálniček</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={mealPlanId}
                onChange={(e) => setMealPlanId(e.target.value)}
              >
                <option value="">Vyber plán</option>
                {mealPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dátum začiatku</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Poznámka (voliteľná)</Label>
              <Input
                placeholder="Poznámka pre klienta"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealDialogOpen(false)}>
              Zrušiť
            </Button>
            <Button
              onClick={handleAssignMeal}
              disabled={assignMeal.isPending || !mealPlanId}
            >
              Priradiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign training plan dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Priradiť tréningový plán</DialogTitle>
            <DialogDescription>
              Vyber plán a dátum začiatku. Voliteľne môžeš zadať dátum ukončenia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tréningový plán</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={trainingPlanId}
                onChange={(e) => setTrainingPlanId(e.target.value)}
              >
                <option value="">Vyber plán</option>
                {trainingPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dátum začiatku</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Dátum ukončenia (voliteľné)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrainingDialogOpen(false)}>
              Zrušiť
            </Button>
            <Button
              onClick={handleAssignTraining}
              disabled={assignTraining.isPending || !trainingPlanId}
            >
              Priradiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
