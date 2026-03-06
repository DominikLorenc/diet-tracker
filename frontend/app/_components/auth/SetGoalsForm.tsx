"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { goalsSchema, GoalsInputs } from "@/schemas/goalsSchema";

type Props = {
  onSuccess: () => void;
};

type FieldConfig = {
  name: keyof GoalsInputs;
  label: string;
  unit: string;
};

const fields: FieldConfig[] = [
  { name: "dailyCaloriesGoal", label: "Kalorie", unit: "kcal" },
  { name: "dailyProteinGoal", label: "Białko", unit: "g" },
  { name: "dailyCarbsGoal", label: "Węglowodany", unit: "g" },
  { name: "dailyFatGoal", label: "Tłuszcze", unit: "g" },
];

export const SetGoalsForm = ({ onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalsInputs>({
    resolver: zodResolver(goalsSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit: SubmitHandler<GoalsInputs> = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/goals`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        onSuccess();
      } else {
        setError("Nie udało się zapisać celów. Spróbuj ponownie.");
      }
    } catch {
      setError("Błąd połączenia z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Ustaw dzienne cele</h2>
        <p className="text-white/50 text-sm mt-1">
          Podaj swoje dzienne cele żywieniowe, żeby zacząć śledzić postępy.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {fields.map(({ name, label, unit }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/70">
              {label}{" "}
              <span className="text-white/30 font-normal">({unit})</span>
            </label>
            <input
              type="number"
              min={0}
              className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={`np. ${name === "dailyCaloriesGoal" ? "2000" : "150"}`}
              {...register(name, { valueAsNumber: true })}
            />
            {errors[name] && (
              <p className="text-xs text-red-400">{errors[name]?.message}</p>
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Zapisywanie..." : "Zapisz cele"}
        </button>
      </form>
    </div>
  );
};
