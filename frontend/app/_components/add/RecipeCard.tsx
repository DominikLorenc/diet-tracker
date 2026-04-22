"use client";

import { useState } from "react";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

type RecipeIngredient = {
  id: string;
  quantity: string;
  product: {
    id: string;
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    imageUrl: string;
    createdAt: string;
  };
};

type Recipe = {
  id: string;
  name: string;
  createdAt: string;
  products: RecipeIngredient[];
};

type Props = {
  recipe: Recipe;
  isFavorite?: boolean;
  onAddToDiary: (recipe: Recipe, portion: number) => Promise<void>;
  onFavoriteToggle?: (recipeId: string, nowFavorite: boolean) => void;
  defaultExpanded?: boolean;
  onCopy?: (recipeId: string) => Promise<void>;
  isCopied?: boolean;
};

// Liczymy łączne kalorie przepisu ze wszystkich składników
const calcTotalKcal = (recipe: Recipe, portion: number): number =>
  recipe.products.reduce((sum, ing) => {
    const qty = parseFloat(ing.quantity);
    const kcal = parseFloat(ing.product.calories);
    return sum + (qty / 100) * kcal * portion;
  }, 0);

export const RecipeCard = ({
  recipe,
  isFavorite = false,
  onAddToDiary,
  onFavoriteToggle,
  defaultExpanded = false,
  onCopy,
  isCopied = false,
}: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [portion, setPortion] = useState(1);
  const [favorite, setFavorite] = useState(isFavorite);
  const [adding, setAdding] = useState(false);
  const [copying, setCopying] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopying(true);
    await onCopy?.(recipe.id);
    setCopying(false);
  };

  const totalKcal = calcTotalKcal(recipe, portion);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next); // optimistic update

    // TODO(human): wywołaj odpowiedni endpoint:
    //   - next === true  → POST /favorites/recipes { body: { recipeId } }
    //   - next === false → DELETE /favorites/recipes/{recipeId}
    // Jeśli error: cofnij stan setFavorite(!next) i pokaż toast
    // Po sukcesie: onFavoriteToggle?.(recipe.id, next)

    if (next) {
      const { error } = await apiClient.POST("/favorites/recipes", {
        body: { recipeId: recipe.id },
      });
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się dodać do ulubionych");
      } else {
        onFavoriteToggle?.(recipe.id, true);
      }
    } else {
      const { error } = await apiClient.DELETE(
        "/favorites/recipes/{recipeId}",
        { params: { path: { recipeId: recipe.id } } },
      );
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się usunąć z ulubionych");
      } else {
        onFavoriteToggle?.(recipe.id, false);
      }
    }
  };

  const handleAdd = async () => {
    setAdding(true);
    await onAddToDiary(recipe, portion);
    setAdding(false);
    setExpanded(false);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden cursor-pointer mb-2 transition-colors ${
        favorite
          ? "bg-[#1A2420] border-[#22C55E20]"
          : "bg-[#131E15] border-[#1E3322]"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Wiersz nagłówka karty przepisu */}
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Ikona przepisu */}
        <div className="w-9 h-9 rounded-lg bg-[#1A2820] shrink-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>

        {/* Nazwa + kalorie łącznie */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-[#F3F7FF] font-semibold text-sm truncate">
            {recipe.name}
          </p>
          <p className="text-[#8FA0B8] text-xs">
            {recipe.products.length} składników · ~{totalKcal.toFixed(0)} kcal
            łącznie
          </p>
        </div>

        {/* Kalorie */}
        <span className="text-[#F4C65D] font-mono font-bold text-sm shrink-0">
          {totalKcal.toFixed(0)} kcal
        </span>

        {/* Przycisk ulubionych lub kopiowania */}
        {onCopy ? (
          <button
            onClick={handleCopy}
            disabled={copying || isCopied}
            className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-md transition-colors border ${
              isCopied
                ? "bg-[#1A2420] text-[#4A5A4A] border-dash-border cursor-default"
                : copying
                  ? "bg-[#1A2820] text-[#4ADE80] border-[#22C55E30] opacity-60"
                  : "bg-[#1A2820] text-[#4ADE80] border-[#22C55E30] hover:border-dash-green-mid hover:bg-dash-border"
            }`}
          >
            {copying ? "..." : isCopied ? "Skopiowany" : "Kopiuj"}
          </button>
        ) : (
          <button
            onClick={toggleFavorite}
            className="shrink-0 transition-colors"
            aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={15}
              height={15}
              fill={favorite ? "#22C55E" : "none"}
              stroke={favorite ? "#22C55E" : "#4A5A4A"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="#4A5A4A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Panel po rozwinięciu */}
      {expanded && (
        <div
          className="border-t border-[#1E3322] bg-[#1A2B1F] px-3 py-3 flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lista składników */}
          {recipe.products.length > 0 && (
            <div className="flex flex-col gap-1">
              {recipe.products.map((ing) => (
                <div key={ing.id} className="flex justify-between text-xs">
                  <span className="text-[#8FA0B8]">{ing.product.name}</span>
                  <span className="text-[#4A5A4A]">{ing.quantity}g</span>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-[#1E3322]" />

          {/* Porcje + przycisk */}
          <div className="flex items-center gap-3">
            <label className="text-[#8FA0B8] text-xs shrink-0">Porcje:</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPortion((p) => Math.max(0.5, p - 0.5))}
                className="w-7 h-7 rounded-lg bg-[#0F1A10] border border-[#1E3322] text-[#8FA0B8] hover:text-white hover:border-[#22C55E] transition-colors flex items-center justify-center text-base leading-none"
              >
                −
              </button>
              <span className="w-8 text-center text-white text-sm font-mono">
                {portion}
              </span>
              <button
                onClick={() => setPortion((p) => p + 0.5)}
                className="w-7 h-7 rounded-lg bg-[#0F1A10] border border-[#1E3322] text-[#8FA0B8] hover:text-white hover:border-[#22C55E] transition-colors flex items-center justify-center text-base leading-none"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="ml-auto bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              {adding ? "Dodaję..." : "Dodaj"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
