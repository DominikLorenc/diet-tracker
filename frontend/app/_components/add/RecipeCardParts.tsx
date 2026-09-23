import { ReactNode } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";

type HeaderProps = {
  name: string;
  ingredientCount: number;
  kcal: number;
  expanded: boolean;
  onToggle: () => void;
};

// Clickable row that expands a recipe card (the extra buttons sit next to it)
export const RecipeCardToggle = ({
  name,
  ingredientCount,
  kcal,
  expanded,
  onToggle,
}: HeaderProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    className="flex-1 min-w-0 flex items-center gap-3 min-h-14 py-2 text-left cursor-pointer"
  >
    <span className="flex-1 min-w-0 flex flex-col">
      <span className="text-[15px] font-bold truncate">{name}</span>
      <span className="font-mono text-[11px]">
        {ingredientCount} skł. · kcal za wybraną porcję
      </span>
    </span>
    <span className="font-mono text-base font-semibold">{kcal.toFixed(0)}</span>
    <ChevronDown
      size={16}
      strokeWidth={2.5}
      strokeLinecap="square"
      className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
    />
  </button>
);

type Ingredient = { id: string; name: string; quantity: string };

type BodyProps = {
  ingredients: Ingredient[];
  steps: string[];
  portion: number;
  onPortionChange: (portion: number) => void;
  kcal: number;
  adding: boolean;
  onAdd: () => void;
  /** Extra actions under the add button (e.g. delete) */
  footer?: ReactNode;
};

const PORTION_STEP = 0.5;

export const RecipeCardBody = ({
  ingredients,
  steps,
  portion,
  onPortionChange,
  kcal,
  adding,
  onAdd,
  footer,
}: BodyProps) => (
  <div className="px-3 pb-3 flex flex-col gap-3">
    {ingredients.length > 0 && (
      <div>
        <h4 className="text-xs font-extrabold uppercase border-b-[5px] border-ink pb-0.5">
          Składniki
        </h4>
        <ul>
          {ingredients.map((ing) => (
            <li
              key={ing.id}
              className="flex justify-between gap-3 py-1.5 border-b border-ink text-sm"
            >
              <span>{ing.name}</span>
              <span className="font-mono">{ing.quantity} g</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {steps.length > 0 && (
      <div>
        <h4 className="text-xs font-extrabold uppercase border-b-[5px] border-ink pb-0.5">
          Jak to zrobić
        </h4>
        <ol>
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex gap-3 py-1.5 border-b border-ink text-sm"
            >
              <span className="font-mono text-xs font-semibold pt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    )}

    <div className="flex items-stretch">
      <button
        type="button"
        onClick={() =>
          onPortionChange(Math.max(PORTION_STEP, portion - PORTION_STEP))
        }
        aria-label="Mniej o pół porcji"
        className="w-12 h-12 border-2 border-ink flex items-center justify-center cursor-pointer hover:bg-ink hover:text-paper transition-colors"
      >
        <Minus size={18} strokeWidth={3} strokeLinecap="square" />
      </button>
      <span className="flex-1 flex items-center justify-center gap-1.5 border-y-2 border-ink bg-card font-mono">
        <span className="text-xl font-semibold">
          {portion.toLocaleString("pl-PL")}
        </span>
        <span>porcji</span>
      </span>
      <button
        type="button"
        onClick={() => onPortionChange(portion + PORTION_STEP)}
        aria-label="Więcej o pół porcji"
        className="w-12 h-12 border-2 border-ink flex items-center justify-center cursor-pointer hover:bg-ink hover:text-paper transition-colors"
      >
        <Plus size={18} strokeWidth={3} strokeLinecap="square" />
      </button>
    </div>

    <button
      type="button"
      onClick={onAdd}
      disabled={adding}
      className="flex items-center justify-between min-h-14 px-4 bg-accent text-white font-extrabold uppercase tracking-wide hover:bg-accent-hover transition-colors disabled:opacity-60 cursor-pointer"
    >
      <span>{adding ? "Dodaję…" : "Dodaj do dziennika"}</span>
      <span className="font-mono font-semibold">{kcal.toFixed(0)} kcal</span>
    </button>

    {footer}
  </div>
);
