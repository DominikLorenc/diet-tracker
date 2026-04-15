"use client";

import { useState } from "react";
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

export default function RecipeBuilder() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [error, setError] = useState("");

  const handleAddIngredient = (product: Product) => {
    const ingredientExists = ingredients.some(
      (ingredient) => ingredient.productId === product.id,
    );
    if (ingredientExists) return;

    setIngredients([
      ...ingredients,
      {
        productId: product.id,
        name: product.name,
        quantity: 100,
        imageUrl: product?.imageUrl ?? "",
      },
    ]);
  };

  const handleRemoveIngredient = (productId: string) => {
    setIngredients(
      ingredients.filter((ingredient) => ingredient.productId !== productId),
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.productId === productId
          ? { ...ingredient, quantity }
          : ingredient,
      ),
    );
  };

  const handleSave = async () => {
    if (name.length === 0) {
      setError("Nazwa przepisu nie może być pusta");
      return;
    }

    if (ingredients.length === 0) {
      setError("Brak składników");
      return;
    }
    const { data, error } = await apiClient.POST("/recipes", {
      body: {
        name,
        products: ingredients.map((ingredient) => ({
          productId: ingredient.productId,
          quantity: ingredient.quantity,
        })),
      },
    });

    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 0) {
      setError("Nazwa przepisu nie może być pusta");
      return;
    }

    setError("");
    setName(e.target.value);
  };

  console.log(ingredients);

  return (
    <div className="flex flex-col gap-4 p-6 w-full ">
      <h2 className="text-2xl font-bold text-white">Nowy przepis</h2>

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
          {error && <span className="text-red-400">{error}</span>}
        </div>
      </div>

      {/* Wyszukiwarka */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Dodaj skladniki
          </h3>
        </div>
        <div className="px-4 py-3">
          <Search onProductSelect={handleAddIngredient} />
        </div>
      </div>

      {/* Lista skladnikow */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Skladniki ({ingredients.length})
          </h3>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {ingredients.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/20">
              Brak skladnikow — wyszukaj i dodaj produkty powyzej.
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
                    className="rounded-lg  shrink-0 w-10 h-10"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg bg-white/5 shrink-0"
                    style={{ background: "#334155" }}
                  />
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
        className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-5 py-2 rounded-lg text-white font-medium w-fit"
      >
        Zapisz przepis
      </button>
    </div>
  );
}
