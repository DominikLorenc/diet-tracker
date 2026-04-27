"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { RecipeCard } from "./RecipeCard";
import { UserRecipeCard, UserRecipe } from "./UserRecipeCard";

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

const calcGlobalTotalGrams = (recipe: Recipe): number =>
  recipe.products.reduce((sum, ing) => sum + parseFloat(ing.quantity), 0);

const calcUserTotalGrams = (recipe: UserRecipe): number =>
  recipe.userRecipeIngredients.reduce(
    (sum, ing) => sum + parseFloat(ing.quantity),
    0,
  );

type Props = {
  mealType: string;
  date: string;
};

export const RecipeSearch = ({ mealType, date }: Props) => {
  const showToast = useToastStore((state) => state.showToast);

  const [globalRecipes, setGlobalRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [favorites, setFavorites] = useState<RecipeFavorite[]>([]);
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [recipesRes, userRecipesRes, favRes] = await Promise.all([
        apiClient.GET("/recipes"),
        apiClient.GET("/user-recipes"),
        apiClient.GET("/favorites/recipes"),
      ]);
      if (recipesRes.data)
        setGlobalRecipes(recipesRes.data.recipes as unknown as Recipe[]);
      if (userRecipesRes.data)
        setUserRecipes(
          userRecipesRes.data.userRecipes as unknown as UserRecipe[],
        );
      if (favRes.data)
        setFavorites(favRes.data.favorites as unknown as RecipeFavorite[]);
      setIsLoading(false);
    };
    load();
  }, []);

  const addUserRecipeToDiary = async (recipe: UserRecipe, portion: number) => {
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
        userRecipeId: recipe.id,
        quantity: calcUserTotalGrams(recipe) * portion,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      showToast("success", "Dodano!", recipe.name);
    }
  };

  const addGlobalRecipeToDiary = async (recipe: Recipe, portion: number) => {
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
        quantity: calcGlobalTotalGrams(recipe) * portion,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      showToast("success", "Dodano!", recipe.name);
    }
  };

  const handleCopy = async (recipeId: string) => {
    const { error, data } = await apiClient.POST("/user-recipes/copy", {
      body: { sourceRecipeId: recipeId },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się skopiować przepisu");
    } else if (data?.userRecipe) {
      setUserRecipes((prev) => [
        ...prev,
        data.userRecipe as unknown as UserRecipe,
      ]);
      setCopiedIds((prev) => new Set([...prev, recipeId]));
      showToast("success", "Skopiowano!", "Dodano do Twoich przepisów");
    }
  };

  const handleDelete = async (recipeId: string) => {
    const { error } = await apiClient.DELETE("/user-recipes/{id}", {
      params: { path: { id: recipeId } },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się usunąć przepisu");
    } else {
      setUserRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      showToast("success", "Usunięto", "Przepis został usunięty");
    }
  };

  const handleFavoriteToggle = (recipeId: string, nowFavorite: boolean) => {
    if (!nowFavorite) {
      setFavorites((prev) => prev.filter((f) => f.recipeId !== recipeId));
    } else {
      const recipe = globalRecipes.find((r) => r.id === recipeId);
      if (recipe) {
        setFavorites((prev) => [
          ...prev,
          { id: `temp-${recipeId}`, recipeId, recipe },
        ]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const favoriteIds = new Set(favorites.map((f) => f.recipeId));
  const alreadyCopiedIds = new Set([
    ...copiedIds,
    ...userRecipes
      .filter((ur) => ur.sourceRecipeId !== null)
      .map((ur) => ur.sourceRecipeId as string),
  ]);

  const normalizedQuery = query.toLowerCase();
  const filteredUserRecipes = userRecipes.filter((r) =>
    r.name.toLowerCase().includes(normalizedQuery),
  );
  const filteredGlobalRecipes = globalRecipes.filter((r) => {
    if (onlyFavorites && !favoriteIds.has(r.id)) return false;
    return r.name.toLowerCase().includes(normalizedQuery);
  });

  return (
    <div className="flex flex-col gap-5">
      {/* ── WYSZUKIWARKA ── */}
      <div className="relative">
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
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj przepisów..."
          className="w-full bg-[#111C14] border border-[#1E3322] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F3F7FF] placeholder-[#4A5A4A] focus:outline-none focus:border-[#22C55E] transition-colors"
        />
      </div>
      {/* ── MOJE PRZEPISY ── */}
      <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase">
            Moje przepisy
          </h2>
          <Link
            href={`/dashboard/recipe-builder?mealType=${mealType}&date=${date}`}
            className="flex items-center gap-1 text-xs text-[#4ADE80] hover:text-white transition-colors font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nowy przepis
          </Link>
        </div>

        {userRecipes.length === 0 ? (
          <p className="text-[#8FA0B8] text-sm text-center py-4">
            Nie masz jeszcze swoich przepisów.
            <br />
            <span className="text-[#4A5A4A]">
              Stwórz nowy lub skopiuj globalny.
            </span>
          </p>
        ) : filteredUserRecipes.length === 0 ? (
          <p className="text-[#4A5A4A] text-sm text-center py-4">
            Brak wyników.
          </p>
        ) : (
          filteredUserRecipes.map((recipe) => (
            <UserRecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddToDiary={addUserRecipeToDiary}
              onDelete={handleDelete}
              editHref={`/dashboard/recipe-builder?id=${recipe.id}&mealType=${mealType}&date=${date}`}
            />
          ))
        )}
      </section>

      {/* ── PRZEPISY GLOBALNE ── */}
      {(query.trim().length > 0 || onlyFavorites) &&
        globalRecipes.length > 0 && (
          <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase">
                Przepisy globalne
              </h2>
              <button
                onClick={() => setOnlyFavorites((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  onlyFavorites
                    ? "text-[#22C55E]"
                    : "text-[#4A5A4A] hover:text-[#8FA0B8]"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={13}
                  height={13}
                  fill={onlyFavorites ? "#22C55E" : "none"}
                  stroke={onlyFavorites ? "#22C55E" : "#4A5A4A"}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Ulubione
              </button>
            </div>
            {filteredGlobalRecipes.length === 0 ? (
              <p className="text-[#4A5A4A] text-sm text-center py-4">
                {onlyFavorites ? "Brak ulubionych przepisów." : "Brak wyników."}
              </p>
            ) : (
              filteredGlobalRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={favoriteIds.has(recipe.id)}
                  onAddToDiary={addGlobalRecipeToDiary}
                  onFavoriteToggle={handleFavoriteToggle}
                  onCopy={handleCopy}
                  isCopied={alreadyCopiedIds.has(recipe.id)}
                />
              ))
            )}
          </section>
        )}
    </div>
  );
};
