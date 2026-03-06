"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import {
  calculateCalories,
  CalculatorResult,
  Gender,
  Goal,
} from "@/utils/calorieCalculator";
import {
  calorieCalculatorSchema,
  CalorieCalculatorInputs,
} from "@/schemas/goalsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

type BaseField = {
  name: keyof CalorieCalculatorInputs;
  label: string;
  unit: string;
};

type GenderOptions = { label: string; value: Gender }[];
type GoalOptions = { label: string; value: Goal }[];
type ActivityOptions = { label: string; value: number }[];

type FieldConfig =
  | (BaseField & {
      name: "weight" | "height" | "age";
      type: "number";
      placeholder: string;
    })
  | (BaseField & { name: "gender"; type: "select"; options: GenderOptions })
  | (BaseField & { name: "goal"; type: "select"; options: GoalOptions })
  | (BaseField & {
      name: "activity";
      type: "select";
      options: ActivityOptions;
    });

const fields: FieldConfig[] = [
  {
    name: "weight",
    label: "Waga",
    unit: "kg",
    type: "number",
    placeholder: "np. 80",
  },
  {
    name: "height",
    label: "Wzrost",
    unit: "cm",
    type: "number",
    placeholder: "np. 175",
  },
  {
    name: "age",
    label: "Wiek",
    unit: "lat",
    type: "number",
    placeholder: "np. 25",
  },
  {
    name: "gender",
    label: "Płeć",
    unit: "",
    type: "select",
    options: [
      { label: "Mężczyzna", value: "male" },
      { label: "Kobieta", value: "female" },
    ],
  },
  {
    name: "goal",
    label: "Cel",
    unit: "",
    type: "select",
    options: [
      { label: "Redukcja", value: "lose" },
      { label: "Utrzymanie", value: "maintain" },
      { label: "Massa", value: "gain" },
    ],
  },
  {
    name: "activity",
    label: "Aktywność",
    unit: "",
    type: "select",
    options: [
      { label: "Osoby siedzące, mało aktywne", value: 0 },
      { label: "Lekka aktywność", value: 1 },
      { label: "Umiarkowana aktywność", value: 2 },
      { label: "Wysoka aktywność", value: 3 },
    ],
  },
];

type Props = {
  onSuccess?: () => void;
};

export const MacroCalculator = ({ onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
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
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/goals`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            dailyCaloriesGoal: result?.calories,
            dailyProteinGoal: result?.protein,
            dailyCarbsGoal: result?.carbs,
            dailyFatGoal: result?.fat,
          }),
        },
      );

      if (response.ok) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError("Nie udało się zapisać celów. Spróbuj ponownie.");
      }
    } catch {
      setError("Błąd połączenia z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CalorieCalculatorInputs> = async (data) => {
    setResult(calculateCalories(data));
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Kalkulator kalorii</h2>
        <p className="text-white/50 text-sm mt-1">
          Podaj swoje dane, aby obliczyć kalorii.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {fields.map((field) => {
          const { name, label, unit, type } = field;
          if (type === "number") {
            return (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">
                  {label}{" "}
                  {unit && (
                    <span className="text-xs text-white/50">{unit}</span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={field.placeholder}
                  {...register(name, { valueAsNumber: true })}
                />
                {errors[name] && (
                  <p className="text-xs text-red-400">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            );
          }
          if (type === "select") {
            const { options } = field;

            return (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white/70">
                  {label}{" "}
                  {unit && (
                    <span className="text-xs text-white/50">{unit}</span>
                  )}
                </label>
                <select
                  className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  {...register(name, { valueAsNumber: name === "activity" })}
                >
                  {options.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors[name] && (
                  <p className="text-xs text-red-400">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            );
          }
        })}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {result && (
          <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Twoje zapotrzebowanie
            </p>

            <div className="rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-5 py-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {result.calories}
              </span>
              <span className="text-sm text-white/50">kcal / dzień</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-0.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Białko
                </span>
                <span className="text-xl font-bold text-white">
                  {result.protein}g
                </span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-0.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                  Węgle
                </span>
                <span className="text-xl font-bold text-white">
                  {result.carbs}g
                </span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-0.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-400">
                  Tłuszcze
                </span>
                <span className="text-xl font-bold text-white">
                  {result.fat}g
                </span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Zaktualizuj swój cel
            </button>
          </div>
        )}

        {!result && (
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            Zapisz
          </button>
        )}
      </form>
    </div>
  );
};
