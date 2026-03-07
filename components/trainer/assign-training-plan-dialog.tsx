"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
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

interface AssignTrainingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingPlanId: string;
  planName?: string;
}

export function AssignTrainingPlanDialog({
  open,
  onOpenChange,
  trainingPlanId,
  planName,
}: AssignTrainingPlanDialogProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");

  const { data: clients = [] } = trpc.profile.clients.useQuery(undefined, {
    enabled: open,
  });

  const assignPlan = trpc.trainingPlan.assign.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      setClientId("");
      setEndDate("");
      router.refresh();
      toast.success("Tréningový plán bol priradený klientovi.");
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (open) {
      setStartDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [open]);

  function handleSubmit() {
    if (!clientId) {
      toast.error("Vyber klienta");
      return;
    }
    assignPlan.mutate({
      trainingPlanId,
      clientId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  const clientOptions = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Priradiť tréningový plán klientovi</DialogTitle>
          <DialogDescription>
            {planName ? (
              <>Plán „{planName}“. Vyber klienta a dátum začiatku.</>
            ) : (
              "Vyber klienta a dátum začiatku."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Klient</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Vyber klienta</option>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
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
            <Label>Dátum konca (voliteľné)</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušiť
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={assignPlan.isPending || !clientId}
          >
            {assignPlan.isPending ? "Pridávam..." : "Priradiť"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
