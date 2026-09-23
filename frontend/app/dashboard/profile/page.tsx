"use client";

import { AvatarCard } from "@/app/_components/profile/AvatarCard";
import { MacroGoals } from "@/app/_components/profile/MacroGoals";
import { MacroCalculator } from "@/app/_components/shared/MacroCalculator";
import { useUserStore } from "@/store/useUserStore";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";

export default function Profile() {
  const user = useUserStore((s) => s.user);
  const setUserGoals = useUserStore((s) => s.setUserGoals);

  if (!user) {
    return <p className="font-mono text-sm p-6">Ładowanie…</p>;
  }

  const { username, email, imageUrl } = user;
  const { dailyCaloriesGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } =
    user.userGoals ?? {
      dailyCaloriesGoal: 0,
      dailyProteinGoal: 0,
      dailyCarbsGoal: 0,
      dailyFatGoal: 0,
    };

  return (
    <div className={pageClass()}>
      <PageHeader title="Profil" eyebrow="Konto i cele" />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-72 shrink-0 border-2 border-ink bg-card">
          <AvatarCard
            name={username}
            email={email}
            imageUrl={imageUrl ?? undefined}
          />
        </div>

        <div className="flex flex-col gap-6 flex-1 w-full">
          <MacroGoals
            dailyCaloriesGoal={dailyCaloriesGoal}
            dailyProteinGoal={dailyProteinGoal}
            dailyCarbsGoal={dailyCarbsGoal}
            dailyFatGoal={dailyFatGoal}
          />
          <MacroCalculator onSuccess={setUserGoals} />
        </div>
      </div>
    </div>
  );
}
