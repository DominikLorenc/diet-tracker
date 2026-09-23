"use client";

import { useState, useEffect } from "react";
import { formatAmount, pluralPl } from "@/utils/format";
import { DateNavigator } from "./DateNavigator";
import { MacroSummary } from "./MacroSummary";
import Link from "next/link";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, X } from "lucide-react";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface Product {
  id: string;
  name: string;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  createdAt: string;
  imageUrl: string;
}

interface RecipeProduct {
  quantity: string;
  product: Product;
}

interface Recipe {
  id: string;
  name: string;
  products: RecipeProduct[];
}

interface UserRecipeIngredient {
  quantity: string;
  product: Product;
}

interface UserRecipe {
  id: string;
  name: string;
  userRecipeIngredients: UserRecipeIngredient[];
}

export interface DiaryItem {
  id: string;
  diaryEntryId: string;
  productId: string | null;
  recipeId: string | null;
  userRecipeId: string | null;
  mealType: MealType;
  createdAt: string;
  quantity: string;
  isEaten: boolean;
  product: Product | null;
  recipe: Recipe | null;
  userRecipe: UserRecipe | null;
}

function calcRecipeMacros(
  ingredients: { quantity: string; product: Product }[],
  qty: number,
) {
  const totals = ingredients.reduce(
    (sum, rp) => {
      const rpQty = parseFloat(rp.quantity);
      return {
        calories:
          sum.calories + (rpQty / 100) * parseFloat(rp.product.calories),
        protein: sum.protein + (rpQty / 100) * parseFloat(rp.product.protein),
        carbs: sum.carbs + (rpQty / 100) * parseFloat(rp.product.carbs),
        fat: sum.fat + (rpQty / 100) * parseFloat(rp.product.fat),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const totalGrams = ingredients.reduce(
    (sum, rp) => sum + parseFloat(rp.quantity),
    0,
  );
  const multiplier = totalGrams > 0 ? qty / totalGrams : 0;
  return {
    calories: totals.calories * multiplier,
    protein: totals.protein * multiplier,
    carbs: totals.carbs * multiplier,
    fat: totals.fat * multiplier,
  };
}

export function getItemMacros(item: DiaryItem) {
  const qty = parseFloat(item.quantity);
  if (item.recipe) return calcRecipeMacros(item.recipe.products, qty);
  if (item.userRecipe)
    return calcRecipeMacros(item.userRecipe.userRecipeIngredients, qty);
  return {
    calories: (qty / 100) * parseFloat(item.product?.calories ?? "0"),
    protein: (qty / 100) * parseFloat(item.product?.protein ?? "0"),
    carbs: (qty / 100) * parseFloat(item.product?.carbs ?? "0"),
    fat: (qty / 100) * parseFloat(item.product?.fat ?? "0"),
  };
}

export interface DiaryEntry {
  id: string;
  date: string;
  userId: string;
  createdAt: string;
  items: DiaryItem[];
}

export type DiaryEntriesResponse = DiaryEntry[];

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const MEAL_CONFIG: Record<
  MealType,
  { label: string; addTo: string; addEmpty: string }
> = {
  BREAKFAST: {
    label: "Śniadanie",
    addTo: "Dodaj do śniadania",
    addEmpty: "Dodaj śniadanie",
  },
  LUNCH: { label: "Obiad", addTo: "Dodaj do obiadu", addEmpty: "Dodaj obiad" },
  DINNER: {
    label: "Kolacja",
    addTo: "Dodaj do kolacji",
    addEmpty: "Dodaj kolację",
  },
  SNACK: {
    label: "Przekąska",
    addTo: "Dodaj do przekąski",
    addEmpty: "Dodaj przekąskę",
  },
};

const ITEM_FORMS = { one: "pozycja", few: "pozycje", many: "pozycji" };

const OPEN_MEALS_STORAGE_KEY = "diary-open-meals";

export const DiaryDayView = () => {
  const [date, setDate] = useState(new Date());
  // Starts as "all open" so the first client render matches the server-rendered
  // HTML exactly (localStorage doesn't exist on the server). The saved value is
  // applied after mount, see the effect below.
  const [openMeals, setOpenMeals] = useState<Set<MealType>>(
    () => new Set(MEAL_TYPES),
  );
  const queryClient = useQueryClient();

  const showToast = useToastStore((state) => state.showToast);

  const dateParam = date.toISOString().split("T")[0];

  const {
    data: entries = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["diary", dateParam],
    queryFn: async () => {
      const { data, error: fetchError } = await apiClient.GET("/diary", {
        params: { query: { date: dateParam } },
      });
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      return data.diaryEntries;
    },
  });

  const allItems = entries[0]?.items ?? [];

  // Sync accordion state from localStorage — a client-only API, so this can
  // only happen after mount, not during the lazy useState initializer above
  // (that would run during SSR/hydration and cause a mismatch, see comment there).
  useEffect(() => {
    const saved = localStorage.getItem(OPEN_MEALS_STORAGE_KEY);
    if (!saved) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with an external system (localStorage) on mount, not derived render state
      setOpenMeals(new Set(JSON.parse(saved) as MealType[]));
    } catch {
      // ignore malformed stored value, keep default (all open)
    }
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error: deleteError } = await apiClient.DELETE(
        "/diary/{id}/item",
        {
          params: { path: { id } },
        },
      );
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      showToast("success", "Wpis usunięty");
    },
    onError: () => {
      showToast(
        "error",
        "Nie udało się usunąć wpisu",
        "Spróbuj ponownie lub odśwież stronę",
      );
    },
  });

  const toggleMeal = (mealType: MealType) => {
    setOpenMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealType)) {
        next.delete(mealType);
      } else {
        next.add(mealType);
      }
      localStorage.setItem(
        OPEN_MEALS_STORAGE_KEY,
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  };

  const eatenMutation = useMutation({
    mutationFn: async ({ id, isEaten }: { id: string; isEaten: boolean }) => {
      const { error: updateError } = await apiClient.PATCH(
        "/diary/{id}/eaten",
        {
          params: { path: { id } },
          body: { isEaten },
        },
      );
      if (updateError) {
        throw new Error(updateError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
    onError: () => {
      showToast(
        "error",
        "Nie udało się zaktualizować statusu",
        "Spróbuj ponownie lub odśwież stronę",
      );
    },
  });

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-8 sm:px-8 sm:pt-6 max-w-[1280px]">
      <DateNavigator title="Dziennik" date={date} onDateChange={setDate} />

      {queryError && (
        <p role="alert" className="font-mono text-sm text-accent">
          {queryError.message}
        </p>
      )}

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        <div className="lg:order-2 lg:sticky lg:top-6">
          <MacroSummary items={allItems.filter((item) => item.isEaten)} />
        </div>

        <div
          className={`grid gap-7 2xl:grid-cols-2 2xl:gap-x-6 content-start transition-opacity ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          {MEAL_TYPES.map((mealType) => {
            const items = allItems.filter((item) => item.mealType === mealType);
            const mealKcal = items.reduce(
              (sum, item) => sum + getItemMacros(item).calories,
              0,
            );
            const eatenCount = items.filter((item) => item.isEaten).length;
            const config = MEAL_CONFIG[mealType];
            const isOpen = openMeals.has(mealType);
            const addHref = `/dashboard/add?mealType=${mealType}&date=${dateParam}`;
            const headingId = `meal-${mealType}`;
            const listId = `meal-list-${mealType}`;

            return (
              <section key={mealType} aria-labelledby={headingId}>
                <div className="flex items-center gap-2 border-b-[5px] border-ink pb-0.5">
                  <h3
                    id={headingId}
                    className="font-display text-[26px] uppercase flex-1"
                  >
                    {config.label}
                  </h3>
                  <span
                    className={`font-mono text-base font-semibold ${
                      items.length === 0 ? "text-ink-muted" : ""
                    }`}
                  >
                    {items.length > 0 ? mealKcal.toFixed(0) : "—"} kcal
                  </span>
                  {items.length > 0 && (
                    <button
                      onClick={() => toggleMeal(mealType)}
                      aria-expanded={isOpen}
                      aria-controls={listId}
                      aria-label={`${isOpen ? "Zwiń" : "Rozwiń"}: ${config.label}`}
                      className="w-11 h-9 flex items-center justify-end cursor-pointer"
                    >
                      <ChevronDown
                        size={18}
                        strokeWidth={2.5}
                        strokeLinecap="square"
                        className="transition-transform duration-300"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      />
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <Link
                    href={addHref}
                    className="flex items-center justify-between min-h-14 mt-2 px-3.5 border-2 border-dashed border-ink text-sm font-extrabold uppercase tracking-wide hover:bg-card transition-colors"
                  >
                    <span>Pusto. {config.addEmpty}</span>
                    <Plus size={18} strokeWidth={3} strokeLinecap="square" />
                  </Link>
                ) : (
                  <>
                    {!isOpen && (
                      <p className="font-mono text-xs py-1.5 border-b border-ink">
                        {pluralPl(items.length, ITEM_FORMS)} ·{" "}
                        {eatenCount === items.length
                          ? "wszystkie zjedzone"
                          : `zjedzone ${eatenCount} z ${items.length}`}
                      </p>
                    )}
                    <div
                      id={listId}
                      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden min-h-0">
                        <ul>
                          {items.map((item) => (
                            <DiaryItemRow
                              key={item.id}
                              item={item}
                              onToggleEaten={() =>
                                eatenMutation.mutate({
                                  id: item.id,
                                  isEaten: !item.isEaten,
                                })
                              }
                              onDelete={() => deleteMutation.mutate(item.id)}
                            />
                          ))}
                        </ul>
                        <Link
                          href={addHref}
                          className="inline-flex items-center gap-1.5 min-h-11 text-sm font-extrabold uppercase tracking-wide text-accent hover:text-accent-hover"
                        >
                          <Plus
                            size={16}
                            strokeWidth={3}
                            strokeLinecap="square"
                          />
                          {config.addTo}
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type DiaryItemRowProps = {
  item: DiaryItem;
  onToggleEaten: () => void;
  onDelete: () => void;
};

function DiaryItemRow({ item, onToggleEaten, onDelete }: DiaryItemRowProps) {
  const macros = getItemMacros(item);
  const name = item.recipe?.name ?? item.userRecipe?.name ?? item.product?.name;
  const isRecipe = Boolean(item.recipe || item.userRecipe);
  const details = [
    isRecipe ? "przepis" : `${formatAmount(item.quantity)} g`,
    `B ${macros.protein.toFixed(0)}`,
    `W ${macros.carbs.toFixed(0)}`,
    `T ${macros.fat.toFixed(0)}`,
  ].join(" · ");

  return (
    <li
      className={`group flex items-center gap-2.5 min-h-[52px] border-b border-ink ${
        item.isEaten ? "" : "text-ink-muted"
      }`}
    >
      <button
        onClick={onToggleEaten}
        aria-pressed={item.isEaten}
        aria-label={
          item.isEaten
            ? `Oznacz jako niezjedzone: ${name}`
            : `Oznacz jako zjedzone: ${name}`
        }
        className="w-11 h-11 -ml-2.5 shrink-0 flex items-center justify-center cursor-pointer"
      >
        <span
          className={`w-6 h-6 border-2 border-ink flex items-center justify-center transition-colors ${
            item.isEaten ? "bg-ink text-paper" : "bg-card"
          }`}
        >
          {item.isEaten && (
            <Check size={14} strokeWidth={4} strokeLinecap="square" />
          )}
        </span>
      </button>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[15px] font-bold truncate">{name}</span>
        <span className="font-mono text-[11px]">{details}</span>
      </div>
      <span className="font-mono text-[15px] font-semibold">
        {macros.calories.toFixed(0)}
      </span>
      <button
        onClick={onDelete}
        aria-label={`Usuń: ${name}`}
        className="w-11 h-11 -mr-2 shrink-0 flex items-center justify-center text-ink-muted hover:text-accent transition-colors cursor-pointer"
      >
        <X size={16} strokeWidth={2.5} strokeLinecap="square" />
      </button>
    </li>
  );
}
