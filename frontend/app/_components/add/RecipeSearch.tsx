"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { RecipeCard } from "./RecipeCard";

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

type RecipeFavorite = {
  id: string;
  recipeId: string;
  recipe: Recipe;
};

const calcTotalGrams = (recipe: Recipe): number =>
  recipe.products.reduce((sum, ing) => {
    const qty = parseFloat(ing.quantity);
    return sum + qty;
  }, 0);

export const RecipeSearch = () => {
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<RecipeFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [recipesRes, favRes] = await Promise.all([
        apiClient.GET("/recipes"),
        apiClient.GET("/favorites/recipes"),
      ]);
      if (recipesRes.data)
        setRecipes(recipesRes.data.recipes as unknown as Recipe[]);
      if (favRes.data)
        setFavorites(favRes.data.favorites as unknown as RecipeFavorite[]);
      setIsLoading(false);
    };
    load();
  }, []);

  const favoriteIds = new Set(favorites.map((f) => f.recipeId));

  const addToDiary = async (recipe: Recipe, portion: number) => {
    const mealType = searchParams.get("mealType");
    const date = searchParams.get("date");

    if (!mealType || !date) {
      showToast(
        "error",
        "Brak parametrów",
        "Wróć do dziennika i spróbuj ponownie",
      );
      return;
    }

    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        recipeId: recipe.id,
        quantity: calcTotalGrams(recipe) * portion,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });

    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      showToast("success", "Dodano!", `${recipe.name}`);
    }
  };

  const handleFavoriteToggle = (recipeId: string, nowFavorite: boolean) => {
    // TODO(human): zaktualizuj lokalny stan `favorites`:
    // - jeśli nowFavorite === false → odfiltruj przepis z listy
    // - jeśli nowFavorite === true → dodaj tymczasowy obiekt do listy

    if (!nowFavorite) {
      setFavorites((prev) => prev.filter((f) => f.recipeId !== recipeId));
    }
  };

  /* ── Stany ładowania i pustej listy ── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 bg-[#111C14] rounded-xl border border-[#1E3322]">
        <p className="text-[#8FA0B8] mb-4 text-sm">
          Nie masz jeszcze żadnych przepisów
        </p>
        <Link
          href="/dashboard/recipe-builder"
          className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Przejdź do kreatora przepisów
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    );
  }

  const favoriteRecipes = favorites.map((f) => f.recipe);
  const allOtherRecipes = recipes.filter((r) => !favoriteIds.has(r.id));

  return (
    <div className="flex flex-col gap-5">
      {/* ── Ulubione przepisy ── */}
      {favoriteRecipes.length > 0 && (
        <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase">
              Ulubione przepisy
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={13}
              height={13}
              fill="#4ADE80"
              stroke="#4ADE80"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          {favoriteRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite
              onAddToDiary={addToDiary}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </section>
      )}

      {/* ── Wszystkie przepisy (poza ulubionymi) ── */}
      <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
        <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase mb-3">
          Wszystkie przepisy
        </h2>

        {allOtherRecipes.length === 0 && favoriteRecipes.length > 0 ? (
          <p className="text-[#4A5A4A] text-sm text-center py-3">
            Wszystkie przepisy są w ulubionych
          </p>
        ) : (
          allOtherRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={false}
              onAddToDiary={addToDiary}
              onFavoriteToggle={(id, now) => {
                // TODO(human): gdy now === true dodaj przepis do listy favorites
                if (now) {
                  setFavorites((prev) => [
                    ...prev,
                    { id: `temp-${id}`, recipeId: id, recipe },
                  ]);
                }
              }}
            />
          ))
        )}
      </section>
    </div>
  );
};
