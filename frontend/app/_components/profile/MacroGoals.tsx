import { Card } from "@/app/_components/ui/Card";
import { SectionHeader } from "@/app/_components/ui/SectionHeader";

type MacroGoalsProps = {
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
};

const macroConfig = [
  {
    key: "carbs",
    label: "Węglowodany",
    colorClass: "text-macro-carbs",
    barClass: "bg-macro-carbs",
  },
  {
    key: "protein",
    label: "Białko",
    colorClass: "text-macro-protein",
    barClass: "bg-macro-protein",
  },
  {
    key: "fat",
    label: "Tłuszcze",
    colorClass: "text-macro-fat",
    barClass: "bg-macro-fat",
  },
] as const;

export function MacroGoals({
  dailyCaloriesGoal,
  dailyProteinGoal,
  dailyCarbsGoal,
  dailyFatGoal,
}: MacroGoalsProps) {
  const totalCalories = dailyCaloriesGoal ?? 0;

  const macros = [
    {
      ...macroConfig[0],
      grams: dailyCarbsGoal ?? 0,
      percent:
        dailyCarbsGoal && totalCalories
          ? Math.round(((dailyCarbsGoal * 4) / totalCalories) * 100)
          : 0,
    },
    {
      ...macroConfig[1],
      grams: dailyProteinGoal ?? 0,
      percent:
        dailyProteinGoal && totalCalories
          ? Math.round(((dailyProteinGoal * 4) / totalCalories) * 100)
          : 0,
    },
    {
      ...macroConfig[2],
      grams: dailyFatGoal ?? 0,
      percent:
        dailyFatGoal && totalCalories
          ? Math.round(((dailyFatGoal * 9) / totalCalories) * 100)
          : 0,
    },
  ];

  return (
    <Card>
      <SectionHeader title="Cele kaloryczne i makro" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-dash-fg-muted font-sans">
          Dzienny cel kalorii
        </span>
        <span className="text-sm font-semibold text-macro-calories font-mono">
          {dailyCaloriesGoal} kcal
        </span>
      </div>

      <h3 className="text-sm font-medium text-dash-fg-secondary font-sans">
        Rozkład makroskładników
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {macros.map((macro) => (
          <div
            key={macro.key}
            className="flex flex-col gap-2 bg-dash-surface-alt border border-dash-border rounded-xl p-3"
          >
            <div className="flex justify-between text-sm">
              <span
                className={`font-bold font-mono text-xs uppercase tracking-widest ${macro.colorClass}`}
              >
                {macro.label}
              </span>
              <span className="text-dash-fg-muted font-mono text-xs">
                {macro.percent}%
              </span>
            </div>
            <div className="h-[7px] bg-macro-track rounded-full">
              <div
                className={`h-full rounded-full ${macro.barClass}`}
                style={{ width: `${macro.percent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-dash-fg font-mono">
              {macro.grams}g
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
