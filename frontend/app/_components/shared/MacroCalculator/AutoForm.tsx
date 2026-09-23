"use client";

import { Check } from "lucide-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CustomSelect } from "@/app/_components/shared/CustomSelect";
import { calculateCalories, CalculatorResult } from "@/utils/calorieCalculator";
import {
  calorieCalculatorSchema,
  CalorieCalculatorInputs,
} from "@/schemas/goalsSchema";
import { apiClient } from "@/app/lib/apiClient";
import { Button } from "@/app/_components/ui/Button";
import { UserGoals } from "@/app/_types/user";

const fieldBoxClass =
  "flex items-center gap-2 h-11 px-3 bg-card border-2 border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

const inputClass =
  "flex-1 min-w-0 bg-transparent font-mono text-[15px] text-ink placeholder:text-ink-muted outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const numberFields = [
  { name: "weight" as const, label: "Waga", unit: "kg", placeholder: "np. 80" },
  {
    name: "height" as const,
    label: "Wzrost",
    unit: "cm",
    placeholder: "np. 175",
  },
  { name: "age" as const, label: "Wiek", unit: "lat", placeholder: "np. 25" },
];

type Props = {
  onSuccess?: (userGoals: UserGoals) => void;
};

export const AutoForm = ({ onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CalorieCalculatorInputs>({
    resolver: zodResolver(calorieCalculatorSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!result) return;
    setIsLoading(true);
    setError("");

    const { data, error } = await apiClient.PATCH("/users/goals", {
      body: {
        dailyCaloriesGoal: result.calories,
        dailyProteinGoal: result.protein,
        dailyCarbsGoal: result.carbs,
        dailyFatGoal: result.fat,
      },
    });

    if (error) {
      setError(error.message ?? "Błąd połączenia z serwerem.");
    } else {
      setSuccess(true);
      if (data?.updated) onSuccess?.(data.updated);
    }

    setIsLoading(false);
  };

  const onSubmit: SubmitHandler<CalorieCalculatorInputs> = (data) => {
    setResult(calculateCalories(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {numberFields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1">
            <span className="text-[13px] font-extrabold uppercase">
              {field.label}
            </span>
            <span className={fieldBoxClass}>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder={field.placeholder}
                aria-invalid={Boolean(errors[field.name])}
                className={inputClass}
                onFocus={(e) => e.target.select()}
                {...register(field.name, { valueAsNumber: true })}
              />
              <span className="font-mono text-sm shrink-0">{field.unit}</span>
            </span>
            {errors[field.name] && (
              <span role="alert" className="font-mono text-xs text-accent">
                {errors[field.name]?.message}
              </span>
            )}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-extrabold uppercase">Płeć</label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <CustomSelect
                options={[
                  { label: "Mężczyzna", value: "male" },
                  { label: "Kobieta", value: "female" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-extrabold uppercase">Cel</label>
          <Controller
            name="goal"
            control={control}
            render={({ field }) => (
              <CustomSelect
                options={[
                  { label: "Redukcja", value: "lose" },
                  { label: "Utrzymanie", value: "maintain" },
                  { label: "Masa", value: "gain" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-extrabold uppercase">
          Aktywność fizyczna
        </label>
        <Controller
          name="activity"
          control={control}
          render={({ field }) => (
            <CustomSelect
              options={[
                { label: "Osoby siedzące, mało aktywne", value: 0 },
                { label: "Lekka aktywność", value: 1 },
                { label: "Umiarkowana aktywność", value: 2 },
                { label: "Wysoka aktywność", value: 3 },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {error && (
        <p role="alert" className="font-mono text-sm text-accent">
          {error}
        </p>
      )}

      {!result && (
        <Button type="submit" variant="primary" className="w-full">
          Oblicz zapotrzebowanie
        </Button>
      )}

      {result && (
        <div className="flex flex-col gap-3 border-2 border-ink px-3 pt-1.5 pb-3">
          <p className="font-display text-[26px] leading-none">
            Twoje zapotrzebowanie
          </p>
          <div className="rule-thick" />
          <div className="flex justify-between items-end">
            <span className="font-display text-[26px] leading-none [font-stretch:75%]">
              Kalorie
            </span>
            <span className="font-mono text-4xl font-semibold leading-none tracking-[-0.04em]">
              {result.calories}
              <span className="text-sm"> kcal / dzień</span>
            </span>
          </div>
          <div className="grid grid-cols-3 border-y border-ink">
            {(
              [
                ["Białko", result.protein],
                ["Węgle", result.carbs],
                ["Tłuszcze", result.fat],
              ] as const
            ).map(([label, grams], idx) => (
              <div
                key={label}
                className={`py-1.5 flex flex-col ${idx > 0 ? "border-l border-ink pl-2" : ""}`}
              >
                <span className="text-xs font-extrabold">{label}</span>
                <span className="font-mono text-lg font-semibold">
                  {grams} g
                </span>
              </div>
            ))}
          </div>
          {success ? (
            <p
              role="status"
              className="flex items-center justify-center gap-2 min-h-11 border-2 border-ink text-sm font-extrabold uppercase"
            >
              <Check size={16} strokeWidth={3} strokeLinecap="square" />
              Cel zaktualizowany
            </p>
          ) : (
            <Button
              type="button"
              variant="primary"
              isLoading={isLoading}
              onClick={handleSave}
              className="w-full"
            >
              Ustaw jako mój cel
            </Button>
          )}
        </div>
      )}

      {result && (
        <Button type="submit" variant="outline" className="w-full">
          Przelicz ponownie
        </Button>
      )}
    </form>
  );
};
