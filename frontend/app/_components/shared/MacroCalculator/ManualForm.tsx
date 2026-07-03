"use client";

import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { apiClient } from "@/app/lib/apiClient";
import { MacroValues, recalculate } from "@/utils/macroCalculator";
import { UserGoals } from "@/app/_types/user";

type ManualInputs = MacroValues & { kcal: number };

const MACRO_ROWS = [
  {
    label: "Białko",
    colorClass: "text-macro-protein",
    gField: "protein_g",
    pctField: "protein_pct",
  },
  {
    label: "Tłuszcze",
    colorClass: "text-macro-fat",
    gField: "fat_g",
    pctField: "fat_pct",
  },
  {
    label: "Węglowodany",
    colorClass: "text-macro-carbs",
    gField: "carbs_g",
    pctField: "carbs_pct",
  },
] as const;

const MANUAL_DEFAULTS: ManualInputs = {
  kcal: 2000,
  protein_g: 150,
  protein_pct: 30,
  fat_g: 65,
  fat_pct: 29,
  carbs_g: 213,
  carbs_pct: 41,
};

const inputBase =
  "bg-dash-surface-alt border border-dash-border rounded-lg px-2 py-1.5 text-sm font-medium text-dash-fg text-right focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const inputGrams = `${inputBase} w-20`;
const inputPct = `${inputBase} w-16`;
const inputKcal = `${inputBase} w-24 border-macro-calories/40 text-macro-calories`;

type Props = {
  onSuccess?: (userGoals: UserGoals) => void;
};

export const ManualForm = ({ onSuccess }: Props) => {
  const { control, handleSubmit, getValues, setValue, watch } =
    useForm<ManualInputs>({ defaultValues: MANUAL_DEFAULTS });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const proteinPct = watch("protein_pct") ?? 0;
  const fatPct = watch("fat_pct") ?? 0;
  const carbsPct = watch("carbs_pct") ?? 0;
  const total = proteinPct + fatPct + carbsPct;
  const isValid = total === 100;

  const applyRecalculate = (field: keyof ManualInputs, val: number) => {
    const result = recalculate(field, val, getValues());
    Object.entries(result).forEach(([f, v]) =>
      setValue(f as keyof ManualInputs, v),
    );
  };

  const handleSave = async (data: ManualInputs) => {
    setIsLoading(true);
    setError("");

    const { data: goalsResponse, error } = await apiClient.PATCH(
      "/users/goals",
      {
        body: {
          dailyCaloriesGoal: data.kcal,
          dailyProteinGoal: data.protein_g,
          dailyCarbsGoal: data.carbs_g,
          dailyFatGoal: data.fat_g,
        },
      },
    );

    if (error) {
      setError(error.message ?? "Błąd połączenia z serwerem.");
    } else {
      setSuccess(true);
      if (goalsResponse?.updated) onSuccess?.(goalsResponse.updated);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="flex flex-col">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 pb-2 px-1">
        <span className="text-xs text-dash-fg-muted font-sans">
          Makroskładnik
        </span>
        <span className="text-xs text-dash-fg-muted w-20 text-center font-sans">
          g
        </span>
        <span className="text-xs w-4" />
        <span className="text-xs text-dash-fg-muted w-16 text-center font-sans">
          %
        </span>
        <span className="text-xs w-4" />
      </div>

      <div className="flex items-center gap-2 py-3 border-t border-dash-border">
        <span className="flex-1 text-sm font-semibold text-macro-calories font-mono">
          Kalorie
        </span>
        <Controller
          name="kcal"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              className={inputKcal}
              value={field.value}
              onChange={(e) => {
                const val = Number(e.target.value);
                field.onChange(val);
                applyRecalculate("kcal", val);
              }}
            />
          )}
        />
        <span className="text-xs text-dash-fg-muted w-4 font-sans">kcal</span>
        <span className="w-16" />
        <span className="w-4" />
      </div>

      {MACRO_ROWS.map(({ label, colorClass, gField, pctField }) => (
        <div
          key={gField}
          className="flex items-center gap-2 py-3 border-t border-dash-border"
        >
          <span
            className={`flex-1 text-sm font-semibold font-mono ${colorClass}`}
          >
            {label}
          </span>

          <Controller
            name={gField}
            control={control}
            render={({ field }) => (
              <input
                type="number"
                className={inputGrams}
                value={field.value}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  field.onChange(val);
                  applyRecalculate(gField, val);
                }}
              />
            )}
          />
          <span className="text-xs text-dash-fg-muted w-4 font-sans">g</span>

          <Controller
            name={pctField}
            control={control}
            render={({ field }) => (
              <input
                type="number"
                className={inputPct}
                value={field.value}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  field.onChange(val);
                  applyRecalculate(pctField, val);
                }}
              />
            )}
          />
          <span className="text-xs text-dash-fg-muted w-4 font-sans">%</span>
        </div>
      ))}

      <div className="flex items-center justify-between py-2.5 px-1 border-t border-dash-border rounded-b-lg bg-[var(--background)]">
        <span className="text-sm font-semibold text-dash-fg-secondary font-sans">
          Razem
        </span>
        <span
          className={`text-sm font-bold font-mono ${isValid ? "text-macro-calories" : "text-red-400"}`}
        >
          {total} %
        </span>
      </div>

      {error && <p className="text-sm text-red-500 mt-2 font-sans">{error}</p>}

      {success ? (
        <p className="text-sm text-center text-macro-calories font-medium mt-3 font-sans">
          ✓ Cel zaktualizowany!
        </p>
      ) : (
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isValid}
          className="w-full mt-4"
        >
          ✓ Zapisz cel
        </Button>
      )}
    </form>
  );
};
