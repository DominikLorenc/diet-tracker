"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { Search } from "@/app/_components/search/Search";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
};

type Ingredient = {
  productId: string;
  name: string;
  quantity: number;
  imageUrl: string;
};

function RecipeBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const isUserRecipe = searchParams.get("userRecipe") === "true";
  const returnMealType = searchParams.get("mealType");
  const returnDate = searchParams.get("date");

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await apiClient.GET("/users/me");
      if (!data?.user) return;
      const userRole = data.user.role as "USER" | "ADMIN";
      setRole(userRole);

      if (!editId) return;

      if (!isUserRecipe && userRole === "ADMIN") {
        const res = await apiClient.GET("/recipes/{id}", {
          params: { path: { id: editId } },
        });
        if (res.data?.recipe) {
          setName(res.data.recipe.name);
          setIngredients(
            res.data.recipe.products.map((ing) => ({
              productId: ing.productId,
              name: ing.product.name,
              quantity: parseFloat(ing.quantity),
              imageUrl: ing.product.imageUrl,
            })),
          );
        }
      } else {
        const res = await apiClient.GET("/user-recipes");
        if (res.data?.userRecipes) {
          const found = res.data.userRecipes.find((r) => r.id === editId);
          if (found) {
            setName(found.name);
            setIngredients(
              found.userRecipeIngredients.map((ing) => ({
                productId: ing.product.id,
                name: ing.product.name,
                quantity: parseFloat(ing.quantity),
                imageUrl: ing.product.imageUrl,
              })),
            );
          }
        }
      }
    };
    init();
  }, [editId]);

  const handleAddIngredient = (product: Product) => {
    if (ingredients.some((i) => i.productId === product.id)) return;
    setIngredients([
      ...ingredients,
      {
        productId: product.id,
        name: product.name,
        quantity: 100,
        imageUrl: product.imageUrl ?? "",
      },
    ]);
  };

  const handleRemoveIngredient = (productId: string) => {
    setIngredients(ingredients.filter((i) => i.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setIngredients(
      ingredients.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Nazwa przepisu nie może być pusta");
      return;
    }
    if (ingredients.length === 0) {
      setError("Brak składników");
      return;
    }

    setSaving(true);
    setError("");

    const products = ingredients.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    let saveError: unknown = null;

    if (!isUserRecipe && role === "ADMIN") {
      if (editId) {
        const { error } = await apiClient.PATCH("/recipes/{id}", {
          params: { path: { id: editId } },
          body: { name, products },
        });
        saveError = error;
      } else {
        const { error } = await apiClient.POST("/recipes", {
          body: { name, products },
        });
        saveError = error;
      }
    } else {
      if (editId) {
        const { error } = await apiClient.PATCH("/user-recipes/{id}", {
          params: { path: { id: editId } },
          body: { name, products },
        });
        saveError = error;
      } else {
        const { error } = await apiClient.POST("/user-recipes", {
          body: { name, products },
        });
        saveError = error;
      }
    }

    setSaving(false);

    if (saveError) {
      setError("Nie udało się zapisać przepisu");
    } else {
      const params = new URLSearchParams({ tab: "recipes" });
      if (returnMealType) params.set("mealType", returnMealType);
      if (returnDate) params.set("date", returnDate);
      router.push(`/dashboard/add?${params.toString()}`);
    }
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setError("Nazwa przepisu nie może być pusta");
    } else {
      setError("");
    }
    setName(e.target.value);
  };

  const pageTitle = editId
    ? "Edytuj przepis"
    : role === "ADMIN"
      ? "Nowy przepis globalny"
      : "Nowy przepis";

  return (
    <div className="flex flex-col gap-4 p-6 w-full">
      <h2 className="text-2xl font-bold text-white">{pageTitle}</h2>

      {/* Nazwa przepisu */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Nazwa przepisu
          </h3>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            placeholder="np. Owsianka z owocami..."
            value={name}
            onChange={onChangeName}
            className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none"
          />
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </div>

      {/* Wyszukiwarka składników */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Dodaj składniki
          </h3>
        </div>
        <div className="px-4 py-3">
          <Search onProductSelect={handleAddIngredient} />
        </div>
      </div>

      {/* Lista składników */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Składniki ({ingredients.length})
          </h3>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {ingredients.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/20">
              Brak składników — wyszukaj i dodaj produkty powyżej.
            </p>
          ) : (
            ingredients.map((ingredient) => (
              <div
                key={ingredient.productId}
                className="flex items-center gap-4 px-4 py-3"
              >
                {ingredient.imageUrl ? (
                  <Image
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    width={32}
                    height={32}
                    className="rounded-lg shrink-0 w-10 h-10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                )}
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {ingredient.name}
                    </span>
                    <button
                      onClick={() =>
                        handleRemoveIngredient(ingredient.productId)
                      }
                      className="text-white/20 hover:text-red-400 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          ingredient.productId,
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-16 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span>g</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors px-5 py-2 rounded-lg text-white font-medium w-fit"
      >
        {saving ? "Zapisuję..." : editId ? "Zapisz zmiany" : "Zapisz przepis"}
      </button>
    </div>
  );
}

export default function RecipeBuilder() {
  return (
    <Suspense>
      <RecipeBuilderContent />
    </Suspense>
  );
}
