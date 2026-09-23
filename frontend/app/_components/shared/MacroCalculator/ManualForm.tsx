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
  "bg-card border-2 border-ink h-10 px-2 text-sm font-medium text-ink text-right focus:outline-2 focus:outline-offset-2 focus:outline-accent font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const inputGrams = `${inputBase} w-20`;
const inputPct = `${inputBase} w-16`;
const inputKcal = `${inputBase} w-24`;

type Props = {
  onSuccess?: (userGoals: UserGoals) => void;
};

export const ManualForm = ({ onSuccess }: Props) => {
  const { control, handleSubmit, getValues, setValue, watch } =
    useForm<ManualInputs>({ defaultValues: MANUAL_DEFAULTS });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [textValues, setTextValues] = useState<
    Record<keyof ManualInputs, string>
  >({
    kcal: String(MANUAL_DEFAULTS.kcal),
    protein_g: String(MANUAL_DEFAULTS.protein_g),
    protein_pct: String(MANUAL_DEFAULTS.protein_pct),
    fat_g: String(MANUAL_DEFAULTS.fat_g),
    fat_pct: String(MANUAL_DEFAULTS.fat_pct),
    carbs_g: String(MANUAL_DEFAULTS.carbs_g),
    carbs_pct: String(MANUAL_DEFAULTS.carbs_pct),
  });

  const proteinPct = watch("protein_pct") ?? 0;
  const fatPct = watch("fat_pct") ?? 0;
  const carbsPct = watch("carbs_pct") ?? 0;
  const total = proteinPct + fatPct + carbsPct;
  const isValid = total === 100;

  // The edited field keeps exactly what the user typed (via handleFieldChange);
  // only the *other*, derived fields get their text buffer synced to the recalculated number.
  const applyRecalculate = (field: keyof ManualInputs, val: number) => {
    const result = recalculate(field, val, getValues());
    setTextValues((prev) => {
      const next = { ...prev };
      (Object.entries(result) as [keyof ManualInputs, number][]).forEach(
        ([f, v]) => {
          setValue(f, v);
          if (f !== field) next[f] = String(v);
        },
      );
      return next;
    });
  };

  const handleFieldChange = (
    field: keyof ManualInputs,
    onChange: (val: number) => void,
    raw: string,
  ) => {
    setTextValues((prev) => ({ ...prev, [field]: raw }));
    const val = raw === "" ? 0 : Number(raw);
    onChange(val);
    applyRecalculate(field, val);
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
        <span className="text-xs text-ink-muted font-sans">Makroskładnik</span>
        <span className="text-xs text-ink-muted w-20 text-center font-sans">
          g
        </span>
        <span className="text-xs w-4" />
        <span className="text-xs text-ink-muted w-16 text-center font-sans">
          %
        </span>
        <span className="text-xs w-4" />
      </div>

      <div className="flex items-center gap-2 py-3 border-t border-ink">
        <span className="flex-1 text-sm font-extrabold">Kalorie</span>
        <Controller
          name="kcal"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              className={inputKcal}
              value={textValues.kcal}
              onChange={(e) =>
                handleFieldChange("kcal", field.onChange, e.target.value)
              }
              onFocus={(e) => e.target.select()}
            />
          )}
        />
        <span className="text-xs text-ink-muted w-4 font-sans">kcal</span>
        <span className="w-16" />
        <span className="w-4" />
      </div>

      {MACRO_ROWS.map(({ label, colorClass, gField, pctField }) => (
        <div
          key={gField}
          className="flex items-center gap-2 py-3 border-t border-ink"
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
                value={textValues[gField]}
                onChange={(e) =>
                  handleFieldChange(gField, field.onChange, e.target.value)
                }
                onFocus={(e) => e.target.select()}
              />
            )}
          />
          <span className="text-xs text-ink-muted w-4 font-sans">g</span>

          <Controller
            name={pctField}
            control={control}
            render={({ field }) => (
              <input
                type="number"
                className={inputPct}
                value={textValues[pctField]}
                onChange={(e) =>
                  handleFieldChange(pctField, field.onChange, e.target.value)
                }
                onFocus={(e) => e.target.select()}
              />
            )}
          />
          <span className="text-xs text-ink-muted w-4 font-sans">%</span>
        </div>
      ))}

      <div className="flex items-center justify-between py-2.5 px-1 border-t-[5px] border-ink">
        <span className="text-sm font-semibold text-ink-soft font-sans">
          Razem
        </span>
        <span
          className={`text-sm font-bold font-mono ${isValid ? "text-macro-calories" : "text-accent"}`}
        >
          {total} %
        </span>
      </div>

      {error && (
        <p role="alert" className="font-mono text-sm text-accent mt-2">
          {error}
        </p>
      )}

      {success ? (
        <p
          role="status"
          className="flex items-center justify-center min-h-11 mt-3 border-2 border-ink text-sm font-extrabold uppercase"
        >
          Cel zaktualizowany
        </p>
      ) : (
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isValid}
          className="w-full mt-4"
        >
          Zapisz cel
        </Button>
      )}
    </form>
  );
};
