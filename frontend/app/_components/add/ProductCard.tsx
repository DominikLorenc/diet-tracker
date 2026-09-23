"use client";

import { useState } from "react";
import { formatAmount } from "@/utils/format";
import Image from "next/image";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { useUserStore } from "@/store/useUserStore";
import { ChevronDown, Minus, Plus, Star } from "lucide-react";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
  gramsPerUnit?: number | null;
};

type QuantityUnit = "g" | "piece";

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
  const [unit, setUnit] = useState<QuantityUnit>("g");
  const [quantityInput, setQuantityInput] = useState("100");
  const quantity = quantityInput === "" ? 0 : Number(quantityInput);
  const [favorite, setFavorite] = useState(isFavorite);
  const [adding, setAdding] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const userGoals = useUserStore((state) => state.user?.userGoals);
  const goals = {
    calories: userGoals?.dailyCaloriesGoal ?? 0,
    protein: userGoals?.dailyProteinGoal ?? 0,
    carbs: userGoals?.dailyCarbsGoal ?? 0,
    fat: userGoals?.dailyFatGoal ?? 0,
  };
  const hasPieceUnit = product.gramsPerUnit != null && product.gramsPerUnit > 0;

  const selectUnit = (nextUnit: QuantityUnit) => {
    if (nextUnit === unit) return;
    setUnit(nextUnit);
    setQuantityInput(nextUnit === "piece" ? "1" : "100");
  };

  const grams =
    unit === "piece" ? quantity * (product.gramsPerUnit ?? 0) : quantity;

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
    await onAddToDiary(product, grams);
    setAdding(false);
    setExpanded(false);
  };

  const factor = grams / 100;
  const portion = {
    calories: factor * product.calories,
    protein: factor * product.protein,
    carbs: factor * product.carbs,
    fat: factor * product.fat,
  };
  const step = unit === "piece" ? 1 : 10;
  const changeQuantityBy = (delta: number) =>
    setQuantityInput(String(Math.max(0, quantity + delta)));

  return (
    <div
      className={`border-b border-ink ${expanded ? "bg-card" : ""} ${
        favorite ? "shadow-[inset_4px_0_0_var(--color-ink)]" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`flex-1 min-w-0 flex items-center gap-3 min-h-14 py-2 text-left cursor-pointer ${
            favorite ? "pl-3" : ""
          }`}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              width={36}
              height={36}
              className="w-9 h-9 shrink-0 object-cover border border-ink"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-9 h-9 shrink-0 border border-ink bg-paper"
            />
          )}
          <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-[15px] font-bold truncate">
              {product.name}
            </span>
            <span className="font-mono text-[11px]">
              B {formatAmount(product.protein)} · W{" "}
              {formatAmount(product.carbs)} · T {formatAmount(product.fat)}
            </span>
          </span>
          <span className="font-mono text-base font-semibold">
            {formatAmount(product.calories, 0)}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            strokeLinecap="square"
            className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={toggleFavorite}
          className="w-11 h-11 shrink-0 flex items-center justify-center cursor-pointer"
          aria-pressed={favorite}
          aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
          <Star
            size={16}
            strokeWidth={2}
            fill={favorite ? "currentColor" : "none"}
            className={favorite ? "text-ink" : "text-ink-muted"}
          />
        </button>
      </div>

      {/* Expanded: the portion as a nutrition label */}
      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          <div className="border-2 border-ink bg-card px-2.5 pt-1 pb-2">
            <div className="flex justify-between text-sm pb-1">
              <span className="font-extrabold">Porcja</span>
              <span className="font-mono font-semibold">
                {unit === "piece"
                  ? `${quantity} szt. (${grams.toFixed(0)} g)`
                  : `${grams} g`}
              </span>
            </div>
            <div className="rule-thick" />
            <div className="flex justify-between items-end py-1">
              <span className="font-display text-[26px] leading-none [font-stretch:75%]">
                Kalorie
              </span>
              <span className="font-mono text-4xl font-semibold leading-none tracking-[-0.04em]">
                {portion.calories.toFixed(0)}
              </span>
            </div>
            <div className="rule-medium" />
            <PortionRow
              label="Białko"
              grams={portion.protein}
              goal={goals.protein}
            />
            <PortionRow
              label="Węglowodany"
              grams={portion.carbs}
              goal={goals.carbs}
            />
            <PortionRow
              label="Tłuszcze"
              grams={portion.fat}
              goal={goals.fat}
              isLast
            />
            <div className="rule-medium" />
            {goals.calories > 0 && (
              <p className="pt-1 text-[11px]">
                Ta porcja to{" "}
                {Math.round((portion.calories / goals.calories) * 100)}%
                dziennego celu ({goals.calories} kcal).
              </p>
            )}
          </div>

          <div className="flex items-stretch">
            <button
              type="button"
              onClick={() => changeQuantityBy(-step)}
              aria-label={`Mniej o ${step} ${unit === "piece" ? "szt." : "g"}`}
              className="w-12 h-12 border-2 border-ink flex items-center justify-center cursor-pointer hover:bg-ink hover:text-paper transition-colors"
            >
              <Minus size={18} strokeWidth={3} strokeLinecap="square" />
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 border-y-2 border-ink bg-card">
              <span className="sr-only">Ilość</span>
              <input
                type="number"
                inputMode="decimal"
                value={quantityInput}
                min={1}
                onChange={(e) => setQuantityInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-20 bg-transparent text-right font-mono text-xl font-semibold outline-none"
              />
              <span className="font-mono">
                {unit === "piece" ? "szt." : "g"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => changeQuantityBy(step)}
              aria-label={`Więcej o ${step} ${unit === "piece" ? "szt." : "g"}`}
              className="w-12 h-12 border-2 border-ink flex items-center justify-center cursor-pointer hover:bg-ink hover:text-paper transition-colors"
            >
              <Plus size={18} strokeWidth={3} strokeLinecap="square" />
            </button>
          </div>

          {hasPieceUnit && (
            <div
              role="group"
              aria-label="Jednostka"
              className="grid grid-cols-2 border-2 border-ink"
            >
              <button
                type="button"
                onClick={() => selectUnit("g")}
                aria-pressed={unit === "g"}
                className={`min-h-10 text-sm font-bold uppercase cursor-pointer ${
                  unit === "g" ? "bg-ink text-paper" : ""
                }`}
              >
                Gramy
              </button>
              <button
                type="button"
                onClick={() => selectUnit("piece")}
                aria-pressed={unit === "piece"}
                className={`min-h-10 text-sm font-bold uppercase border-l border-ink cursor-pointer ${
                  unit === "piece" ? "bg-ink text-paper" : ""
                }`}
              >
                Sztuki
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || quantity <= 0}
            className="flex items-center justify-between min-h-14 px-4 bg-accent text-white font-extrabold uppercase tracking-wide hover:bg-accent-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            <span>{adding ? "Dodaję…" : "Dodaj do dziennika"}</span>
            <span className="font-mono font-semibold">
              {portion.calories.toFixed(0)} kcal
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

type PortionRowProps = {
  label: string;
  grams: number;
  goal: number;
  isLast?: boolean;
};

function PortionRow({ label, grams, goal, isLast = false }: PortionRowProps) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_72px_56px] py-1 text-sm ${
        isLast ? "" : "border-b border-ink"
      }`}
    >
      <span className="font-extrabold">{label}</span>
      <span className="font-mono text-right">{formatAmount(grams)} g</span>
      <span className="font-mono text-right font-semibold">
        {goal > 0 ? `${Math.round((grams / goal) * 100)}%` : "—"}
      </span>
    </div>
  );
}
