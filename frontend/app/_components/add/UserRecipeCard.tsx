"use client";

import { useState } from "react";
import { RecipeCardBody, RecipeCardToggle } from "./RecipeCardParts";
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
  steps: string[];
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
    <div className={`border-b border-ink ${expanded ? "bg-card" : ""}`}>
      <div className="flex items-center gap-1">
        <RecipeCardToggle
          name={recipe.name}
          ingredientCount={recipe.userRecipeIngredients.length}
          kcal={totalKcal}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
        <Link
          href={
            editHref ??
            `/dashboard/recipe-builder?id=${recipe.id}&userRecipe=true`
          }
          className="shrink-0 min-h-11 px-2 flex items-center text-xs font-extrabold uppercase underline underline-offset-4 hover:text-accent"
        >
          Edytuj
        </Link>
      </div>

      {expanded && (
        <RecipeCardBody
          ingredients={recipe.userRecipeIngredients.map((ing) => ({
            id: ing.id,
            name: ing.product.name,
            quantity: ing.quantity,
          }))}
          steps={recipe.steps}
          portion={portion}
          onPortionChange={setPortion}
          kcal={totalKcal}
          adding={adding}
          onAdd={handleAdd}
          footer={
            confirmDelete ? (
              <div
                role="alert"
                className="flex items-center gap-3 border-2 border-accent px-3 py-2 text-sm"
              >
                <span className="flex-1 font-bold">Usunąć ten przepis?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="min-h-10 px-3 bg-accent text-white text-xs font-extrabold uppercase disabled:opacity-60 cursor-pointer"
                >
                  {deleting ? "Usuwam…" : "Usuń"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-10 px-3 border-2 border-ink text-xs font-extrabold uppercase cursor-pointer"
                >
                  Anuluj
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="self-start min-h-10 text-xs font-extrabold uppercase text-ink-muted hover:text-accent cursor-pointer"
              >
                Usuń przepis
              </button>
            )
          }
        />
      )}
    </div>
  );
};
