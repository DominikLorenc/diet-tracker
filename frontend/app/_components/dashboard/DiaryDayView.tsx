"use client";

import { useState, useEffect } from "react";
import { DateNavigator } from "./DateNavigator";
import { MacroSummary } from "./MacroSummary";
import Link from "next/link";
import Image from "next/image";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";

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

type UserGoals = {
  id: string;
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
};

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userGoals: UserGoals | null;
};

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string }> = {
  BREAKFAST: { label: "ŚNIADANIE", emoji: "🌅" },
  LUNCH: { label: "OBIAD", emoji: "☀️" },
  DINNER: { label: "KOLACJA", emoji: "🌙" },
  SNACK: { label: "PRZEKĄSKA", emoji: "🍎" },
};

export const DiaryDayView = () => {
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allItems = entries[0]?.items ?? [];
  const showToast = useToastStore((state) => state.showToast);

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await apiClient.GET("/users/me");
      if (data) setUser(data.user as User);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error: fetchError } = await apiClient.GET("/diary", {
        params: { query: { date: date.toISOString().split("T")[0] } },
      });
      if (fetchError) {
        setError("Błąd pobierania danych");
      } else if (data) {
        setEntries(data.diaryEntries);
      }
    };
    fetchData();
  }, [date]);

  const handleDeleteItem = async (id: string) => {
    const { error: deleteError } = await apiClient.DELETE("/diary/{id}/item", {
      params: { path: { id } },
    });
    if (deleteError) {
      showToast(
        "error",
        "Nie udało się usunąć wpisu",
        "Spróbuj ponownie lub odśwież stronę",
      );
    } else {
      setEntries(
        entries.map((entry) => ({
          ...entry,
          items: entry.items.filter((item) => item.id !== id),
        })),
      );
      showToast("success", "Wpis usunięty");
    }
  };

  const handleEaten = async (id: string, isEaten: boolean) => {
    const { error: updateError } = await apiClient.PATCH("/diary/{id}/eaten", {
      params: { path: { id } },
      body: { isEaten },
    });
    if (updateError) {
      showToast(
        "error",
        "Nie udało się zaktualizować statusu",
        "Spróbuj ponownie lub odśwież stronę",
      );
    } else {
      setEntries(
        entries.map((entry) => ({
          ...entry,
          items: entry.items.map((item) => ({
            ...item,
            isEaten: item.id === id ? isEaten : item.isEaten,
          })),
        })),
      );
    }
  };

  return (
    <div
      className="flex flex-col gap-4 p-5 sm:p-7 min-h-full"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      {/* ── Nagłówek ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <p
          className="text-sm font-medium capitalize"
          style={{ color: "var(--color-dash-fg-muted)" }}
        >
          {today}
        </p>
        <h1
          className="text-[42px] sm:text-[56px] font-bold leading-tight"
          style={{
            color: "var(--color-dash-fg)",
            fontFamily: "var(--font-newsreader)",
          }}
        >
          Cześć, {user?.username ?? "…"}
        </h1>
      </div>

      {/* ── Podsumowanie kalorii + makro ─────────────────────────── */}
      <MacroSummary
        items={allItems.filter((item) => item.isEaten)}
        user={user}
      />

      {/* ── Nawigacja dat ────────────────────────────────────────── */}
      <DateNavigator date={date} onDateChange={setDate} />

      {error && (
        <p className="text-sm px-1" style={{ color: "var(--color-macro-fat)" }}>
          {error}
        </p>
      )}

      {/* ── Posiłki ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-4">
        {MEAL_TYPES.map((mealType) => {
          const items = allItems.filter((item) => item.mealType === mealType);
          const mealKcal = items.reduce(
            (sum, item) => sum + getItemMacros(item).calories,
            0,
          );
          const config = MEAL_CONFIG[mealType];

          return (
            <div
              key={mealType}
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--color-dash-surface)",
                border: "1px solid var(--color-dash-border)",
              }}
            >
              {/* Nagłówek posiłku */}
              <div
                className="flex items-center justify-between px-4 h-[46px]"
                style={{
                  borderBottom:
                    items.length > 0
                      ? "1px solid var(--color-dash-border)"
                      : "none",
                }}
              >
                <span
                  className="text-sm font-bold tracking-wider"
                  style={{
                    color: "var(--color-dash-fg-bright)",
                    fontFamily: "var(--font-ibm-plex-mono)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {config.label}
                </span>
                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "var(--color-macro-carbs)",
                        fontFamily: "var(--font-ibm-plex-mono)",
                      }}
                    >
                      {mealKcal.toFixed(0)} kcal
                    </span>
                  )}
                  <Link
                    href={`/dashboard/add?mealType=${mealType}&date=${date.toISOString().split("T")[0]}`}
                    className="text-xl font-bold leading-none w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-dash-green-mid)" }}
                  >
                    +
                  </Link>
                </div>
              </div>

              {/* Elementy posiłku */}
              {items.map((item, idx) => {
                const macros = getItemMacros(item);
                const name =
                  item.recipe?.name ??
                  item.userRecipe?.name ??
                  item.product?.name;
                const imageUrl = item.product?.imageUrl;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 h-[50px] transition-opacity duration-300"
                    style={{
                      background: "var(--color-dash-surface-alt)",
                      borderTop:
                        idx > 0
                          ? "1px solid var(--color-dash-border)"
                          : undefined,
                      opacity: item.isEaten ? 0.5 : 1,
                    }}
                  >
                    {/* TODO(human): onClick -> wywołaj PATCH /diary/:id/eaten i zaktualizuj lokalny stan entries */}
                    <button
                      onClick={() => handleEaten(item.id, !item.isEaten)}
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: item.isEaten
                          ? "var(--color-dash-green-mid)"
                          : "transparent",
                        border: item.isEaten
                          ? "none"
                          : "1.5px solid var(--color-dash-check-border)",
                        boxShadow: item.isEaten
                          ? "var(--shadow-check-eaten)"
                          : "none",
                      }}
                      title={
                        item.isEaten
                          ? "Oznacz jako niezjedzone"
                          : "Oznacz jako zjedzone"
                      }
                    >
                      {item.isEaten && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="var(--color-dash-check-mark)"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Zdjęcie lub placeholder */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={name ?? "produkt"}
                        width={32}
                        height={32}
                        className="rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg shrink-0"
                        style={{ background: "var(--color-dash-placeholder)" }}
                      />
                    )}

                    {/* Nazwa + makro */}
                    <div className="flex items-center flex-1 gap-2 min-w-0">
                      <span
                        className="text-sm font-medium truncate flex-1 transition-all duration-300"
                        style={{
                          color: "var(--color-dash-fg-bright)",
                          textDecoration: item.isEaten
                            ? "line-through var(--color-dash-eaten-line)"
                            : "none",
                        }}
                      >
                        {name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {!item.recipe && !item.userRecipe && (
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-dash-fg-dim)" }}
                          >
                            {item.quantity}g
                          </span>
                        )}
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: "var(--color-macro-carbs)",
                            fontFamily: "var(--font-ibm-plex-mono)",
                          }}
                        >
                          {macros.calories.toFixed(0)} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-xs opacity-40 hover:opacity-80 transition-opacity ml-1"
                          style={{ color: "var(--color-macro-fat)" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
