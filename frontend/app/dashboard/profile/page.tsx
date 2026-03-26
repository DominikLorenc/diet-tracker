"use client";

import { AvatarCard } from "@/app/_components/profile/AvatarCard";
import { MacroGoals } from "@/app/_components/profile/MacroGoals";
import { MacroCalculator } from "@/app/_components/shared/MacroCalculator";
import { Card } from "@/app/_components/ui/Card";
import { SectionHeader } from "@/app/_components/ui/SectionHeader";
import { Button } from "@/app/_components/ui/Button";
import { apiClient, ApiError } from "@/app/lib/apiClient";
import { useEffect, useState } from "react";

const stats = [
  {
    value: "1400",
    label: "kcal today",
    color: "text-brand-primary",
    bg: "bg-red-50",
  },
  {
    value: "7",
    label: "day streak",
    color: "text-macro-protein",
    bg: "bg-green-50",
  },
  {
    value: "142",
    label: "meals logged",
    color: "text-macro-carbs",
    bg: "bg-indigo-50",
  },
  {
    value: "3.2",
    label: "kg lost",
    color: "text-macro-fat",
    bg: "bg-yellow-50",
  },
];

type User = {
  id: string;
  createdAt: Date;
  username: string;
  email: string;
  role: string;
  updatedAt: Date;
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
  imageUrl: string;
};

type UserDataResponse = {
  message: string;
  user: User;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<UserDataResponse>(`/users/me`);
        setUser(response.user);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>Błąd: {error}</div>;
  }

  if (!user) {
    return;
  }

  const {
    dailyCaloriesGoal,
    dailyProteinGoal,
    dailyCarbsGoal,
    dailyFatGoal,
    username,
    email,
    imageUrl,
  } = user;

  const caloriesFromCarbs = dailyCarbsGoal ? dailyCarbsGoal * 4 : 0;
  const caloriesFromProtein = dailyProteinGoal ? dailyProteinGoal * 4 : 0;
  const caloriesFromFat = dailyFatGoal ? dailyFatGoal * 9 : 0;

  const totalCalories = dailyCaloriesGoal ?? 0;

  const macros = [
    {
      name: "Carbs",
      percent:
        caloriesFromCarbs > 0
          ? Math.round((caloriesFromCarbs / totalCalories) * 100)
          : 0,
      grams: `${user.dailyCarbsGoal}g`,
      color: "bg-brand-primary",
    },
    {
      name: "Protein",
      percent:
        caloriesFromProtein > 0
          ? Math.round((caloriesFromProtein / totalCalories) * 100)
          : 0,
      grams: `${user.dailyProteinGoal}g`,
      color: "bg-macro-protein",
    },
    {
      name: "Fat",
      percent:
        caloriesFromFat > 0
          ? Math.round((caloriesFromFat / totalCalories) * 100)
          : 0,
      grams: `${user.dailyFatGoal}g`,
      color: "bg-macro-fat",
    },
  ];

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary">
          Manage your account and goals
        </p>
      </div>

      {/* Główny layout: 1 kolumna mobile, 2 kolumny desktop */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Lewa kolumna — avatar + stats */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <div className="bg-surface rounded-2xl shadow-sm">
            <AvatarCard name={username} email={email} imageUrl={imageUrl} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prawa kolumna — formularz + cele */}
        <div className="flex flex-col gap-4 flex-1 w-full">
          {/* Personal Information */}
          <Card>
            <SectionHeader
              title="Personal Information"
              action={
                <button className="text-xs text-brand-primary flex items-center gap-1">
                  ✏️ Edit
                </button>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="Dominik"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">Last Name</label>
                <input
                  type="text"
                  defaultValue="Kowalski"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">Email</label>
                <input
                  type="email"
                  defaultValue="dominik@example.com"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">Age</label>
                <input
                  type="number"
                  defaultValue={24}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  defaultValue={82}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">
                  Height (kg)
                </label>
                <input
                  type="number"
                  defaultValue={78}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Update Profile</Button>
            </div>
          </Card>

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
