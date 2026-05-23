"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/app/lib/apiClient";

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
}

export interface RecipesResponse {
  recipes: Recipe[];
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [recipesRes, meRes] = await Promise.all([
        apiClient.GET("/recipes"),
        apiClient.GET("/users/me"),
      ]);
      if (recipesRes.data) {
        setRecipes(recipesRes.data.recipes as Recipe[]);
      }
      if (meRes.data?.user) {
        setIsAdmin(meRes.data.user.role === "ADMIN");
      }
    };
    fetchData();
  }, []);

  const handleAddProductToDiary = async (id: string, quantity: number) => {
    const currentDate = new Date();

    const { error } = await apiClient.POST("/diary", {
      body: {
        date: currentDate.toISOString().split("T")[0],
        recipeId: id,
        quantity,
        mealType: "BREAKFAST",
      },
    });

    if (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 w-full max-w-3xl">
      <h2 className="text-2xl font-bold text-white">Twoje przepisy</h2>
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
              {recipe.name}
            </h3>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href={`/dashboard/recipe-builder?id=${recipe.id}`}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  Edytuj
                </Link>
              )}
              <button
                onClick={() => handleAddProductToDiary(recipe.id, 100)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex flex-col divide-y divide-white/5">
              {recipe.products.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {product.product.name}
                      </span>
                      <span className="text-sm font-semibold text-yellow-400 shrink-0">
                        {(
                          (parseFloat(product.quantity) / 100) *
                          parseFloat(product.product.calories)
                        ).toFixed(0)}{" "}
                        kcal
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-white/40">
                      <span>{product.quantity}g</span>
                      <span>
                        🌾{" "}
                        {(
                          (parseFloat(product.quantity) / 100) *
                          parseFloat(product.product.carbs)
                        ).toFixed(1)}
                        g
                      </span>
                      <span>
                        💪{" "}
                        {(
                          (parseFloat(product.quantity) / 100) *
                          parseFloat(product.product.protein)
                        ).toFixed(1)}
                        g
                      </span>
                      <span>
                        🧈{" "}
                        {(
                          (parseFloat(product.quantity) / 100) *
                          parseFloat(product.product.fat)
                        ).toFixed(1)}
                        g
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-6 px-4 py-3 mt-2 border-t border-white/10">
              <span className="text-sm font-semibold text-yellow-400">
                {recipe.products
                  .reduce(
                    (sum, p) =>
                      sum +
                      (parseFloat(p.quantity) / 100) *
                        parseFloat(p.product.calories),
                    0,
                  )
                  .toFixed(0)}{" "}
                kcal
              </span>
              <span className="text-xs text-white/40">
                🌾{" "}
                {recipe.products
                  .reduce(
                    (sum, p) =>
                      sum +
                      (parseFloat(p.quantity) / 100) *
                        parseFloat(p.product.carbs),
                    0,
                  )
                  .toFixed(1)}
                g
              </span>
              <span className="text-xs text-white/40">
                💪{" "}
                {recipe.products
                  .reduce(
                    (sum, p) =>
                      sum +
                      (parseFloat(p.quantity) / 100) *
                        parseFloat(p.product.protein),
                    0,
                  )
                  .toFixed(1)}
                g
              </span>
              <span className="text-xs text-white/40">
                🧈{" "}
                {recipe.products
                  .reduce(
                    (sum, p) =>
                      sum +
                      (parseFloat(p.quantity) / 100) *
                        parseFloat(p.product.fat),
                    0,
                  )
                  .toFixed(1)}
                g
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
