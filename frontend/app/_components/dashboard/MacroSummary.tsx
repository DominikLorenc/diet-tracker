"use client";

import { DiaryItem, getItemMacros } from "./DiaryDayView";
import { useUserStore } from "@/store/useUserStore";

function percentOf(value: number, goal: number) {
  return goal > 0 ? Math.round((value / goal) * 100) : 0;
}

type MacroRowProps = {
  label: string;
  eaten: number;
  goal: number;
  isLast?: boolean;
};

const MacroRow = ({ label, eaten, goal, isLast = false }: MacroRowProps) => {
  const percent = percentOf(eaten, goal);
  const isOver = goal > 0 && eaten > goal;

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_104px_48px] items-baseline py-1.5 text-[15px] ${
        isLast ? "" : "border-b border-ink"
      }`}
    >
      <span className="font-extrabold">{label}</span>
      <span className="font-mono text-[13px]">
        {eaten.toFixed(0)} / {goal} g
      </span>
      <span
        className={`font-mono font-semibold text-right ${isOver ? "text-accent" : ""}`}
      >
        {percent}%
      </span>
    </div>
  );
};

type Props = {
  items: DiaryItem[];
};

export const MacroSummary = ({ items }: Props) => {
  const user = useUserStore((s) => s.user);

  const eaten = items.reduce(
    (sum, item) => {
      const macros = getItemMacros(item);
      return {
        calories: sum.calories + macros.calories,
        protein: sum.protein + macros.protein,
        carbs: sum.carbs + macros.carbs,
        fat: sum.fat + macros.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const goal = {
    calories: user?.userGoals?.dailyCaloriesGoal ?? 0,
    protein: user?.userGoals?.dailyProteinGoal ?? 0,
    carbs: user?.userGoals?.dailyCarbsGoal ?? 0,
    fat: user?.userGoals?.dailyFatGoal ?? 0,
  };

  const caloriesDiff = goal.calories - eaten.calories;
  const isOverGoal = goal.calories > 0 && caloriesDiff < 0;
  const caloriesPercent = percentOf(eaten.calories, goal.calories);

  return (
    <section
      aria-label="Wartości dnia"
      className="border-2 border-ink bg-card px-3 pt-1.5 pb-2.5"
    >
      <h2 className="font-display text-[34px] leading-none">Wartości dnia</h2>
      <div className="flex justify-between text-sm pt-0.5 pb-1 border-b border-ink">
        <span>Cel dzienny</span>
        <span className="font-mono font-semibold">{goal.calories} kcal</span>
      </div>
      <div className="rule-thick" />

      <div className="flex items-end justify-between pt-1.5 pb-0.5">
        <div className="flex flex-col">
          <span className="text-xs font-bold">Zjedzone</span>
          <span className="font-display text-[30px] leading-none [font-stretch:75%]">
            Kalorie
          </span>
        </div>
        <span className="font-mono text-[44px] lg:text-[52px] font-semibold leading-none tracking-[-0.04em]">
          {eaten.calories.toFixed(0)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Kalorie względem celu"
        aria-valuenow={caloriesPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3.5 border-[1.5px] border-ink mt-1.5 mb-1"
      >
        <div
          className={`h-full transition-[width] duration-500 ${isOverGoal ? "bg-accent" : "bg-ink"}`}
          style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-xs pb-1">
        <span>{caloriesPercent}% celu</span>
        {isOverGoal ? (
          <span className="text-accent font-semibold">
            ponad cel o {Math.abs(caloriesDiff).toFixed(0)} kcal
          </span>
        ) : (
          <span>
            zostało{" "}
            <strong className="font-semibold text-accent">
              {caloriesDiff.toFixed(0)} kcal
            </strong>
          </span>
        )}
      </div>

      <div className="rule-medium" />
      <div className="flex justify-end text-xs font-bold py-0.5 border-b border-ink">
        % celu
      </div>
      <MacroRow label="Białko" eaten={eaten.protein} goal={goal.protein} />
      <MacroRow label="Węglowodany" eaten={eaten.carbs} goal={goal.carbs} />
      <MacroRow label="Tłuszcze" eaten={eaten.fat} goal={goal.fat} isLast />
      <div className="rule-thick" />
      <p className="mt-1.5 text-[11px] leading-snug">
        * Wartości liczone tylko z pozycji oznaczonych jako zjedzone.
      </p>
    </section>
  );
};
