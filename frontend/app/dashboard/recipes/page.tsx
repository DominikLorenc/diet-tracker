"use client";
import { useState, useEffect } from "react";
import { formatAmount, pluralPl } from "@/utils/format";
import Link from "next/link";
import { apiClient } from "@/app/lib/apiClient";
import { useUserStore } from "@/store/useUserStore";
import { useToastStore } from "@/store/useToastStore";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";

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

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    const fetchData = async () => {
      const recipesRes = await apiClient.GET("/recipes");
      if (recipesRes.data) {
        setRecipes(recipesRes.data.recipes as Recipe[]);
      }
    };
    fetchData();
  }, []);

  const handleAddRecipeToDiary = async (recipe: Recipe) => {
    const { error } = await apiClient.POST("/diary", {
      body: {
        date: new Date().toISOString().split("T")[0],
        recipeId: recipe.id,
        quantity: DEFAULT_RECIPE_GRAMS,
        mealType: "BREAKFAST",
      },
    });

    if (error) {
      showToast("error", "Nie udało się dodać przepisu", error.message);
      return;
    }
    showToast("success", `${recipe.name} dodany do śniadania`);
  };

  return (
    <div className={pageClass()}>
      <PageHeader
        title="Przepisy"
        eyebrow={pluralPl(recipes.length, {
          one: "przepis",
          few: "przepisy",
          many: "przepisów",
        })}
      />

      <div className="grid gap-6 xl:grid-cols-2 items-start">
        {recipes.map((recipe) => (
          <RecipeLabel
            key={recipe.id}
            recipe={recipe}
            canEdit={isAdmin}
            onAdd={() => handleAddRecipeToDiary(recipe)}
          />
        ))}
      </div>
    </div>
  );
}

const DEFAULT_RECIPE_GRAMS = 100;

function productMacros(item: RecipeProduct) {
  const factor = parseFloat(item.quantity) / 100;
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
  onAdd: () => void;
};

function RecipeLabel({ recipe, canEdit, onAdd }: RecipeLabelProps) {
  const totals = recipe.products.reduce(
    (sum, item) => {
      const m = productMacros(item);
      return {
        calories: sum.calories + m.calories,
        protein: sum.protein + m.protein,
        carbs: sum.carbs + m.carbs,
        fat: sum.fat + m.fat,
        grams: sum.grams + parseFloat(item.quantity),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, grams: 0 },
  );

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
        <span>Cały przepis</span>
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
          const m = productMacros(item);
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
                  {formatAmount(parseFloat(item.quantity))} g · B{" "}
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

      <button
        onClick={onAdd}
        className="mt-4 flex items-center justify-between min-h-12 px-4 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors cursor-pointer"
      >
        <span>+ {DEFAULT_RECIPE_GRAMS} g do dzisiejszego śniadania</span>
      </button>
    </article>
  );
}
