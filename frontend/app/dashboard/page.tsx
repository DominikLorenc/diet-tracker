"use client";

import { useState } from "react";
import { UserInfo } from "@/app/_components/auth/UserInfo";
import { MacroCalculator } from "@/app/_components/shared/MakroCalculator";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <UserInfo refreshKey={refreshKey} />
      <MacroCalculator onSuccess={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
