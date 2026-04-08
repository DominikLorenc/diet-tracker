"use client";

import { useState, useEffect } from "react";
import { DateNavigator } from "./DateNavigator";
import { MacroSummary } from "./MacroSummary";
import { Modal } from "../shared/Modal";
import { Search } from "../search/Search";
import Link from "next/link";
import Image from "next/image";
import { useToastStore } from "@/store/useToastStore";

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

export interface DiaryItem {
  id: string;
  diaryEntryId: string;
  productId: string | null;
  recipeId: string | null;
  mealType: MealType;
  createdAt: string;
  quantity: string;
  product: Product | null;
  recipe: Recipe | null;
}

export function getItemMacros(item: DiaryItem) {
  const qty = parseFloat(item.quantity);
  if (item.recipe) {
    const totals = item.recipe.products.reduce(
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
    const multiplier = qty / 100;
    return {
      calories: totals.calories * multiplier,
      protein: totals.protein * multiplier,
      carbs: totals.carbs * multiplier,
      fat: totals.fat * multiplier,
    };
  }
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

const MEAL_CONFIG: Record<MealType, string> = {
  BREAKFAST: "Śniadanie",
  LUNCH: "Obiad",
  DINNER: "Kolacja",
  SNACK: "Przekąska",
};

export const DiaryDayView = () => {
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const allItems = entries[0]?.items ?? [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/diary?date=${date.toISOString().split("T")[0]}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await response.json();
        setEntries(data.diaryEntries as DiaryEntriesResponse);
      } catch {
        setError("Błąd pobierania danych");
      }
    };
    fetchData();
  }, [date]);

  const showToast = useToastStore((state) => state.showToast);
  const [openModal, setOpenModal] = useState(false);

  const handleDeleteItem = (id: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/diary/${id}/item`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        const data = await response.json();
        throw new Error(data.message);
      })
      .then(() => {
        setEntries(
          entries.map((entry) => ({
            ...entry,
            items: entry.items.filter((item) => item.id !== id),
          })),
        );
        showToast("error", "Wpis usunięty");
      })
      .catch(() => {
        showToast(
          "error",
          "Nie udało się usunąć wpisu",
          "Spróbuj ponownie lub odśwież stronę",
        );
      });
  };

  console.log(allItems);

  return (
    <div className="flex flex-col gap-4 p-6 w-full max-w-3xl">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <DateNavigator date={date} onDateChange={setDate} />
      {MEAL_TYPES.map((mealType) => {
        const items = allItems.filter((item) => item.mealType === mealType);
        return (
          <div
            key={mealType}
            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                {MEAL_CONFIG[mealType]}
              </h2>
              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <span className="text-sm font-semibold text-yellow-400">
                    {items
                      .reduce(
                        (sum, item) => sum + getItemMacros(item).calories,
                        0,
                      )
                      .toFixed(0)}{" "}
                    kcal
                  </span>
                )}
                <Link
                  href={`/dashboard/add?mealType=${mealType}&date=${date.toISOString().split("T")[0]}`}
                  className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center text-white text-sm font-bold"
                >
                  +
                </Link>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-white/20">Brak wpisów</p>
              ) : (
                items.map((item) => {
                  const macros = getItemMacros(item);
                  const name = item.recipe
                    ? item.recipe.name
                    : item.product?.name;

                  const imageUrl = item.product?.imageUrl;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={name ?? "product"}
                          width={50}
                          height={50}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-700 shrink-0" />
                      )}
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {name}
                          </span>
                          <span className="text-sm font-semibold text-yellow-400 shrink-0">
                            {macros.calories.toFixed(0)} kcal
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-white/40">
                          {!item.recipe && <span>{item.quantity} g</span>}
                          <span>B: {macros.protein.toFixed(1)}g</span>
                          <span>W: {macros.carbs.toFixed(1)}g</span>
                          <span>T: {macros.fat.toFixed(1)}g</span>
                          <button onClick={() => handleDeleteItem(item.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
      <MacroSummary items={allItems} />
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Search />
      </Modal>
    </div>
  );
};
