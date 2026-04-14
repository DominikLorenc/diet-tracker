"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/lib/apiClient";
import { SetGoalsForm } from "./SetGoalsForm";

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

type MacroCardProps = {
  label: string;
  value: number | null;
  unit: string;
  color: string;
};

const MacroCard = ({ label, value, unit, color }: MacroCardProps) => (
  <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col gap-1">
    <span
      className={`text-xs font-semibold uppercase tracking-widest ${color}`}
    >
      {label}
    </span>
    <span className="text-2xl font-bold text-white">{value ?? "—"}</span>
    <span className="text-xs text-white/40">{unit} / day</span>
  </div>
);

type Props = {
  refreshKey?: number;
};

export const UserInfo = ({ refreshKey = 0 }: Props) => {
  const [data, setData] = useState<{ user: User | null; message: string }>({
    user: null,
    message: "",
  });

  const fetchUser = async () => {
    const { data: responseData } = await apiClient.GET("/users/me");
    if (responseData) {
      setData({
        user: responseData.user as User,
        message: responseData.message,
      });
    }
  };

  const { user } = data;

  const goalsNotSet = user !== null && user.userGoals === null;

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (goalsNotSet) {
    return <SetGoalsForm onSuccess={fetchUser} />;
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-white/40 capitalize">{today}</p>
        <h1 className="text-3xl font-bold text-white">
          Cześć, {user?.username ?? "..."}
        </h1>
        <p className="text-white/50 text-sm">Twoje dzienne cele</p>
      </div>

      {/* Kalorie - duża karta */}
      <div className="rounded-2xl bg-indigo-600/20 border border-indigo-500/30 p-6 flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Kalorie
        </span>
        <span className="text-5xl font-extrabold text-white">
          {user?.userGoals?.dailyCaloriesGoal ?? "—"}
        </span>
        <span className="text-sm text-white/40">kcal / dzień</span>
      </div>

      {/* Makroskładniki */}
      <div className="grid grid-cols-3 gap-3">
        <MacroCard
          label="Białko"
          value={user?.userGoals?.dailyProteinGoal ?? null}
          unit="g"
          color="text-blue-400"
        />
        <MacroCard
          label="Węgle"
          value={user?.userGoals?.dailyCarbsGoal ?? null}
          unit="g"
          color="text-amber-400"
        />
        <MacroCard
          label="Tłuszcze"
          value={user?.userGoals?.dailyFatGoal ?? null}
          unit="g"
          color="text-rose-400"
        />
      </div>
    </div>
  );
};
