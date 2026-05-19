"use client";

import { useState } from "react";
import { Card } from "@/app/_components/ui/Card";
import { Button } from "@/app/_components/ui/Button";
import { apiClient } from "@/app/lib/apiClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const map = new Map<string, number>();

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

  const isDateRangeInvalid = from > to;

  async function handleGenerate() {
    if (!from || !to) return;

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

  async function handleExportPDF() {
    const rows = visibleItems
      .map(
        (item) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">
          <span>${item.name}</span>
          <span style="color:#6b7280;margin-left:16px;">${item.grams} g</span>
        </div>`,
      )
      .join("");

    const el = document.createElement("div");
    el.style.cssText =
      "font-family:Arial,sans-serif;padding:32px;color:#111;width:700px;position:fixed;top:-9999px;left:-9999px;background:white;";
    el.innerHTML = `
      <h2 style="margin:0 0 4px;font-size:22px;">Lista zakupów</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:13px;">${from} — ${to}</p>
      ${rows}
    `;
    document.body.appendChild(el);

    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(el);

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const imgH = (canvas.height * pageW) / canvas.width;
    doc.addImage(imgData, "PNG", 0, 0, pageW, imgH);
    doc.save(`lista-zakupow-${from}-${to}.pdf`);
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
            disabled={isDateRangeInvalid}
          >
            Generuj listę
          </Button>
          {isDateRangeInvalid && (
            <p className="text-red-400 text-sm">
              Data &apos;Od&apos; musi być wcześniejsza niż data &apos;Do&apos;
            </p>
          )}
        </Card>

        {/* Krok 2 — lista zakupów */}
        {items !== null && (
          <Card className="gap-0">
            {/* Nagłówek listy */}
            <div className="flex items-center justify-between pb-4 border-b border-dash-border">
              <p className="text-dash-fg font-sans font-semibold text-sm">
                {visibleItems.length} pozycji
              </p>
              <div className="flex items-center gap-3">
                {removed.size > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-dash-fg-muted text-xs font-sans hover:text-dash-green transition-colors cursor-pointer"
                  >
                    ↺ Resetuj ({removed.size})
                  </button>
                )}
                {visibleItems.length > 0 && (
                  <button
                    onClick={handleExportPDF}
                    className="text-xs font-sans text-dash-fg-muted border border-dash-border rounded-lg px-3 py-1 hover:border-dash-green hover:text-dash-green transition-colors cursor-pointer"
                  >
                    ↓ PDF
                  </button>
                )}
              </div>
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
