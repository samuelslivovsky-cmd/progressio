"use client";

import { useState, useEffect } from "react";
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
import { Search, UtensilsCrossed, PlusCircle, Barcode } from "lucide-react";
import { BarcodeScanner } from "@/components/trainer/barcode-scanner";

const MEAL_OPTIONS = [
  { value: "breakfast" as const, label: "Raňajky" },
  { value: "desiata" as const, label: "Desiata" },
  { value: "lunch" as const, label: "Obed" },
  { value: "olovrant" as const, label: "Olovrant" },
  { value: "dinner" as const, label: "Večera" },
];

type Tab = "search" | "simple" | "create";

function macrosForAmount(
  food: { calories: number; protein: number; carbs: number; fat: number; servingSize: number },
  amount: number
) {
  const mult = amount / (food.servingSize || 100);
  return {
    calories: Math.round(food.calories * mult),
    protein: Math.round(food.protein * mult * 10) / 10,
    carbs: Math.round(food.carbs * mult * 10) / 10,
    fat: Math.round(food.fat * mult * 10) / 10,
  };
}

type MealTypeValue = "breakfast" | "desiata" | "lunch" | "olovrant" | "dinner";

interface AddFoodLogItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // YYYY-MM-DD
  onSuccess: () => void;
  /** Predvyplnený typ jedla pri otvorení (napr. z karty Obed) */
  defaultMealType?: MealTypeValue;
}

export function AddFoodLogItemDialog({
  open,
  onOpenChange,
  date,
  onSuccess,
  defaultMealType,
}: AddFoodLogItemDialogProps) {
  const [tab, setTab] = useState<Tab>("search");
  const [error, setError] = useState<string | null>(null);

  // Search tab
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [amount, setAmount] = useState("100");
  const [mealType, setMealType] = useState<MealTypeValue>(defaultMealType ?? "lunch");

  useEffect(() => {
    if (open && defaultMealType) setMealType(defaultMealType);
  }, [open, defaultMealType]);

  // Simple tab
  const [simpleName, setSimpleName] = useState("");
  const [simpleGrams, setSimpleGrams] = useState("100");

  // Create tab
  const [barcode, setBarcode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createKcal, setCreateKcal] = useState("");
  const [createGrams, setCreateGrams] = useState("100");
  const [createProtein, setCreateProtein] = useState("");
  const [createFiber, setCreateFiber] = useState("");
  const [createCarbs, setCreateCarbs] = useState("");
  const [createFat, setCreateFat] = useState("");
  const [createAmount, setCreateAmount] = useState("100");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: foods = [] } = trpc.foodLog.searchFoods.useQuery(
    { query: debouncedSearch },
    { enabled: open && tab === "search" && debouncedSearch.length >= 1 }
  );

  const addItem = trpc.foodLog.addItem.useMutation({
    onSuccess: () => {
      toast.success("Jedlo pridané");
      onOpenChange(false);
      resetForm();
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const createSimple = trpc.food.createSimple.useMutation({
    onError: (e) => setError(e.message),
  });

  const createFood = trpc.food.create.useMutation({
    onError: (e) => setError(e.message),
  });

  function resetForm() {
    setError(null);
    setSearch("");
    setDebouncedSearch("");
    setSelectedFoodId(null);
    setAmount("100");
    setSimpleName("");
    setSimpleGrams("100");
    setBarcode("");
    setCreateName("");
    setCreateKcal("");
    setCreateGrams("100");
    setCreateProtein("");
    setCreateFiber("");
    setCreateCarbs("");
    setCreateFat("");
    setCreateAmount("100");
    setShowScanner(false);
  }

  const selectedFood = selectedFoodId ? foods.find((f) => f.id === selectedFoodId) : null;
  const amountNum = Number.parseFloat(amount.replace(",", ".")) || 0;
  const liveMacros =
    selectedFood && amountNum > 0 ? macrosForAmount(selectedFood, amountNum) : null;

  function handleAddFromSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!selectedFoodId || !selectedFood) {
      setError("Vyber jedlo zo zoznamu");
      return;
    }
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Zadaj platné množstvo");
      return;
    }
    addItem.mutate({
      date,
      foodId: selectedFoodId,
      amount: amountNum,
      mealType,
    });
  }

  function handleAddSimple(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const name = simpleName.trim();
    if (!name) {
      setError("Zadaj názov potraviny");
      return;
    }
    const grams = Number.parseFloat(simpleGrams.replace(",", "."));
    if (Number.isNaN(grams) || grams <= 0) {
      setError("Zadaj platnú gramáž");
      return;
    }
    createSimple.mutate(
      { name, servingSize: 100 },
      {
        onSuccess: (food) => {
          addItem.mutate({
            date,
            foodId: food.id,
            amount: grams,
            mealType,
          });
        },
      }
    );
  }

  function handleCreateAndAdd(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const name = createName.trim();
    if (!name) {
      setError("Zadaj názov potraviny");
      return;
    }
    const kcal = Number.parseFloat(createKcal.replace(",", "."));
    const grams = Number.parseFloat(createGrams.replace(",", "."));
    const protein = Number.parseFloat(createProtein.replace(",", "."));
    const fiber = Number.parseFloat(createFiber.replace(",", "."));
    const carbs = Number.parseFloat((createCarbs || "0").replace(",", "."));
    const fat = Number.parseFloat((createFat || "0").replace(",", "."));
    const amountToAdd = Number.parseFloat(createAmount.replace(",", "."));

    if (Number.isNaN(kcal) || kcal < 0) {
      setError("Zadaj platné kcal");
      return;
    }
    if (Number.isNaN(grams) || grams <= 0) {
      setError("Zadaj platnú celkovú gramáž (napr. 100)");
      return;
    }
    if (Number.isNaN(protein) || protein < 0) {
      setError("Zadaj bielkoviny (môže byť 0)");
      return;
    }
    if (Number.isNaN(fiber) || fiber < 0) {
      setError("Zadaj vlákninu (môže byť 0)");
      return;
    }
    if (Number.isNaN(amountToAdd) || amountToAdd <= 0) {
      setError("Zadaj množstvo na pridanie do jedla");
      return;
    }

    createFood.mutate(
      {
        name,
        barcode: barcode.trim() || undefined,
        calories: kcal,
        servingSize: grams,
        unit: "g",
        protein,
        fiber,
        carbs,
        fat,
      },
      {
        onSuccess: (food) => {
          addItem.mutate({
            date,
            foodId: food.id,
            amount: amountToAdd,
            mealType,
          });
        },
      }
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "search", label: "Vyhľadať", icon: <Search className="h-4 w-4" /> },
    { id: "simple", label: "Názov + gramáž", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: "create", label: "Vytvoriť potravinu", icon: <PlusCircle className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pridať jedlo</DialogTitle>
          <DialogDescription>
            Vyhľadaj existujúcu potravinu, pridaj len názov a gramáž, alebo vytvor novú (vrátane načítania čiarového kódu).
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 border-b">
          {tabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant={tab === t.id ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => {
                setTab(t.id);
                setError(null);
              }}
            >
              {t.icon}
              <span className="ml-1.5">{t.label}</span>
            </Button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {tab === "search" && (
          <form onSubmit={handleAddFromSearch}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Hľadať jedlo</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="názov jedla..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedFoodId(null);
                    }}
                    className="pl-9"
                  />
                </div>
                {foods.length > 0 && !selectedFoodId && (
                  <ul className="border rounded-md max-h-48 overflow-auto divide-y">
                    {foods.map((f) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setSelectedFoodId(f.id);
                            setAmount(String(f.servingSize ?? 100));
                          }}
                        >
                          <div className="font-medium">{f.name}</div>
                          <div className="text-muted-foreground text-xs mt-0.5">
                            {f.calories} kcal / {f.servingSize ?? 100} {f.unit ?? "g"}
                            <span className="ml-2">
                              · P: {f.protein}g S: {f.carbs}g T: {f.fat}g
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedFood && (
                  <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedFood.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFoodId(null)}
                      >
                        Zmeniť
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      na {selectedFood.servingSize ?? 100} {selectedFood.unit ?? "g"}: {selectedFood.calories} kcal · P: {selectedFood.protein}g S: {selectedFood.carbs}g T: {selectedFood.fat}g
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Množstvo ({selectedFood?.unit ?? "g"})</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!selectedFoodId}
                />
                {liveMacros && selectedFood && (
                  <p className="text-sm text-muted-foreground">
                    = {liveMacros.calories} kcal · P: {liveMacros.protein}g S: {liveMacros.carbs}g T: {liveMacros.fat}g
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Typ jedla</Label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={mealType === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMealType(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušiť
              </Button>
              <Button
                type="submit"
                disabled={!selectedFoodId || amountNum <= 0 || addItem.isPending}
              >
                {addItem.isPending ? "Pridávam…" : "Pridať"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {tab === "simple" && (
          <form onSubmit={handleAddSimple}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="simple-name">Názov potraviny</Label>
                <Input
                  id="simple-name"
                  placeholder="napr. Kuracie prsia"
                  value={simpleName}
                  onChange={(e) => setSimpleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="simple-grams">Gramáž (g)</Label>
                <Input
                  id="simple-grams"
                  type="text"
                  inputMode="decimal"
                  placeholder="150"
                  value={simpleGrams}
                  onChange={(e) => setSimpleGrams(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Typ jedla</Label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={mealType === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMealType(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Potravina sa vytvorí bez výživových údajov. Môžeš neskôr doplniť alebo vytvoriť plnú verziu cez „Vytvoriť potravinu”.
              </p>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušiť
              </Button>
              <Button
                type="submit"
                disabled={!simpleName.trim() || createSimple.isPending}
              >
                {createSimple.isPending ? "Pridávam…" : "Pridať"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {tab === "create" && (
          <form onSubmit={handleCreateAndAdd}>
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Čiarový kód (voliteľné)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="EAN / QR alebo zadaj ručne"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowScanner((s) => !s)}
                    title="Skenovať"
                  >
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
                {showScanner && (
                  <BarcodeScanner
                    onScan={(code) => {
                      setBarcode(code);
                      setShowScanner(false);
                    }}
                    onClose={() => setShowScanner(false)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-name">Názov *</Label>
                <Input
                  id="create-name"
                  placeholder="názov potraviny"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-kcal">Energie (kcal) *</Label>
                  <Input
                    id="create-kcal"
                    type="text"
                    inputMode="decimal"
                    placeholder="120"
                    value={createKcal}
                    onChange={(e) => setCreateKcal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-grams">Gramáž porcie (g) *</Label>
                  <Input
                    id="create-grams"
                    type="text"
                    inputMode="decimal"
                    placeholder="100"
                    value={createGrams}
                    onChange={(e) => setCreateGrams(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-protein">Bielkoviny (g) *</Label>
                  <Input
                    id="create-protein"
                    type="text"
                    inputMode="decimal"
                    placeholder="10"
                    value={createProtein}
                    onChange={(e) => setCreateProtein(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-fiber">Vláknina (g) *</Label>
                  <Input
                    id="create-fiber"
                    type="text"
                    inputMode="decimal"
                    placeholder="2"
                    value={createFiber}
                    onChange={(e) => setCreateFiber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-carbs">Sacharidy (g)</Label>
                  <Input
                    id="create-carbs"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={createCarbs}
                    onChange={(e) => setCreateCarbs(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-fat">Tuky (g)</Label>
                  <Input
                    id="create-fat"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={createFat}
                    onChange={(e) => setCreateFat(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-amount">Množstvo na pridanie do jedla (g)</Label>
                <Input
                  id="create-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="100"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Typ jedla</Label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={mealType === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMealType(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušiť
              </Button>
              <Button type="submit" disabled={createFood.isPending}>
                {createFood.isPending ? "Vytváram a pridávam…" : "Vytvoriť a pridať"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
