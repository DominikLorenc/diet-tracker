"use client";

import { AvatarCard } from "@/app/_components/profile/AvatarCard";
import { MacroGoals } from "@/app/_components/profile/MacroGoals";
import { MacroCalculator } from "@/app/_components/shared/MacroCalculator";
import { apiClient } from "@/app/lib/apiClient";
import { useEffect, useState } from "react";

const stats = [
  {
    value: "1400",
    label: "kcal today",
    colorClass: "text-macro-calories",
    bg: "bg-dash-surface-alt",
  },
  {
    value: "7",
    label: "day streak",
    colorClass: "text-macro-carbs",
    bg: "bg-dash-surface",
  },
  {
    value: "142",
    label: "meals logged",
    colorClass: "text-macro-protein",
    bg: "bg-dash-surface-alt",
  },
  {
    value: "3.2",
    label: "kg lost",
    colorClass: "text-dash-green",
    bg: "bg-dash-surface",
  },
];

type UserGoal = {
  id: string;
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
};

type User = {
  id: string;
  createdAt: string;
  username: string;
  email: string;
  role: string;
  updatedAt: string;
  userGoals: UserGoal | null;
  imageUrl: string | null;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data, error } = await apiClient.GET("/users/me");
      if (error) {
        setError(error.message ?? "Coś poszło nie tak");
      } else if (data?.user) {
        setUser(data.user);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return <div className="text-dash-fg-muted font-sans p-6">Ładowanie...</div>;
  }

  if (error) {
    return <div className="text-red-400 font-sans p-6">Błąd: {error}</div>;
  }

  if (!user) return;

  const { username, email, imageUrl } = user;
  const { dailyCaloriesGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } =
    user.userGoals ?? {
      dailyCaloriesGoal: 0,
      dailyProteinGoal: 0,
      dailyCarbsGoal: 0,
      dailyFatGoal: 0,
    };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto flex flex-col gap-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-dash-fg">Profil</h1>
        <p className="text-sm text-dash-fg-muted">Zarządzaj kontem i celami</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Lewa kolumna — avatar + stats */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <div className="bg-dash-surface border border-dash-border rounded-2xl">
            <AvatarCard
              name={username}
              email={email}
              imageUrl={imageUrl ?? undefined}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-dash-fg-secondary mb-3 font-sans">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} border border-dash-border rounded-2xl p-4`}
                >
                  <p
                    className={`text-2xl font-bold font-mono ${stat.colorClass}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-dash-fg-muted mt-0.5 font-sans">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prawa kolumna — kalkulator + cele */}
        <div className="flex flex-col gap-4 flex-1 w-full">
          <MacroCalculator onSuccess={() => window.location.reload()} />
          <MacroGoals
            dailyCaloriesGoal={dailyCaloriesGoal}
            dailyProteinGoal={dailyProteinGoal}
            dailyCarbsGoal={dailyCarbsGoal}
            dailyFatGoal={dailyFatGoal}
          />
        </div>
      </div>
    </div>
  );
}
