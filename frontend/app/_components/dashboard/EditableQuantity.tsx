"use client";

import { useEffect, useRef, useState } from "react";
import { formatAmount } from "@/utils/format";

type QuantityUnit = "g" | "piece";

type EditableQuantityProps = {
  /** Current quantity in grams, as a string, exactly as it arrives on DiaryItem. */
  quantity: string;
  /** Per-piece weight, when the product has a piece unit (null otherwise). */
  gramsPerUnit?: string | null;
  /** Called only with a valid, changed value — always in grams. */
  onSave: (newQuantity: number) => void;
};

/** Round to 2 decimals so piece↔gram conversions don't leak float noise. */
function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Inline "text <-> number input" switch for a diary item's quantity.
 * Grams are the source of truth: the resting label and onSave are always grams.
 * When the product has a piece unit, edit mode adds a g/szt toggle that is just
 * an input convenience — pieces are converted to grams before onSave.
 */
export function EditableQuantity({
  quantity,
  gramsPerUnit,
  onSave,
}: EditableQuantityProps) {
  const gpu = gramsPerUnit != null ? parseFloat(gramsPerUnit) : NaN;
  const hasPieceUnit = Number.isFinite(gpu) && gpu > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [unit, setUnit] = useState<QuantityUnit>("g");
  const [inputValue, setInputValue] = useState(quantity);
  const inputRef = useRef<HTMLInputElement>(null);
  // Escape cancels by blurring, but blur also runs commit(); this flag lets the
  // blur handler tell "the user pressed Escape" apart from "the user clicked away".
  const skipCommit = useRef(false);

  // Re-select the input after a unit switch. An effect runs after React has
  // committed the converted value to the DOM, so select() acts on the new value
  // (not the pre-render one) — otherwise the next keystroke would append (23)
  // instead of replacing (3). On first open, autoFocus + onFocus do the select.
  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [unit, isEditing]);

  const startEditing = () => {
    setUnit("g");
    setInputValue(quantity);
    setIsEditing(true);
  };

  // Convert the current input into grams according to the active unit.
  const toGrams = (raw: string): number => {
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isFinite(parsed)) return NaN;
    return unit === "piece" ? round2(parsed * gpu) : round2(parsed);
  };

  const commit = () => {
    setIsEditing(false);
    const grams = toGrams(inputValue);
    // Invalid input (empty, <=0, NaN) is a user typo, not a system error:
    // silently fall back to the previous value, no request, no toast.
    if (!Number.isFinite(grams) || grams <= 0) return;
    // Unchanged value: skip the request entirely.
    if (grams === round2(Number(quantity))) return;
    onSave(grams);
  };

  const cancel = () => {
    setIsEditing(false);
    setInputValue(quantity);
  };

  // Switch unit while keeping the shown amount equivalent (120 g <-> 2 szt).
  const switchUnit = (next: QuantityUnit) => {
    if (next === unit) return;
    const parsed = Number(inputValue.replace(",", "."));
    if (Number.isFinite(parsed)) {
      setInputValue(
        next === "piece"
          ? String(round2(parsed / gpu))
          : String(round2(parsed * gpu)),
      );
    }
    // Focus never left (mousedown is prevented). The select() itself happens in an
    // effect keyed on `unit`, once React has committed the converted value.
    setUnit(next);
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
    <span className="inline-flex items-center gap-1">
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        min={0}
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
        aria-label={unit === "piece" ? "Ilość w sztukach" : "Ilość w gramach"}
      />
      {hasPieceUnit ? (
        <span className="inline-flex border border-ink" role="group">
          {(["g", "piece"] as const).map((u) => (
            <button
              key={u}
              type="button"
              // Keep focus in the input so switching units doesn't trigger commit.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => switchUnit(u)}
              aria-pressed={unit === u}
              className={`px-1 leading-[14px] cursor-pointer transition-colors ${
                unit === u ? "bg-ink text-paper" : "hover:bg-card"
              }`}
            >
              {u === "g" ? "g" : "szt"}
            </button>
          ))}
        </span>
      ) : (
        <span>g</span>
      )}
    </span>
  );
}
