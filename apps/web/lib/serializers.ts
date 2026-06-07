import { toNum } from "@/lib/utils";

/**
 * Read-boundary serializers.
 *
 * Prisma `Decimal` does NOT survive superjson serialization across the
 * tRPC / RSC boundary, so every row read from the DB that carries a `Decimal`
 * column must be flattened to `number` before it leaves the server. These
 * helpers are reused by tRPC routers and server components so the shapes stay
 * consistent and downstream `number`-typed component props keep working.
 */

type Dec = { toNumber(): number } | number;

// ─── Food ────────────────────────────────────────────────────────────
export type RawFood = {
  calories: Dec;
  protein: Dec;
  carbs: Dec;
  fat: Dec;
  fiber: Dec;
  servingSize: Dec;
};

type SerializedFood<T extends RawFood> = Omit<T, keyof RawFood> & {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
};

export function serializeFood<T extends RawFood>(food: T): SerializedFood<T> {
  return {
    ...food,
    calories: toNum(food.calories),
    protein: toNum(food.protein),
    carbs: toNum(food.carbs),
    fat: toNum(food.fat),
    fiber: toNum(food.fiber),
    servingSize: toNum(food.servingSize),
  };
}

// ─── Items carrying `amount` + (optional) nested food ────────────────
type RawItemWithFood = { amount: Dec; food: RawFood | null };

/** FoodLogItem: Decimal `amount`, nullable nested Food. */
export function serializeFoodLogItem<T extends RawItemWithFood>(
  item: T,
): Omit<T, "amount" | "food"> & {
  amount: number;
  food: SerializedFood<NonNullable<T["food"]>> | null;
} {
  return {
    ...item,
    amount: toNum(item.amount),
    food: item.food ? serializeFood(item.food) : null,
  };
}

type RawItemWithRequiredFood = { amount: Dec; food: RawFood };

/** MealItem / MealTemplateItem: Decimal `amount`, non-null nested Food. */
export function serializeMealItem<T extends RawItemWithRequiredFood>(
  item: T,
): Omit<T, "amount" | "food"> & { amount: number; food: SerializedFood<T["food"]> } {
  return {
    ...item,
    amount: toNum(item.amount),
    food: serializeFood(item.food),
  };
}
