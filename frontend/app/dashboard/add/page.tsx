"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductSearch } from "@/app/_components/add/ProductSearch";
import { RecipeSearch } from "@/app/_components/add/RecipeSearch";
import { ProductForm } from "@/app/_components/shared/ProductForm";

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

// Ikona słońca dla posiłku Śniadanie — dobierana do mealType z URL
const MEAL_ICONS: Record<string, string> = {
  BREAKFAST: "☀️",
  LUNCH: "🌤️",
  DINNER: "🌙",
  SNACK: "🍎",
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

  const currentTab = (searchParams.get("tab") as Tab) ?? "products";
  const mealType = searchParams.get("mealType") ?? "";
  const date = searchParams.get("date") ?? "";
  const [newlyCreatedProduct, setNewlyCreatedProduct] =
    useState<Product | null>(null);

  // Zmiana zakładki — zachowujemy mealType i date w URL
  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  // Po zapisaniu nowego produktu → przechodzimy do zakładki Produkty
  // i przekazujemy nowy produkt żeby go od razu pokazać z otwartą kartą
  const handleNewProductSuccess = (product: Product) => {
    setNewlyCreatedProduct(product);
    setTab("products");
  };

  // Formatujemy datę do czytelnego formatu
  const formattedDate = date
    ? new Date(date).toLocaleDateString("pl-PL", {
        weekday: "short",
        day: "numeric",
        month: "long",
      })
    : "";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "products",
      label: "Produkty",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      id: "recipes",
      label: "Przepisy",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      ),
    },
    {
      id: "new",
      label: "Nowy produkt",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full py-8 px-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        {/* Powrót do dziennika */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 bg-[#1A2420] border border-[#1E3322] hover:border-[#4A5A4A] transition-colors px-3 py-2 rounded-lg text-[#8FA0B8] text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Dziennik
        </Link>

        {/* Tytuł strony */}
        <h1 className="text-[#F3F7FF] text-2xl font-bold flex-1">
          Dodaj do dziennika
        </h1>

        {/* Odznaka posiłku + data */}
        {mealType && (
          <div className="flex items-center gap-1.5 bg-[#1A2E1A] border border-[#22C55E30] px-3.5 py-2 rounded-full text-sm">
            <span>{MEAL_ICONS[mealType] ?? "🍽️"}</span>
            <span className="text-[#4ADE80] font-semibold">
              {MEAL_LABELS[mealType] ?? mealType}
            </span>
            {formattedDate && (
              <span className="text-[#8FA0B8]">· {formattedDate}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 mb-6 bg-[#111C14] p-1 rounded-xl border border-[#1E3322]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
              currentTab === tab.id
                ? "bg-gradient-to-b from-[#16A34A] to-[#15803D] text-[#DCFCE7] shadow-[0_2px_8px_#22C55E30]"
                : "text-[#8FA0B8] hover:text-[#F3F7FF]"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Zawartość zakładek ── */}

      {currentTab === "products" && (
        <ProductSearch
          onGoToNewProduct={() => setTab("new")}
          newlyCreatedProduct={newlyCreatedProduct}
        />
      )}

      {currentTab === "recipes" && <RecipeSearch />}

      {currentTab === "new" && (
        <div className="bg-[#111C14] rounded-2xl border border-[#1E3322] p-6">
          <h2 className="text-[#F3F7FF] font-bold text-lg mb-6">
            Nowy produkt
          </h2>
          {/* ProductForm — po zapisaniu wraca do zakładki Produkty i otwiera kartę nowego */}
          <ProductForm onSuccess={handleNewProductSuccess} />
        </div>
      )}
    </div>
  );
}

export default function AddPage() {
  return (
    // Suspense potrzebny bo useSearchParams() w Next.js App Router
    // wymaga granicy Suspense po stronie klienta
    <Suspense>
      <AddPageContent />
    </Suspense>
  );
}
