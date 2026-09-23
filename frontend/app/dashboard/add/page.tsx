"use client";

import { Suspense, useState } from "react";
import { pageClass } from "@/app/_components/ui/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductSearch } from "@/app/_components/add/ProductSearch";
import { RecipeSearch } from "@/app/_components/add/RecipeSearch";
import { ProductForm } from "@/app/_components/shared/ProductForm";
import { useUserStore } from "@/store/useUserStore";

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

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Śniadanie",
  LUNCH: "Obiad",
  DINNER: "Kolacja",
  SNACK: "Przekąska",
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

  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };
  const handleNewProductSuccess = (product: Product) => {
    setNewlyCreatedProduct(product);
    setTab("products");
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString("pl-PL", {
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

      {mealType && (
        <p className="flex items-baseline justify-between gap-3 border-y-2 border-ink py-2">
          <span className="text-sm font-extrabold uppercase">
            Do: {MEAL_LABELS[mealType] ?? mealType}
          </span>
          {formattedDate && (
            <span className="font-mono text-xs uppercase">{formattedDate}</span>
          )}
        </p>
      )}

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
