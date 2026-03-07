"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddMealItemDialog } from "@/components/trainer/add-meal-item-dialog";
import { Plus, Trash2, Utensils } from "lucide-react";

export function MealTemplatesList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addItemTemplateId, setAddItemTemplateId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: templates = [], refetch } = trpc.mealTemplate.list.useQuery();

  const create = trpc.mealTemplate.create.useMutation({
    onSuccess: () => {
      toast.success("Jedlo vytvorené");
      setCreateOpen(false);
      setNewName("");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const removeItem = trpc.mealTemplate.removeItem.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTemplate = trpc.mealTemplate.delete.useMutation({
    onSuccess: () => {
      setDeleteConfirm(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)}>
        <Plus className="h-4 w-4" />
        Nové jedlo
      </Button>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Žiadne uložené jedlá</p>
            <p className="text-sm mt-1">
              Vytvor jedlo a pridaj do neho potraviny. Potom ho môžeš jedným klikom pridať do ľubovoľného dňa v jedálničku.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const totalCal = t.items.reduce(
              (sum, it) =>
                sum + (it.amount / (it.food.servingSize || 100)) * it.food.calories,
              0
            );
            const totalP = t.items.reduce(
              (sum, it) =>
                sum + (it.amount / (it.food.servingSize || 100)) * it.food.protein,
              0
            );
            const totalS = t.items.reduce(
              (sum, it) =>
                sum + (it.amount / (it.food.servingSize || 100)) * it.food.carbs,
              0
            );
            const totalT = t.items.reduce(
              (sum, it) =>
                sum + (it.amount / (it.food.servingSize || 100)) * it.food.fat,
              0
            );
            return (
              <Card key={t.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    {t.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddItemTemplateId(t.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Pridať položku
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirm(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {Math.round(totalCal)} kcal · P: {Math.round(totalP)}g S: {Math.round(totalS)}g T: {Math.round(totalT)}g
                  </div>
                  {t.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Žiadne položky. Pridaj potraviny cez „Pridať položku“.</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {t.items.map((it) => {
                        const mult = it.amount / (it.food.servingSize || 100);
                        const cal = Math.round(it.food.calories * mult);
                        return (
                          <li
                            key={it.id}
                            className="flex justify-between items-center group"
                          >
                            <span>
                              {it.food.name} · {it.amount} {it.food.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-muted-foreground">{cal} kcal</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem.mutate({ itemId: it.id })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nové jedlo</DialogTitle>
            <DialogDescription>
              Zadaj názov. Potom môžeš pridať potraviny do tohto jedla.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="template-name">Názov jedla</Label>
              <Input
                id="template-name"
                placeholder="napr. Ovsená kaša s banánom"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Zrušiť
            </Button>
            <Button
              onClick={() => {
                if (!newName.trim()) return;
                create.mutate({ name: newName.trim() });
              }}
              disabled={!newName.trim() || create.isPending}
            >
              Vytvoriť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addItemTemplateId && (
        <AddMealItemDialog
          open={true}
          onOpenChange={(open) => !open && setAddItemTemplateId(null)}
          onAdd={() => {}}
          templateId={addItemTemplateId}
          onTemplateItemAdded={() => refetch()}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Zmazať jedlo?"
          description="Toto jedlo sa odstráni zo zoznamu. Jedálničky to neovplyvní."
          confirmLabel="Zmazať"
          variant="destructive"
          onConfirm={() => deleteTemplate.mutate({ id: deleteConfirm })}
          loading={deleteTemplate.isPending}
        />
      )}
    </div>
  );
}

