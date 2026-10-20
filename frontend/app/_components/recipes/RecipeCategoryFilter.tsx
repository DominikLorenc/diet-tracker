"use client";

import { useId, useState } from "react";
import {
  RECIPE_CATEGORY_LABELS,
  type RecipeCategory,
  type RecipeCategoryCount,
} from "@/app/lib/recipeCategories";

type Props = {
  counts: RecipeCategoryCount[];
  selected: RecipeCategory[];
  onToggle: (category: RecipeCategory) => void;
  onClear: () => void;
};

export const RecipeCategoryFilter = ({
  counts,
  selected,
  onToggle,
  onClear,
}: Props) => {
  // Open by default when the page was opened with filters already applied (e.g. from the URL)
  const [isOpen, setIsOpen] = useState(selected.length > 0);
  const panelId = useId();

  return (
    <section className="border-2 border-ink bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between min-h-12 px-3 text-sm font-extrabold uppercase cursor-pointer"
      >
        <span>
          Filtry
          {selected.length > 0 && ` (${selected.length})`}
        </span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div id={panelId} className="border-t-2 border-ink px-3 pb-3">
          <h2 className="pt-3 pb-1 text-xs font-extrabold uppercase">
            Kategorie przepisów
          </h2>
          <ul>
            {counts.map(({ category, count }) => (
              <li
                key={category}
                className="border-b border-ink last:border-b-0"
              >
                <label className="flex items-center justify-between gap-3 min-h-11 cursor-pointer">
                  <span className="text-[15px]">
                    {RECIPE_CATEGORY_LABELS[category]}{" "}
                    <span className="font-mono text-ink-muted">({count})</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={selected.includes(category)}
                    onChange={() => onToggle(category)}
                    className="w-5 h-5 accent-ink cursor-pointer"
                  />
                </label>
              </li>
            ))}
          </ul>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="mt-3 min-h-9 text-xs font-extrabold uppercase underline underline-offset-4 hover:text-accent cursor-pointer"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}
    </section>
  );
};
