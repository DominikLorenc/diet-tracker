"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";
import { Button } from "@/app/_components/ui/Button";
import { apiClient } from "@/app/lib/apiClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ProductCategory,
} from "@/app/lib/productCategories";

type ShoppingItem = {
  name: string;
  grams: number;
  category: ProductCategory;
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

type OnProgress = (current: number, total: number) => void;

const fetchData = async (dates: string[], onProgress?: OnProgress) => {
  const result = [];

  for (const [index, date] of dates.entries()) {
    const { data, error } = await apiClient.GET("/diary", {
      params: { query: { date } },
    });
    if (error) {
      console.log("Błąd pobierania danych");
    } else if (data) {
      result.push(data.diaryEntries);
    }
    onProgress?.(index + 1, dates.length);
  }

  return result;
};

async function generateShoppingList(
  from: string,
  to: string,
  onProgress?: OnProgress,
): Promise<ShoppingItem[]> {
  const dates = getDatesInRange(from, to);

  const entries = await fetchData(dates, onProgress);

  // Keyed by product name (unique in the catalog). Grams accumulate across every
  // diary hit, while the category belongs to the product itself and is simply
  // carried along rather than combined.
  const map = new Map<string, { grams: number; category: ProductCategory }>();

  const addToList = (
    product: { name: string; category: ProductCategory },
    grams: number,
  ) => {
    const current = map.get(product.name);
    map.set(product.name, {
      grams: (current?.grams ?? 0) + grams,
      category: product.category,
    });
  };

  for (const item of entries) {
    item?.forEach((entry) => {
      if (entry.items) {
        entry.items.forEach((item) => {
          if (item.product) {
            addToList(item.product, Number(item.quantity));
          }

          if (item.recipe?.products) {
            const totalWeight = item.recipe.products.reduce(
              (sum, p) => sum + Number(p.quantity),
              0,
            );
            const scale = Number(item.quantity) / totalWeight;

            item.recipe.products.forEach((product) => {
              addToList(product.product, Number(product.quantity) * scale);
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
              addToList(
                ingredient.product,
                Number(ingredient.quantity) * scale,
              );
            });
          }
        });
      }
    });
  }
  return Array.from(map.entries())
    .map(([name, { grams, category }]) => ({
      name,
      grams: Math.round(grams),
      category,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Sections follow CATEGORY_ORDER (the in-store route) rather than the order
// items happen to appear in. Empty categories are dropped so no aisle shows up
// with nothing under it.
function groupByCategory(
  items: ShoppingItem[],
): { category: ProductCategory; items: ShoppingItem[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((section) => section.items.length > 0);
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
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const visibleItems = items?.filter((i) => !removed.has(i.name)) ?? [];
  const sections = groupByCategory(visibleItems);

  const isDateRangeInvalid = from > to;

  async function handleGenerate() {
    if (!from || !to) return;

    setIsLoading(true);
    const items = await generateShoppingList(from, to, (current, total) =>
      setProgress({ current, total }),
    );
    setItems(items);
    setIsLoading(false);
    setProgress(null);
  }

  function handleRemove(name: string) {
    setRemoved(new Set([...removed, name]));
  }

  function handleReset() {
    setRemoved(new Set());
  }

  async function handleExportPDF() {
    // Mirrors the on-screen sections so the printout matches what was reviewed.
    const rows = sections
      .map(
        (section) => `
        <h3 style="margin:20px 0 4px;font-size:11px;font-weight:bold;color:#6b675e;text-transform:uppercase;letter-spacing:0.08em;">
          ${CATEGORY_LABELS[section.category]}
        </h3>
        ${section.items
          .map(
            (item) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #111111;font-size:14px;">
          <span>${item.name}</span>
          <span style="color:#6b675e;margin-left:16px;">${item.grams} g</span>
        </div>`,
          )
          .join("")}`,
      )
      .join("");

    const el = document.createElement("div");
    el.style.cssText =
      "font-family:Arial,sans-serif;padding:32px;color:#111;width:700px;position:fixed;top:-9999px;left:-9999px;background:white;";
    el.innerHTML = `
      <h2 style="margin:0 0 4px;font-size:22px;">Lista zakupów</h2>
      <p style="margin:0 0 24px;color:#6b675e;font-size:13px;">${from} — ${to}</p>
      ${rows}
    `;
    document.body.appendChild(el);

    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "white",
    });
    document.body.removeChild(el);

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const imgH = (canvas.height * pageW) / canvas.width;
    doc.addImage(imgData, "PNG", 0, 0, pageW, imgH);
    doc.save(`lista-zakupow-${from}-${to}.pdf`);
  }

  const dateInputClass =
    "h-12 px-3 border-2 border-ink bg-card font-mono text-[15px] text-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent";

  return (
    <div className={pageClass("narrow")}>
      <PageHeader title="Lista zakupów" eyebrow="Z planu posiłków" />

      {/* Krok 1 — wybór dat */}
      <section
        aria-label="Zakres dat"
        className="border-2 border-ink bg-card px-3 pt-1.5 pb-3 flex flex-col gap-3"
      >
        <h2 className="font-display text-[30px] leading-none">Zakres dat</h2>
        <div className="rule-thick" />
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-extrabold uppercase">Od</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={dateInputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-extrabold uppercase">Do</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-invalid={isDateRangeInvalid}
              className={dateInputClass}
            />
          </label>
        </div>
        {isDateRangeInvalid && (
          <p role="alert" className="font-mono text-xs text-accent">
            Data „Od” musi być wcześniejsza niż data „Do”.
          </p>
        )}
        <Button
          onClick={handleGenerate}
          isLoading={isLoading}
          className="w-full"
          disabled={isDateRangeInvalid}
        >
          Generuj listę
        </Button>
        {progress && (
          <p role="status" className="font-mono text-xs">
            Pobieranie {progress.current} z {progress.total} dni…
          </p>
        )}
      </section>

      {/* Krok 2 — lista zakupów */}
      {items !== null && (
        <section aria-labelledby="shopping-list-heading">
          <div className="flex items-center justify-between gap-3 border-b-[5px] border-ink pb-1">
            <h2
              id="shopping-list-heading"
              className="font-display text-[26px] uppercase"
            >
              Do kupienia
              <span className="font-mono text-sm font-semibold normal-case ml-2">
                {visibleItems.length}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {removed.size > 0 && (
                <button
                  onClick={handleReset}
                  className="min-h-9 px-2 text-xs font-extrabold uppercase underline underline-offset-4 hover:text-accent cursor-pointer"
                >
                  Przywróć ({removed.size})
                </button>
              )}
              {visibleItems.length > 0 && (
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 min-h-9 px-3 border-2 border-ink text-xs font-extrabold uppercase hover:bg-ink hover:text-paper transition-colors cursor-pointer"
                >
                  <Download size={14} strokeWidth={2.5} />
                  PDF
                </button>
              )}
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <p className="mt-3 py-6 px-4 border-2 border-dashed border-ink text-sm font-extrabold uppercase">
              Wszystko masz już w domu.
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.category} className="pt-4">
                <h3 className="flex items-baseline justify-between text-xs font-extrabold uppercase border-b-2 border-ink pb-1">
                  {CATEGORY_LABELS[section.category]}
                  <span className="font-mono font-medium">
                    {section.items.length}
                  </span>
                </h3>
                <ul>
                  {section.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-3 min-h-12 border-b border-ink"
                    >
                      <span className="text-[15px] font-bold truncate">
                        {item.name}
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-sm tabular-nums">
                          {item.grams} g
                        </span>
                        <button
                          onClick={() => handleRemove(item.name)}
                          aria-label={`Mam już: ${item.name}`}
                          className="min-h-9 px-2.5 border-2 border-ink text-xs font-extrabold uppercase hover:bg-ink hover:text-paper transition-colors cursor-pointer"
                        >
                          Mam już
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      )}

      {/* Empty state — przed wygenerowaniem */}
      {items === null && !isLoading && (
        <p className="py-6 px-4 border-2 border-dashed border-ink text-sm">
          <strong className="font-extrabold uppercase">Pusto.</strong> Wybierz
          zakres dat i wygeneruj listę z posiłków zapisanych w dzienniku.
        </p>
      )}
    </div>
  );
}
