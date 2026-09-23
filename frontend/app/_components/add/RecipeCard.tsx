"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { RecipeCardBody, RecipeCardToggle } from "./RecipeCardParts";
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
  steps: string[];
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
      className={`border-b border-ink ${expanded ? "bg-card" : ""} ${
        favorite ? "shadow-[inset_4px_0_0_var(--color-ink)] pl-3" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        <RecipeCardToggle
          name={recipe.name}
          ingredientCount={recipe.products.length}
          kcal={totalKcal}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />

        {onCopy && (
          <button
            type="button"
            onClick={handleCopy}
            disabled={copying || isCopied}
            className={`shrink-0 min-h-9 px-2 text-xs font-extrabold uppercase border-2 border-ink transition-colors ${
              isCopied
                ? "opacity-50 cursor-default"
                : "hover:bg-ink hover:text-paper cursor-pointer"
            }`}
          >
            {copying ? "…" : isCopied ? "Skopiowany" : "Kopiuj"}
          </button>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          className="w-11 h-11 shrink-0 flex items-center justify-center cursor-pointer"
          aria-pressed={favorite}
          aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
          <Star
            size={16}
            strokeWidth={2}
            fill={favorite ? "currentColor" : "none"}
            className={favorite ? "text-ink" : "text-ink-muted"}
          />
        </button>
      </div>

      {expanded && (
        <RecipeCardBody
          ingredients={recipe.products.map((ing) => ({
            id: ing.id,
            name: ing.product.name,
            quantity: ing.quantity,
          }))}
          steps={recipe.steps}
          portion={portion}
          onPortionChange={setPortion}
          kcal={totalKcal}
          adding={adding}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
};
