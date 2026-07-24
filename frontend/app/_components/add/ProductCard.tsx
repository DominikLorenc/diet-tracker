"use client";

import { useState } from "react";
import Image from "next/image";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
};

type Props = {
  product: Product;
  isFavorite?: boolean;
  onAddToDiary: (product: Product, quantity: number) => Promise<void>;
  onFavoriteToggle?: (productId: string, nowFavorite: boolean) => void;
  defaultExpanded?: boolean;
};

export const AddProductCard = ({
  product,
  isFavorite = false,
  onAddToDiary,
  onFavoriteToggle,
  defaultExpanded = false,
}: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [quantityInput, setQuantityInput] = useState("100");
  const quantity = quantityInput === "" ? 0 : Number(quantityInput);
  const [favorite, setFavorite] = useState(isFavorite);
  const [adding, setAdding] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);

    if (next) {
      const { error } = await apiClient.POST("/favorites/products", {
        body: { productId: product.id },
      });
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się dodać do ulubionych");
      } else {
        onFavoriteToggle?.(product.id, true);
      }
    } else {
      const { error } = await apiClient.DELETE(
        "/favorites/products/{productId}",
        { params: { path: { productId: product.id } } },
      );
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się usunąć z ulubionych");
      } else {
        onFavoriteToggle?.(product.id, false);
      }
    }
  };

  const handleAdd = async () => {
    if (quantity <= 0) return;
    setAdding(true);
    await onAddToDiary(product, quantity);
    setAdding(false);
    setExpanded(false);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden cursor-pointer mb-2 transition-colors ${
        favorite
          ? "bg-dash-surface-card border-[var(--color-green-mid-alpha-sm)]"
          : "bg-dash-card-unselected border-dash-border"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Wiersz nagłówka karty */}
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Miniaturka produktu */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={36}
            height={36}
            className="rounded-lg shrink-0 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-dash-icon-bg shrink-0" />
        )}

        {/* Nazwa + makra */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-dash-fg font-semibold text-sm truncate">
            {product.name}
          </p>
          <p className="text-dash-fg-muted text-xs">
            {product.calories} kcal · B: {product.protein}g · T: {product.fat}g
            · W: {product.carbs}g
          </p>
        </div>

        {/* Przycisk ulubionych */}
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
            fill={favorite ? "var(--color-dash-green-mid)" : "none"}
            stroke={
              favorite
                ? "var(--color-dash-green-mid)"
                : "var(--color-dash-svg-inactive)"
            }
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Chevron góra/dół */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="var(--color-dash-svg-inactive)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Panel po rozwinięciu — pole ilości + przycisk */}
      {expanded && (
        <div
          className="border-t border-dash-border bg-dash-surface-alt px-3 py-3 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="text-dash-fg-muted text-xs shrink-0">Ilość:</label>
          <input
            type="number"
            value={quantityInput}
            min={1}
            onChange={(e) => setQuantityInput(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-20 bg-[var(--background)] border border-dash-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-dash-green-mid transition-colors"
          />
          <span className="text-dash-fg-muted text-xs">g</span>

          {/* Podgląd kalorii dla wybranej ilości */}
          <span className="text-macro-carbs text-xs font-mono font-bold">
            = {((quantity / 100) * product.calories).toFixed(0)} kcal
          </span>

          <button
            onClick={handleAdd}
            disabled={adding}
            className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            {adding ? "Dodaję..." : "Dodaj"}
          </button>
        </div>
      )}
    </div>
  );
};
