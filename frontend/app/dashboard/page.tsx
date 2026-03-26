"use client";

import { useState } from "react";
import { UserInfo } from "@/app/_components/auth/UserInfo";
import { MacroCalculator } from "@/app/_components/shared/MacroCalculator";
import { DiaryDayView } from "../_components/dashboard/DiaryDayView";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <UserInfo refreshKey={refreshKey} />
      <DiaryDayView />
      {/* <MacroCalculator onSuccess={() => setRefreshKey((k) => k + 1)} /> */}
    </div>
  );
}
