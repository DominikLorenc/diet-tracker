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

type MacroBarProps = {
  label: string;
  eaten: number;
  goal: number;
  unit: string;
  color: string;
  barColor: string;
};

const MacroBar = ({
  label,
  eaten,
  goal,
  unit,
  color,
  barColor,
}: MacroBarProps) => {
  const percent = goal > 0 ? Math.min((eaten / goal) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] font-bold tracking-wider"
        style={{
          color,
          fontFamily: "var(--font-ibm-plex-mono)",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "#162E1C" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: barColor }}
        />
      </div>
      <span
        className="text-[10px] font-medium"
        style={{ color, fontFamily: "var(--font-ibm-plex-mono)" }}
      >
        {eaten.toFixed(0)} / {goal} {unit}
      </span>
    </div>
  );
};

type Props = {
  items: DiaryItem[];
  user?: User | null;
};

export const MacroSummary = ({ items, user: userProp }: Props) => {
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);

  /* jeśli user przekazany z rodzica, nie fetchujemy ponownie */
  useEffect(() => {
    if (userProp !== undefined) return;
    const fetchUser = async () => {
      const { data } = await apiClient.GET("/users/me");
      if (data) setFetchedUser(data.user as User);
    };
    fetchUser();
  }, [userProp]);

  const user = userProp !== undefined ? userProp : fetchedUser;

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
    <div
      className="rounded-2xl flex flex-col gap-2.5 p-4"
      style={{
        background: "#1A2420",
        border: "1px solid #1E3322",
        boxShadow: "0 1px 20px rgba(34,197,94,0.09)",
      }}
    >
      {/* Kalorie — etykieta */}
      <span
        className="text-xs font-bold tracking-widest"
        style={{
          color: "#4ADE80",
          fontFamily: "var(--font-ibm-plex-mono)",
          letterSpacing: "0.15em",
        }}
      >
        KALORIE
      </span>

      {/* Kalorie — wartość + pozostało */}
      <div className="flex items-end justify-between">
        <span
          className="text-4xl sm:text-[46px] font-bold leading-none"
          style={{ color: "#F3F7FF", fontFamily: "var(--font-ibm-plex-mono)" }}
        >
          {eaten.calories.toFixed(0)}{" "}
          <span className="text-xl sm:text-2xl" style={{ color: "#94A3B8" }}>
            / {goal.calories} kcal
          </span>
        </span>
        <div
          className="text-right text-sm font-semibold leading-snug"
          style={{ color: "#94A3B8" }}
        >
          pozostało
          <br />
          <span style={{ color: "#F3F7FF" }}>
            {caloriesLeft.toFixed(0)} kcal
          </span>
        </div>
      </div>

      {/* Pasek postępu kalorii */}
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: "#162E1C" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${caloriesPercent}%`,
            background: "linear-gradient(90deg, #15803D 0%, #4ADE80 100%)",
          }}
        />
      </div>

      {/* Makroskładniki */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <MacroBar
          label="BIAŁKO"
          eaten={eaten.protein}
          goal={goal.protein}
          unit="g"
          color="#7DB5FF"
          barColor="#7DB5FF"
        />
        <MacroBar
          label="WĘGLE"
          eaten={eaten.carbs}
          goal={goal.carbs}
          unit="g"
          color="#F4C65D"
          barColor="#F4C65D"
        />
        <MacroBar
          label="TŁUSZCZE"
          eaten={eaten.fat}
          goal={goal.fat}
          unit="g"
          color="#F18FA3"
          barColor="#F18FA3"
        />
      </div>
    </div>
  );
};
