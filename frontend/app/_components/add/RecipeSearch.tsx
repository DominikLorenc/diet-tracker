"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
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
  steps: string[];
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
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
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
    <div className="flex flex-col gap-7">
      {/* ── WYSZUKIWARKA ── */}
      <label className="flex items-center gap-2 h-[52px] px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <Search
          size={18}
          strokeWidth={2.5}
          strokeLinecap="square"
          aria-hidden="true"
        />
        <span className="sr-only">Szukaj przepisów</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj przepisów…"
          className="flex-1 min-w-0 bg-transparent text-base font-semibold text-ink placeholder:text-ink-muted placeholder:font-normal outline-none"
        />
      </label>
      {/* ── MOJE PRZEPISY ── */}
      <section aria-labelledby="my-recipes-heading">
        <div className="flex items-baseline justify-between border-b-[5px] border-ink pb-0.5">
          <h2
            id="my-recipes-heading"
            className="font-display text-[26px] uppercase"
          >
            Moje przepisy
          </h2>
          <Link
            href={`/dashboard/recipe-builder?mealType=${mealType}&date=${date}`}
            className="flex items-center gap-1 min-h-9 text-xs font-extrabold uppercase text-accent hover:text-accent-hover"
          >
            <Plus size={14} strokeWidth={3} strokeLinecap="square" />
            Nowy przepis
          </Link>
        </div>

        {userRecipes.length === 0 ? (
          <p className="mt-3 py-5 px-4 border-2 border-dashed border-ink text-sm">
            <strong className="font-extrabold uppercase">
              Nie masz jeszcze swoich przepisów.
            </strong>{" "}
            Stwórz nowy albo skopiuj któryś z globalnych.
          </p>
        ) : filteredUserRecipes.length === 0 ? (
          <p className="py-4 font-mono text-sm">Brak wyników.</p>
        ) : (
          filteredUserRecipes.map((recipe) => (
            <UserRecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddToDiary={addUserRecipeToDiary}
              onDelete={handleDelete}
              editHref={`/dashboard/recipe-builder?id=${recipe.id}&userRecipe=true&mealType=${mealType}&date=${date}`}
            />
          ))
        )}
      </section>

      {/* ── PRZEPISY GLOBALNE ── */}
      {(query.trim().length > 0 || onlyFavorites) &&
        globalRecipes.length > 0 && (
          <section aria-labelledby="global-recipes-heading">
            <div className="flex items-baseline justify-between border-b-[5px] border-ink pb-0.5">
              <h2
                id="global-recipes-heading"
                className="font-display text-[26px] uppercase"
              >
                Przepisy globalne
              </h2>
              <button
                onClick={() => setOnlyFavorites((v) => !v)}
                aria-pressed={onlyFavorites}
                className={`flex items-center gap-1.5 min-h-9 text-xs font-extrabold uppercase cursor-pointer ${
                  onlyFavorites ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                <Star
                  size={14}
                  strokeWidth={2}
                  fill={onlyFavorites ? "currentColor" : "none"}
                />
                Tylko ulubione
              </button>
            </div>
            {filteredGlobalRecipes.length === 0 ? (
              <p className="py-4 font-mono text-sm">
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
