"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Utensils, Plus, Trash2, ArrowLeft, Pencil, UserPlus, Copy } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddMealItemDialog } from "./add-meal-item-dialog";
import { format } from "date-fns";

const MEAL_TYPES = [
  { value: "breakfast" as const, label: "Raňajky" },
  { value: "desiata" as const, label: "Desiata" },
  { value: "lunch" as const, label: "Obed" },
  { value: "olovrant" as const, label: "Olovrant" },
  { value: "dinner" as const, label: "Večera" },
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Raňajky",
  desiata: "Desiata",
  lunch: "Obed",
  olovrant: "Olovrant",
  dinner: "Večera",
};

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
};

type MealItem = { id: string; amount: number; food: Food };
type Meal = { id: string; name: string; items: MealItem[] };
type MealPlanDay = { id: string; dayNumber: number; meals: Meal[] };

function formatMealName(name: string) {
  return MEAL_LABELS[name.toLowerCase()] ?? name;
}

type MacroTotals = { calories: number; protein: number; carbs: number; fat: number };

function mealTotals(items: MealItem[]) {
  return items.reduce(
    (acc: MacroTotals, it: MealItem) => {
      const mult = it.amount / (it.food.servingSize || 100);
      return {
        calories: acc.calories + it.food.calories * mult,
        protein: acc.protein + it.food.protein * mult,
        carbs: acc.carbs + it.food.carbs * mult,
        fat: acc.fat + it.food.fat * mult,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

type MealPlanInitial = {
  id: string;
  name: string;
  description: string | null;
  calorieTargetPerDay: number | null;
  days: MealPlanDay[];
};

interface MealPlanEditorProps {
  mealPlan: MealPlanInitial;
  assignmentCount: number;
  clients: { id: string; name: string; email: string }[];
}

type ConfirmState =
  | { type: "day"; dayId: string }
  | { type: "meal"; mealId: string }
  | { type: "item"; itemId: string }
  | null;

export function MealPlanEditor({ mealPlan: initialPlan, assignmentCount, clients }: MealPlanEditorProps) {
  const router = useRouter();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [addItemTarget, setAddItemTarget] = useState<{ mealId: string; dayId: string } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(initialPlan.name);
  const [editDescription, setEditDescription] = useState(initialPlan.description ?? "");
  const [editCalorieTarget, setEditCalorieTarget] = useState(String(initialPlan.calorieTargetPerDay ?? ""));
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignClientId, setAssignClientId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [assignNote, setAssignNote] = useState("");
  const [copyDayOpen, setCopyDayOpen] = useState(false);
  const [copyTargetDayNumber, setCopyTargetDayNumber] = useState<number>(1);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState("");

  const plan = initialPlan;
  const days = plan.days;
  const selectedDay = days.find((d) => d.id === selectedDayId) ?? days[0] ?? null;

  useEffect(() => {
    if (selectedDayId && !days.some((d) => d.id === selectedDayId)) {
      setSelectedDayId(days[0]?.id ?? null);
    } else if (!selectedDayId && days.length > 0) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  const refresh = () => router.refresh();

  const addDay = trpc.mealPlan.addDay.useMutation({
    onSuccess: () => {
      toast.success("Deň pridaný");
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const addMeal = trpc.mealPlan.addMeal.useMutation({
    onSuccess: () => {
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const addMealItem = trpc.mealPlan.addMealItem.useMutation({
    onSuccess: () => {
      setAddItemTarget(null);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMealItemAmount = trpc.mealPlan.updateMealItemAmount.useMutation({
    onSuccess: () => {
      setEditingItemId(null);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteDay = trpc.mealPlan.deleteDay.useMutation({
    onSuccess: () => {
      setConfirmState(null);
      setSelectedDayId(null);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMeal = trpc.mealPlan.deleteMeal.useMutation({
    onSuccess: () => {
      setConfirmState(null);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMealItem = trpc.mealPlan.deleteMealItem.useMutation({
    onSuccess: () => {
      setConfirmState(null);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePlan = trpc.mealPlan.update.useMutation({
    onSuccess: () => {
      setEditOpen(false);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const assignPlan = trpc.mealPlan.assign.useMutation({
    onSuccess: () => {
      toast.success("Plán priradený klientovi");
      setAssignOpen(false);
      setAssignClientId("");
      setAssignNote("");
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const copyDay = trpc.mealPlan.copyDay.useMutation({
    onSuccess: () => {
      toast.success("Deň skopírovaný");
      setCopyDayOpen(false);
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleConfirmAction() {
    if (!confirmState) return;
    if (confirmState.type === "day") deleteDay.mutate({ dayId: confirmState.dayId });
    else if (confirmState.type === "meal") deleteMeal.mutate({ mealId: confirmState.mealId });
    else if (confirmState.type === "item") deleteMealItem.mutate({ itemId: confirmState.itemId });
  }

  const confirmConfig =
    confirmState?.type === "day"
      ? { title: "Zmazať deň?", description: "Naozaj zmazať tento deň a všetky jeho jedlá?", confirmLabel: "Zmazať" }
      : confirmState?.type === "meal"
        ? { title: "Zmazať jedlo?", description: "Naozaj zmazať toto jedlo?", confirmLabel: "Zmazať" }
        : confirmState?.type === "item"
          ? { title: "Odstrániť položku?", description: "Naozaj odstrániť túto položku?", confirmLabel: "Odstrániť" }
          : null;

  const selectedDayTotals = selectedDay
    ? selectedDay.meals.reduce(
        (acc: MacroTotals, m: Meal) => {
          const t = mealTotals(m.items);
          return {
            calories: acc.calories + t.calories,
            protein: acc.protein + t.protein,
            carbs: acc.carbs + t.carbs,
            fat: acc.fat + t.fat,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
    : null;

  const calorieTarget = plan.calorieTargetPerDay ?? 0;
  const remaining = calorieTarget > 0 ? Math.max(0, calorieTarget - (selectedDayTotals?.calories ?? 0)) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/trainer/plans/meal"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
          <p className="text-muted-foreground text-sm">
            {plan.description || "Bez popisu"}
            {assignmentCount > 0 && <> · Priradené {assignmentCount} klientom</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(plan.name);
              setEditDescription(plan.description ?? "");
              setEditCalorieTarget(String(plan.calorieTargetPerDay ?? ""));
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Upraviť
          </Button>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Priradiť →
          </Button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        {days.map((day) => (
          <Button
            key={day.id}
            variant={selectedDayId === day.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedDayId(day.id)}
          >
            D{day.dayNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => addDay.mutate({ mealPlanId: plan.id })}
          disabled={addDay.isPending}
        >
          <Plus className="h-4 w-4" />
          Pridať deň
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: selected day meals */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedDay ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Žiadne dni v pláne</p>
                <p className="text-sm mt-1">Pridaj prvý deň kliknutím na „Pridať deň“.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {selectedDay.meals.length === 0 ? (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-sm text-muted-foreground mb-3">Žiadne jedlá v tomto dni.</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center gap-1.5")}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Pridať jedlo
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {MEAL_TYPES.map(({ value, label }) => (
                          <DropdownMenuItem
                            key={value}
                            onClick={() => addMeal.mutate({ mealPlanDayId: selectedDay.id, name: value })}
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ) : (
                selectedDay.meals.map((meal) => (
                  <Card key={meal.id}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                      <CardTitle className="text-base">
                        {formatMealName(meal.name)} — {Math.round(mealTotals(meal.items).calories)} kcal
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddItemTarget({ mealId: meal.id, dayId: selectedDay.id })}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Pridať potravinu
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmState({ type: "meal", mealId: meal.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {meal.items.map((item) => {
                          const mult = item.amount / (item.food.servingSize || 100);
                          const cal = Math.round(item.food.calories * mult);
                          const isEditing = editingItemId === item.id;
                          return (
                            <li key={item.id} className="flex justify-between items-center gap-2 text-sm">
                              <span className="truncate">{item.food.name}</span>
                              <span className="flex items-center gap-1 shrink-0">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    min={0.1}
                                    step={1}
                                    className="w-20 h-8 text-sm"
                                    value={editingAmount}
                                    onChange={(e) => setEditingAmount(e.target.value)}
                                    onBlur={() => {
                                      const v = Number.parseFloat(editingAmount.replace(",", "."));
                                      if (!Number.isNaN(v) && v > 0) {
                                        updateMealItemAmount.mutate({ itemId: item.id, amount: v });
                                      } else {
                                        setEditingItemId(null);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const v = Number.parseFloat(editingAmount.replace(",", "."));
                                        if (!Number.isNaN(v) && v > 0) {
                                          updateMealItemAmount.mutate({ itemId: item.id, amount: v });
                                        }
                                        setEditingItemId(null);
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    className="text-muted-foreground hover:underline px-1"
                                    onClick={() => {
                                      setEditingItemId(item.id);
                                      setEditingAmount(String(item.amount));
                                    }}
                                  >
                                    {item.amount} {item.food.unit}
                                  </button>
                                )}
                                <span className="text-muted-foreground w-14 text-right">{cal} kcal</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => setConfirmState({ type: "item", itemId: item.id })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                ))
              )}
              {selectedDay.meals.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center gap-1.5")}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Pridať jedlo
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {MEAL_TYPES.map(({ value, label }) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => addMeal.mutate({ mealPlanDayId: selectedDay.id, name: value })}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Sidebar: Makrá dnes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Makrá dnes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayTotals ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Energia</span>
                      <span className="font-medium">{Math.round(selectedDayTotals.calories)} kcal</span>
                    </div>
                    {calorieTarget > 0 && (
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (selectedDayTotals.calories / calorieTarget) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">P</span>
                      <span className="ml-1 font-medium">{Math.round(selectedDayTotals.protein)}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">S</span>
                      <span className="ml-1 font-medium">{Math.round(selectedDayTotals.carbs)}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">T</span>
                      <span className="ml-1 font-medium">{Math.round(selectedDayTotals.fat)}g</span>
                    </div>
                  </div>
                  {calorieTarget > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground">Cieľ: {calorieTarget} kcal</p>
                      {remaining !== null && (
                        <p className="text-xs font-medium">Zostatok: {Math.round(remaining)} kcal</p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Vyber deň alebo pridaj jedlá.</p>
              )}
            </CardContent>
          </Card>

          {selectedDay && (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => {
                const other = [1, 2, 3, 4, 5, 6, 7].find(
                  (n) => n !== selectedDay?.dayNumber
                ) ?? 1;
                setCopyTargetDayNumber(other);
                setCopyDayOpen(true);
              }}
            >
              <Copy className="h-4 w-4" />
              Skopírovať deň
            </Button>
          )}
        </div>
      </div>

      {/* Edit plan dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upraviť jedálniček</DialogTitle>
            <DialogDescription>Názov, popis a kalorický cieľ.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Názov</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kalorický cieľ / deň (kcal)</Label>
              <Input
                type="number"
                min={1}
                placeholder="voliteľné"
                value={editCalorieTarget}
                onChange={(e) => setEditCalorieTarget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Zrušiť</Button>
            <Button
              onClick={() => {
                const target = editCalorieTarget.trim()
                  ? Number.parseInt(editCalorieTarget, 10)
                  : null;
                updatePlan.mutate({
                  id: plan.id,
                  name: editName.trim(),
                  description: editDescription.trim() || undefined,
                  calorieTargetPerDay: target !== null && !Number.isNaN(target) ? target : null,
                });
              }}
              disabled={updatePlan.isPending}
            >
              Uložiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Priradiť plán klientovi</DialogTitle>
            <DialogDescription>Vyber klienta a dátum začiatku.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Klient</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={assignClientId}
                onChange={(e) => setAssignClientId(e.target.value)}
              >
                <option value="">Vyber klienta</option>
                {clients.map((c) => (
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
                value={assignStartDate}
                onChange={(e) => setAssignStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Poznámka (voliteľná)</Label>
              <Input
                placeholder="Poznámka pre klienta"
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Zrušiť</Button>
            <Button
              onClick={() => {
                if (!assignClientId) {
                  toast.error("Vyber klienta");
                  return;
                }
                assignPlan.mutate({
                  mealPlanId: plan.id,
                  clientId: assignClientId,
                  startDate: new Date(assignStartDate),
                  note: assignNote.trim() || undefined,
                });
              }}
              disabled={assignPlan.isPending || !assignClientId}
            >
              Priradiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy day dialog */}
      <Dialog open={copyDayOpen} onOpenChange={setCopyDayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skopírovať deň</DialogTitle>
            <DialogDescription>
              Skopíruje všetky jedlá a potraviny z D{selectedDay?.dayNumber} na vybraný deň.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Cieľový deň</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={copyTargetDayNumber}
                onChange={(e) => setCopyTargetDayNumber(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    Deň {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDayOpen(false)}>Zrušiť</Button>
            <Button
              onClick={() => {
                if (!selectedDay) return;
                copyDay.mutate({
                  mealPlanId: plan.id,
                  sourceDayId: selectedDay.id,
                  targetDayNumber: copyTargetDayNumber,
                });
              }}
              disabled={copyDay.isPending || !selectedDay}
            >
              Skopírovať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add meal item */}
      {addItemTarget && (
        <AddMealItemDialog
          open={true}
          onOpenChange={(open) => !open && setAddItemTarget(null)}
          mealId={addItemTarget.mealId}
          onAdd={(item) => {
            addMealItem.mutate({
              mealId: addItemTarget.mealId,
              foodId: item.foodId,
              amount: item.amount,
            });
          }}
        />
      )}

      {confirmConfig && (
        <ConfirmDialog
          open={confirmState !== null}
          onOpenChange={(open) => !open && setConfirmState(null)}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          variant="destructive"
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
