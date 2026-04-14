"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/lib/apiClient";
import { DiaryItem, getItemMacros } from "./DiaryDayView";

type UserGoals = {
  id: string;
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
};

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userGoals: UserGoals | null;
};

type Props = {
  items: DiaryItem[];
};

type MacroBarProps = {
  label: string;
  eaten: number;
  goal: number;
  unit: string;
  textColor: string;
  barColor: string;
};

const MacroBar = ({
  label,
  eaten,
  goal,
  unit,
  textColor,
  barColor,
}: MacroBarProps) => {
  const percent = goal > 0 ? Math.min((eaten / goal) * 100, 100) : 0;
  const left = Math.max(goal - eaten, 0);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-semibold uppercase tracking-widest ${textColor}`}
        >
          {label}
        </span>
        <span className="text-white/40">
          {eaten.toFixed(0)} / {goal} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-white/30">
        pozostało: {left.toFixed(0)} {unit}
      </span>
    </div>
  );
};

export const MacroSummary = ({ items }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await apiClient.GET("/users/me");
      if (data) {
        setUser(data.user as User);
      }
    };
    fetchUser();
  }, []);

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

  const caloriesLeft = Math.max(goal.calories - eaten.calories, 0);
  const caloriesPercent =
    goal.calories > 0
      ? Math.min((eaten.calories / goal.calories) * 100, 100)
      : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Kalorie - główna sekcja */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">
              Kalorie
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">
                {eaten.calories.toFixed(0)}
              </span>
              <span className="text-sm text-white/40">
                / {goal.calories} kcal
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30">pozostało</p>
            <p className="text-lg font-bold text-white">
              {caloriesLeft.toFixed(0)} kcal
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${caloriesPercent}%` }}
          />
        </div>
      </div>

      {/* Makro - paski */}
      <div className="grid grid-cols-3 gap-4 px-4 py-4">
        <MacroBar
          label="Białko"
          eaten={eaten.protein}
          goal={goal.protein}
          unit="g"
          textColor="text-blue-400"
          barColor="bg-blue-400"
        />
        <MacroBar
          label="Węgle"
          eaten={eaten.carbs}
          goal={goal.carbs}
          unit="g"
          textColor="text-amber-400"
          barColor="bg-amber-400"
        />
        <MacroBar
          label="Tłuszcze"
          eaten={eaten.fat}
          goal={goal.fat}
          unit="g"
          textColor="text-rose-400"
          barColor="bg-rose-400"
        />
      </div>
    </div>
  );
};
