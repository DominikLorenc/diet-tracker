"use client";

import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { apiClient } from "@/app/lib/apiClient";
import { MacroValues, recalculate } from "@/utils/macroCalculator";

type ManualInputs = MacroValues & { kcal: number };

const MACRO_ROWS = [
  {
    label: "Białko",
    color: "text-blue-500",
    gField: "protein_g",
    pctField: "protein_pct",
  },
  {
    label: "Tłuszcze",
    color: "text-red-500",
    gField: "fat_g",
    pctField: "fat_pct",
  },
  {
    label: "Węglowodany",
    color: "text-yellow-500",
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
  "border rounded-lg px-2 py-1.5 text-sm font-medium text-text-primary text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const inputGrams = `${inputBase} w-20 border-gray-200 focus:border-brand-primary`;
const inputPct = `${inputBase} w-16 border-indigo-200 bg-indigo-50 text-indigo-600 font-semibold focus:border-brand-primary`;
const inputKcal = `${inputBase} w-24 border-brand-primary font-semibold`;

type Props = {
  onSuccess?: () => void;
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

    const { error } = await apiClient.PATCH("/users/goals", {
      body: {
        dailyCaloriesGoal: data.kcal,
        dailyProteinGoal: data.protein_g,
        dailyCarbsGoal: data.carbs_g,
        dailyFatGoal: data.fat_g,
      },
    });

    if (error) {
      setError(error.message ?? "Błąd połączenia z serwerem.");
    } else {
      setSuccess(true);
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="flex flex-col">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 pb-2 px-1">
        <span className="text-xs text-text-muted">Makroskładnik</span>
        <span className="text-xs text-text-muted w-20 text-center">g</span>
        <span className="text-xs text-text-muted w-4" />
        <span className="text-xs text-text-muted w-16 text-center">%</span>
        <span className="text-xs text-text-muted w-4" />
      </div>

      <div className="flex items-center gap-2 py-3 border-t border-gray-100">
        <span className="flex-1 text-sm font-semibold text-text-primary">
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
        <span className="text-xs text-text-muted w-4">kcal</span>
        <span className="w-16" />
        <span className="w-4" />
      </div>

      {MACRO_ROWS.map(({ label, color, gField, pctField }) => (
        <div
          key={gField}
          className="flex items-center gap-2 py-3 border-t border-gray-100"
        >
          <span className={`flex-1 text-sm font-semibold ${color}`}>
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
          <span className="text-xs text-text-muted w-4">g</span>

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
          <span className="text-xs text-text-muted w-4">%</span>
        </div>
      ))}

      <div className="flex items-center justify-between py-2.5 px-1 border-t border-gray-100 rounded-b-lg bg-gray-50">
        <span className="text-sm font-semibold text-text-secondary">Razem</span>
        <span
          className={`text-sm font-bold ${isValid ? "text-green-500" : "text-red-500"}`}
        >
          {total} %
        </span>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {success ? (
        <p className="text-sm text-center text-green-600 font-medium mt-3">
          ✓ Cel zaktualizowany!
        </p>
      ) : (
        <Button
          type="submit"
          variant="secondary"
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
