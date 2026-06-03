"use client";

import { useState } from "react";
import Link from "next/link";

type UserRecipeIngredient = {
  id: string;
  quantity: string;
  product: {
    id: string;
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
};

export type UserRecipe = {
  id: string;
  name: string;
  createdAt: string;
  sourceRecipeId: string | null;
  userRecipeIngredients: UserRecipeIngredient[];
};

type Props = {
  recipe: UserRecipe;
  onAddToDiary: (recipe: UserRecipe, portion: number) => Promise<void>;
  onDelete: (recipeId: string) => Promise<void>;
  editHref?: string;
};

const calcTotalKcal = (recipe: UserRecipe, portion: number): number =>
  recipe.userRecipeIngredients.reduce((sum, ing) => {
    const qty = parseFloat(ing.quantity);
    const kcal = parseFloat(ing.product.calories);
    return sum + (qty / 100) * kcal * portion;
  }, 0);

export const UserRecipeCard = ({
  recipe,
  onAddToDiary,
  onDelete,
  editHref,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [portion, setPortion] = useState(1);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalKcal = calcTotalKcal(recipe, portion);

  const handleAdd = async () => {
    setAdding(true);
    await onAddToDiary(recipe, portion);
    setAdding(false);
    setExpanded(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(recipe.id);
    setDeleting(false);
  };

  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer mb-2 bg-dash-card-unselected border-dash-border transition-colors"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Nagłówek karty */}
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Ikona */}
        <div className="w-9 h-9 rounded-lg bg-dash-icon-bg shrink-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="var(--color-dash-green)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>

        {/* Nazwa + metadane */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-dash-fg font-semibold text-sm truncate">
              {recipe.name}
            </p>
          </div>
          <p className="text-dash-fg-muted text-xs">
            {recipe.userRecipeIngredients.length} składników · ~
            {totalKcal.toFixed(0)} kcal
          </p>
        </div>

        {/* Kcal badge */}
        <span className="text-macro-carbs font-mono font-bold text-sm shrink-0">
          {totalKcal.toFixed(0)} kcal
        </span>

        {/* Link Edytuj */}
        <Link
          href={
            editHref ??
            `/dashboard/recipe-builder?id=${recipe.id}&userRecipe=true`
          }
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-dash-fg-muted hover:text-dash-fg text-xs transition-colors"
        >
          Edytuj
        </Link>

        {/* Chevron */}
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

      {/* Panel rozwinięty */}
      {expanded && (
        <div
          className="border-t border-dash-border bg-dash-surface-alt px-3 py-3 flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lista składników */}
          {recipe.userRecipeIngredients.length > 0 && (
            <div className="flex flex-col gap-1">
              {recipe.userRecipeIngredients.map((ing) => (
                <div key={ing.id} className="flex justify-between text-xs">
                  <span className="text-dash-fg-muted">{ing.product.name}</span>
                  <span className="text-dash-svg-inactive">
                    {ing.quantity}g
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="h-px bg-dash-border" />

          {/* Porcje + przycisk dodaj */}
          <div className="flex items-center gap-3">
            <label className="text-dash-fg-muted text-xs shrink-0">
              Porcje:
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPortion((p) => Math.max(0.5, p - 0.5))}
                className="w-7 h-7 rounded-lg bg-[var(--background)] border border-dash-border text-dash-fg-muted hover:text-white hover:border-dash-green-mid transition-colors flex items-center justify-center text-base leading-none"
              >
                −
              </button>
              <span className="w-8 text-center text-white text-sm font-mono">
                {portion}
              </span>
              <button
                onClick={() => setPortion((p) => p + 0.5)}
                className="w-7 h-7 rounded-lg bg-[var(--background)] border border-dash-border text-dash-fg-muted hover:text-white hover:border-dash-green-mid transition-colors flex items-center justify-center text-base leading-none"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              {adding ? "Dodaję..." : "Dodaj"}
            </button>
          </div>

          <div className="h-px bg-dash-border" />

          {/* Inline potwierdzenie usunięcia */}
          {confirmDelete ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-dash-fg-muted">Na pewno usunąć?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-60"
              >
                {deleting ? "Usuwam..." : "Tak"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-dash-fg-muted hover:text-dash-fg transition-colors"
              >
                Nie
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-dash-fg-muted hover:text-red-400 text-xs transition-colors w-fit"
            >
              Usuń przepis
            </button>
          )}
        </div>
      )}
    </div>
  );
};
