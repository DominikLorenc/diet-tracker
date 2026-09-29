"use client";

import { useRef, useState } from "react";
import { formatAmount } from "@/utils/format";

type EditableQuantityProps = {
  /** Current quantity as a string, exactly as it arrives on DiaryItem. */
  quantity: string;
  /** Called only with a valid, changed value. */
  onSave: (newQuantity: number) => void;
};

/**
 * Inline "text <-> number input" switch for a diary item's quantity.
 * Knows nothing about the API or DiaryItem shape — it just reports a new
 * number through onSave, and the parent decides what to do with it.
 */
export function EditableQuantity({ quantity, onSave }: EditableQuantityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(quantity);
  // Escape cancels by blurring, but blur also runs commit(); this flag lets the
  // blur handler tell "the user pressed Escape" apart from "the user clicked away".
  const skipCommit = useRef(false);

  const startEditing = () => {
    setInputValue(quantity);
    setIsEditing(true);
  };

  const commit = () => {
    setIsEditing(false);
    // Accept both "12.5" and "12,5" (Polish decimal comma).
    const parsed = Number(inputValue.replace(",", "."));
    // Invalid input (empty, <=0, NaN) is a user typo, not a system error:
    // silently fall back to the previous value, no request, no toast.
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    // Unchanged value: skip the request entirely.
    if (parsed === Number(quantity)) return;
    onSave(parsed);
  };

  const cancel = () => {
    setIsEditing(false);
    setInputValue(quantity);
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="underline decoration-dotted decoration-ink-muted underline-offset-2 hover:text-accent hover:decoration-accent transition-colors cursor-pointer"
        aria-label={`Edytuj ilość, obecnie ${formatAmount(quantity)} gramów`}
      >
        {formatAmount(quantity)} g
      </button>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-0.5">
      <input
        type="number"
        inputMode="decimal"
        min={1}
        step="any"
        value={inputValue}
        autoFocus
        onFocus={(e) => e.target.select()}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => {
          if (skipCommit.current) {
            skipCommit.current = false;
            cancel();
            return;
          }
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // Route through blur so commit runs exactly once.
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            skipCommit.current = true;
            e.currentTarget.blur();
          }
        }}
        className="w-12 border-b-2 border-accent bg-transparent text-right font-mono text-[11px] font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Ilość w gramach"
      />
      <span>g</span>
    </span>
  );
}
