"use client";

import { useState } from "react";
import { Card } from "@/app/_components/ui/Card";
import { Button } from "@/app/_components/ui/Button";
import { apiClient } from "@/app/lib/apiClient";

type ShoppingItem = {
  name: string;
  grams: number;
};

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

const fetchData = async (dates: string[]) => {
  const result = await Promise.all(
    dates.map(async (date) => {
      const { data, error } = await apiClient.GET("/diary", {
        params: { query: { date } },
      });
      if (error) {
        console.log("Błąd pobierania danych");
      } else if (data) {
        return data.diaryEntries;
      }
    }),
  );

  return result;
};

async function generateShoppingList(
  from: string,
  to: string,
): Promise<ShoppingItem[]> {
  const dates = getDatesInRange(from, to);

  const entries = await fetchData(dates);

  const map = new Map<string, number>(); // nazwa → łączna ilość gramów

  console.log(entries);

  for (const item of entries) {
    item?.forEach((entry) => {
      if (entry.items) {
        entry.items.forEach((item) => {
          if (item.product) {
            const quantity = map.get(item.product.name) ?? 0;
            map.set(item.product.name, quantity + Number(item.quantity));
          }

          if (item.recipe?.products) {
            const totalWeight = item.recipe.products.reduce(
              (sum, p) => sum + Number(p.quantity),
              0,
            );
            const scale = Number(item.quantity) / totalWeight;

            item.recipe.products.forEach((product) => {
              const quantity = map.get(product.product.name) ?? 0;
              map.set(
                product.product.name,
                quantity + Number(product.quantity) * scale,
              );
            });
          }

          if (item.userRecipe?.userRecipeIngredients) {
            const totalIngridentSum =
              item.userRecipe.userRecipeIngredients.reduce(
                (sum, ingredient) => sum + Number(ingredient.quantity),
                0,
              );

            const scale = Number(item.quantity) / totalIngridentSum;

            item.userRecipe.userRecipeIngredients.forEach((ingredient) => {
              const quantity = map.get(ingredient.product.name) ?? 0;
              map.set(
                ingredient.product.name,
                quantity + Number(ingredient.quantity) * scale,
              );
            });
          }
        });
      }
    });
  }
  return Array.from(map.entries())
    .map(([name, grams]) => ({ name, grams: Math.round(grams) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getDefaultDates() {
  const today = new Date();
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 6);
  return {
    from: today.toISOString().split("T")[0],
    to: weekLater.toISOString().split("T")[0],
  };
}

const defaultDates = getDefaultDates();

export default function ShoppingListPage() {
  const [from, setFrom] = useState(defaultDates.from);
  const [to, setTo] = useState(defaultDates.to);
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const visibleItems = items?.filter((i) => !removed.has(i.name)) ?? [];

  async function handleGenerate() {
    setIsLoading(true);
    const items = await generateShoppingList(from, to);
    setItems(items);
    setIsLoading(false);
  }

  function handleRemove(name: string) {
    setRemoved(new Set([...removed, name]));
  }

  function handleReset() {
    setRemoved(new Set());
  }

  return (
    <main className="min-h-screen bg-[#0F1A10] p-6 md:p-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-green shadow-green-glow flex items-center justify-center text-lg">
            🛒
          </div>
          <div>
            <h1 className="text-dash-fg font-sans font-bold text-xl leading-tight">
              Lista zakupów
            </h1>
            <p className="text-dash-fg-muted text-sm font-sans">
              Generuj z planu posiłków
            </p>
          </div>
        </div>

        {/* Krok 1 — wybór dat */}
        <Card>
          <p className="text-dash-fg-secondary text-xs font-sans font-semibold uppercase tracking-widest">
            Zakres dat
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex flex-col gap-1.5 flex-1">
              <span className="text-dash-fg-muted text-xs font-sans">Od</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-[#0F1A10] border border-dash-border rounded-xl px-4 py-2.5 text-dash-fg text-sm font-sans focus:outline-none focus:border-dash-green transition-colors"
              />
            </label>
            <label className="flex flex-col gap-1.5 flex-1">
              <span className="text-dash-fg-muted text-xs font-sans">Do</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-[#0F1A10] border border-dash-border rounded-xl px-4 py-2.5 text-dash-fg text-sm font-sans focus:outline-none focus:border-dash-green transition-colors"
              />
            </label>
          </div>
          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            className="w-full mt-1"
          >
            Generuj listę
          </Button>
        </Card>

        {/* Krok 2 — lista zakupów */}
        {items !== null && (
          <Card className="gap-0">
            {/* Nagłówek listy */}
            <div className="flex items-center justify-between pb-4 border-b border-dash-border">
              <p className="text-dash-fg font-sans font-semibold text-sm">
                {visibleItems.length} pozycji
              </p>
              {removed.size > 0 && (
                <button
                  onClick={handleReset}
                  className="text-dash-fg-muted text-xs font-sans hover:text-dash-green transition-colors cursor-pointer"
                >
                  ↺ Resetuj ({removed.size})
                </button>
              )}
            </div>

            {/* Pozycje */}
            <ul className="flex flex-col divide-y divide-dash-border">
              {visibleItems.length === 0 ? (
                <li className="py-8 text-center text-dash-fg-muted text-sm font-sans">
                  Wszystko masz już w domu 🎉
                </li>
              ) : (
                visibleItems.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-dash-green shrink-0" />
                      <span className="text-dash-fg font-sans text-sm truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-dash-fg-muted font-sans text-sm tabular-nums">
                        {item.grams} g
                      </span>
                      <button
                        onClick={() => handleRemove(item.name)}
                        className="text-xs font-sans text-dash-fg-muted border border-dash-border rounded-lg px-3 py-1 hover:border-dash-green hover:text-dash-green transition-colors cursor-pointer"
                      >
                        Mam już
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        )}

        {/* Empty state — przed wygenerowaniem */}
        {items === null && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">📋</span>
            <p className="text-dash-fg-muted font-sans text-sm">
              Wybierz zakres dat i wygeneruj listę zakupów
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
