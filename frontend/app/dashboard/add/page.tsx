"use client";

import { Suspense, useEffect, useState } from "react";
import { pageClass } from "@/app/_components/ui/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductSearch } from "@/app/_components/add/ProductSearch";
import { RecipeSearch } from "@/app/_components/add/RecipeSearch";
import { ProductForm } from "@/app/_components/shared/ProductForm";
import { useUserStore } from "@/store/useUserStore";
import { parseLocalDate, todayLocal } from "@/utils/date";
import { MEAL_LABELS, guessMealTypeByHour } from "@/app/lib/mealTypes";

type Tab = "products" | "recipes" | "new";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
};

function AddPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // UI gate only — POST /products is admin-only, so this just avoids offering
  // a form that the API would reject anyway.
  const isAdmin = useUserStore((state) => state.user?.role === "ADMIN");

  const requestedTab = (searchParams.get("tab") as Tab) ?? "products";
  // ?tab=new is reachable by hand-editing the URL, so fall back for non-admins
  // instead of rendering an empty page.
  const currentTab =
    requestedTab === "new" && !isAdmin ? "products" : requestedTab;
  const mealType = searchParams.get("mealType") ?? "";
  const date = searchParams.get("date") ?? "";
  const [newlyCreatedProduct, setNewlyCreatedProduct] =
    useState<Product | null>(null);

  // Child searches read mealType/date straight from the URL, so missing params
  // must be filled in the URL itself, not just in local state.
  useEffect(() => {
    if (mealType && date) return;
    const params = new URLSearchParams(searchParams.toString());
    if (!mealType) {
      params.set("mealType", guessMealTypeByHour(new Date().getHours()));
    }
    if (!date) {
      params.set("date", todayLocal());
    }
    router.replace(`?${params.toString()}`);
  }, [mealType, date, searchParams, router]);

  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };
  const setMealType = (meal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mealType", meal);
    router.replace(`?${params.toString()}`);
  };
  const handleNewProductSuccess = (product: Product) => {
    setNewlyCreatedProduct(product);
    setTab("products");
  };

  const formattedDate = date
    ? parseLocalDate(date).toLocaleDateString("pl-PL", {
        weekday: "short",
        day: "numeric",
        month: "long",
      })
    : "";

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: "products", label: "Produkty" },
    { id: "recipes", label: "Przepisy" },
    { id: "new", label: "Nowy produkt", adminOnly: true },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className={pageClass("narrow")}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard"
          aria-label="Wróć do dziennika"
          className="w-11 h-11 shrink-0 border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
        >
          <ChevronLeft size={18} strokeWidth={2.5} strokeLinecap="square" />
        </Link>
        <h1 className="font-display text-[40px] sm:text-[52px] uppercase leading-none [font-stretch:68%]">
          Dodaj
        </h1>
      </div>

      <div className="flex flex-col gap-2 border-y-2 border-ink py-2">
        <div className="flex items-baseline justify-between gap-3">
          <span
            id="meal-picker-label"
            className="text-sm font-extrabold uppercase"
          >
            Do:
          </span>
          {formattedDate && (
            <span className="font-mono text-xs uppercase">{formattedDate}</span>
          )}
        </div>
        <div
          role="radiogroup"
          aria-labelledby="meal-picker-label"
          className="grid grid-cols-4 gap-1.5"
        >
          {Object.entries(MEAL_LABELS).map(([value, label]) => {
            const isSelected = mealType === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setMealType(value)}
                className={`min-w-0 px-1 py-1.5 border-2 border-ink text-[11px] sm:text-xs uppercase truncate cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-ink text-paper font-extrabold"
                    : "font-semibold hover:bg-ink hover:text-paper"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div
        role="tablist"
        className="flex gap-5 border-b border-ink overflow-x-auto"
      >
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={currentTab === tab.id}
            onClick={() => setTab(tab.id)}
            className={`py-2 text-sm uppercase whitespace-nowrap cursor-pointer transition-colors ${
              currentTab === tab.id
                ? "font-extrabold text-ink shadow-[inset_0_-4px_0_var(--color-ink)]"
                : "font-semibold text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentTab === "products" && (
        <ProductSearch
          onGoToNewProduct={isAdmin ? () => setTab("new") : undefined}
          newlyCreatedProduct={newlyCreatedProduct}
          setNewlyCreatedProduct={setNewlyCreatedProduct}
        />
      )}

      {currentTab === "recipes" && (
        <RecipeSearch mealType={mealType} date={date} />
      )}

      {currentTab === "new" && isAdmin && (
        <div className="border-2 border-ink bg-card p-4 sm:p-6">
          <ProductForm onSuccess={handleNewProductSuccess} />
        </div>
      )}
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense>
      <AddPageContent />
    </Suspense>
  );
}
