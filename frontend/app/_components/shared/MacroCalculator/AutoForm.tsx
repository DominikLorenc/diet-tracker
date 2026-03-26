"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CustomSelect } from "@/app/_components/shared/CustomSelect";
import { calculateCalories, CalculatorResult } from "@/utils/calorieCalculator";
import {
  calorieCalculatorSchema,
  CalorieCalculatorInputs,
} from "@/schemas/goalsSchema";
import { apiClient, ApiError } from "@/app/lib/apiClient";
import { Button } from "@/app/_components/ui/Button";

const inputClass =
  "border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary bg-white w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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
  onSuccess?: () => void;
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
    try {
      await apiClient.patch("/users/goals", {
        dailyCaloriesGoal: result.calories,
        dailyProteinGoal: result.protein,
        dailyCarbsGoal: result.carbs,
        dailyFatGoal: result.fat,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Błąd połączenia z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CalorieCalculatorInputs> = (data) => {
    setResult(calculateCalories(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {numberFields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary">{field.label}</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                placeholder={field.placeholder}
                className={inputClass}
                {...register(field.name, { valueAsNumber: true })}
              />
              <span className="text-xs text-text-muted shrink-0">
                {field.unit}
              </span>
            </div>
            {errors[field.name] && (
              <p className="text-xs text-red-500">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-secondary">Płeć</label>
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
          <label className="text-xs text-text-secondary">Cel</label>
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
        <label className="text-xs text-text-secondary">
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!result && (
        <Button type="submit" variant="secondary" className="w-full">
          Oblicz zapotrzebowanie
        </Button>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            ✦ Twoje zapotrzebowanie
          </p>
          <div className="bg-white rounded-xl border border-indigo-100 px-5 py-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">
              {result.calories}
            </span>
            <span className="text-sm text-text-secondary">kcal / dzień</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white border border-gray-100 p-3 flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-macro-protein">
                Białko
              </span>
              <span className="text-xl font-bold text-text-primary">
                {result.protein}g
              </span>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-macro-carbs">
                Węgle
              </span>
              <span className="text-xl font-bold text-text-primary">
                {result.carbs}g
              </span>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-macro-fat">
                Tłuszcze
              </span>
              <span className="text-xl font-bold text-text-primary">
                {result.fat}g
              </span>
            </div>
          </div>
          {success ? (
            <p className="text-sm text-center text-green-600 font-medium">
              ✓ Cel zaktualizowany!
            </p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              isLoading={isLoading}
              onClick={handleSave}
              className="w-full"
            >
              ✓ Zaktualizuj swój cel
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
