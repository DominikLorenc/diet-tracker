"use client";
import { Suspense, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatAmount, pluralPl } from "@/utils/format";
import { todayLocal } from "@/utils/date";
import Link from "next/link";
import { apiClient } from "@/app/lib/apiClient";
import { useUserStore } from "@/store/useUserStore";
import { useToastStore } from "@/store/useToastStore";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";
import {
  parseCategoriesParam,
  type RecipeCategory,
  type RecipeCategoryCount,
} from "@/app/lib/recipeCategories";
import { RecipeCategoryFilter } from "@/app/_components/recipes/RecipeCategoryFilter";
import { PortionStepper } from "@/app/_components/add/RecipeCardParts";
import type { MealType } from "@/app/_components/dashboard/DiaryDayView";
import { MEAL_LABELS, guessMealTypeByHour } from "@/app/lib/mealTypes";

export interface Product {
  id: string;
  name: string;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  createdAt: string;
}

export interface RecipeProduct {
  id: string;
  recipeId: string;
  productId: string;
  quantity: string;
  createdAt: string;
  product: Product;
}

export interface Recipe {
  id: string;
  name: string;
  createdAt: string;
  products: RecipeProduct[];
  steps: string[];
}

export interface RecipesResponse {
  recipes: Recipe[];
}

const PAGE_SIZE = 20;

export default function Recipes() {
  return (
    // useSearchParams() needs a Suspense boundary to prerender at build time
    <Suspense>
      <RecipesContent />
    </Suspense>
  );
}

function RecipesContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<RecipeCategoryCount[]>(
    [],
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const showToast = useToastStore((s) => s.showToast);

  // The URL is the single source of truth for filters, so they survive a refresh
  // and can be shared as a link. Joined to a string for a stable effect dependency.
  const selectedCategories = parseCategoriesParam(
    searchParams.get("categories"),
  );
  const categoriesParam = selectedCategories.join(",");

  // Changing filters always starts again from the first page. Adjusting state
  // during render (instead of in an effect) avoids one extra fetch of the old page.
  const [pageFilters, setPageFilters] = useState(categoriesParam);
  if (pageFilters !== categoriesParam) {
    setPageFilters(categoriesParam);
    setPage(1);
  }

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const { data } = await apiClient.GET("/recipes/categories");
      if (data) setCategoryCounts(data.categories);
    };
    fetchCategoryCounts();
  }, []);

  useEffect(() => {
    // Ignore a response that arrives after the filters or page already changed again
    let isCurrent = true;
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await apiClient.GET("/recipes", {
          params: {
            query: {
              page,
              limit: PAGE_SIZE,
              categories: categoriesParam || undefined,
            },
          },
        });
        if (!isCurrent) return;
        if (error) {
          showToast(
            "error",
            "Nie udało się pobrać przepisów",
            "Spróbuj ponownie",
          );
          return;
        }
        if (data) {
          setTotal(data.total);
          // Page 1 replaces the list, later pages append to it ("show more")
          setRecipes((prev) =>
            page === 1
              ? (data.recipes as Recipe[])
              : [...prev, ...(data.recipes as Recipe[])],
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchPage();
    return () => {
      isCurrent = false;
    };
  }, [page, categoriesParam, showToast]);

  const hasMore = recipes.length < total;

  const setCategoriesInUrl = (categories: RecipeCategory[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    } else {
      params.delete("categories");
    }
    const query = params.toString();
    // replace, not push: ticking checkboxes should not flood the back button history
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const toggleCategory = (category: RecipeCategory) => {
    setCategoriesInUrl(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category],
    );
  };

  const clearCategories = () => setCategoriesInUrl([]);

  // Diary stores a recipe entry in grams, so the portion is converted here
  const handleAddRecipeToDiary = async (
    recipe: Recipe,
    grams: number,
    mealType: MealType,
  ) => {
    const { error } = await apiClient.POST("/diary", {
      body: {
        date: todayLocal(),
        recipeId: recipe.id,
        quantity: grams,
        mealType,
      },
    });

    if (error) {
      showToast("error", "Nie udało się dodać przepisu", error.message);
      return;
    }
    showToast(
      "success",
      "Dodano!",
      `${recipe.name} → ${MEAL_LABELS[mealType].toLowerCase()}`,
    );
  };

  return (
    <div className={pageClass()}>
      <PageHeader
        title="Przepisy"
        eyebrow={pluralPl(total, {
          one: "przepis",
          few: "przepisy",
          many: "przepisów",
        })}
      />

      <div className="mb-6">
        <RecipeCategoryFilter
          counts={categoryCounts}
          selected={selectedCategories}
          onToggle={toggleCategory}
          onClear={clearCategories}
        />
      </div>

      {!isLoading && recipes.length === 0 && (
        <p className="py-5 px-4 border-2 border-dashed border-ink text-sm">
          Brak przepisów w wybranych kategoriach.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2 items-start">
        {recipes.map((recipe) => (
          <RecipeLabel
            key={recipe.id}
            recipe={recipe}
            canEdit={isAdmin}
            onAdd={(grams, mealType) =>
              handleAddRecipeToDiary(recipe, grams, mealType)
            }
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={isLoading}
          className="mt-6 w-full min-h-12 px-4 border-2 border-ink bg-card text-sm font-extrabold uppercase hover:bg-ink hover:text-paper transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading
            ? "Ładowanie…"
            : `Pokaż więcej (${recipes.length} z ${total})`}
        </button>
      )}
    </div>
  );
}

// Macros of one ingredient, scaled by the chosen number of portions
function productMacros(item: RecipeProduct, portion: number) {
  const factor = (parseFloat(item.quantity) / 100) * portion;
  return {
    calories: factor * parseFloat(item.product.calories),
    protein: factor * parseFloat(item.product.protein),
    carbs: factor * parseFloat(item.product.carbs),
    fat: factor * parseFloat(item.product.fat),
  };
}

type RecipeLabelProps = {
  recipe: Recipe;
  canEdit: boolean;
  onAdd: (grams: number, mealType: MealType) => Promise<void>;
};

function RecipeLabel({ recipe, canEdit, onAdd }: RecipeLabelProps) {
  const [portion, setPortion] = useState(1);
  const [mealType, setMealType] = useState<MealType>(() =>
    guessMealTypeByHour(new Date().getHours()),
  );
  const [adding, setAdding] = useState(false);

  // Everything on the label follows the chosen portion, so what you see is what gets logged
  const totals = recipe.products.reduce(
    (sum, item) => {
      const m = productMacros(item, portion);
      return {
        calories: sum.calories + m.calories,
        protein: sum.protein + m.protein,
        carbs: sum.carbs + m.carbs,
        fat: sum.fat + m.fat,
        grams: sum.grams + parseFloat(item.quantity) * portion,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, grams: 0 },
  );

  const handleAdd = async () => {
    setAdding(true);
    try {
      await onAdd(totals.grams, mealType);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="border-2 border-ink bg-card px-3 pt-1.5 pb-3 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-[30px] leading-none">{recipe.name}</h2>
        {canEdit && (
          <Link
            href={`/dashboard/recipe-builder?id=${recipe.id}`}
            className="shrink-0 min-h-8 flex items-center text-xs font-extrabold uppercase underline underline-offset-4 hover:text-accent"
          >
            Edytuj
          </Link>
        )}
      </div>
      <div className="flex justify-between text-sm pt-1 pb-1 border-b border-ink">
        <span>
          {portion === 1
            ? "Cały przepis"
            : `${portion.toLocaleString("pl-PL")} porcji`}
        </span>
        <span className="font-mono font-semibold">
          {formatAmount(totals.grams)} g
        </span>
      </div>
      <div className="rule-thick" />
      <div className="flex justify-between items-end py-1">
        <span className="font-display text-[26px] leading-none [font-stretch:75%]">
          Kalorie
        </span>
        <span className="font-mono text-4xl font-semibold leading-none tracking-[-0.04em]">
          {totals.calories.toFixed(0)}
        </span>
      </div>
      <div className="rule-medium" />
      <div className="grid grid-cols-3 border-b border-ink">
        {(
          [
            ["Białko", totals.protein],
            ["Węgle", totals.carbs],
            ["Tłuszcze", totals.fat],
          ] as const
        ).map(([label, value], idx) => (
          <div
            key={label}
            className={`py-1.5 flex flex-col ${idx > 0 ? "border-l border-ink pl-2" : ""}`}
          >
            <span className="text-xs font-extrabold">{label}</span>
            <span className="font-mono text-sm">{formatAmount(value)} g</span>
          </div>
        ))}
      </div>

      <h3 className="mt-4 text-xs font-extrabold uppercase border-b-[5px] border-ink pb-0.5">
        Składniki
      </h3>
      <ul>
        {recipe.products.map((item) => {
          const m = productMacros(item, portion);
          return (
            <li
              key={item.productId}
              className="flex items-baseline gap-3 py-2 border-b border-ink"
            >
              <span className="flex-1 min-w-0 flex flex-col">
                <span className="text-[15px] font-bold">
                  {item.product.name}
                </span>
                <span className="font-mono text-[11px]">
                  {formatAmount(parseFloat(item.quantity) * portion, 2)} g · B{" "}
                  {m.protein.toFixed(0)} · W {m.carbs.toFixed(0)} · T{" "}
                  {m.fat.toFixed(0)}
                </span>
              </span>
              <span className="font-mono text-[15px] font-semibold">
                {m.calories.toFixed(0)}
              </span>
            </li>
          );
        })}
      </ul>

      {recipe.steps.length > 0 && (
        <>
          <h3 className="mt-4 text-xs font-extrabold uppercase border-b-[5px] border-ink pb-0.5">
            Jak to zrobić
          </h3>
          <ol className="flex flex-col">
            {recipe.steps.map((step, index) => (
              <li
                key={index}
                className="flex gap-3 py-2 border-b border-ink text-sm"
              >
                <span className="font-mono text-xs font-semibold pt-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <PortionStepper portion={portion} onPortionChange={setPortion} />

        <div
          role="radiogroup"
          aria-label="Posiłek"
          className="grid grid-cols-4 gap-1.5"
        >
          {(Object.keys(MEAL_LABELS) as MealType[]).map((value) => {
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
                {MEAL_LABELS[value]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center justify-between min-h-12 px-4 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors cursor-pointer disabled:opacity-60"
        >
          <span>{adding ? "Dodaję…" : "Dodaj na dziś"}</span>
          <span className="font-mono font-semibold">
            {totals.calories.toFixed(0)} kcal
          </span>
        </button>
      </div>
    </article>
  );
}
