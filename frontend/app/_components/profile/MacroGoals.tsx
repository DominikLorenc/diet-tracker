import { Card } from "@/app/_components/ui/Card";
import { SectionHeader } from "@/app/_components/ui/SectionHeader";

type MacroGoalsProps = {
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
};

export function MacroGoals({
  dailyCaloriesGoal,
  dailyProteinGoal,
  dailyCarbsGoal,
  dailyFatGoal,
}: MacroGoalsProps) {
  const caloriesFromCarbs = dailyCarbsGoal ? dailyCarbsGoal * 4 : 0;
  const caloriesFromProtein = dailyProteinGoal ? dailyProteinGoal * 4 : 0;
  const caloriesFromFat = dailyFatGoal ? dailyFatGoal * 9 : 0;
  const totalCalories = dailyCaloriesGoal ?? 0;

  const macros = [
    {
      name: "Węglowodany",
      percent:
        caloriesFromCarbs > 0
          ? Math.round((caloriesFromCarbs / totalCalories) * 100)
          : 0,
      grams: `${dailyCarbsGoal ?? 0}g`,
      color: "bg-brand-primary",
    },
    {
      name: "Białko",
      percent:
        caloriesFromProtein > 0
          ? Math.round((caloriesFromProtein / totalCalories) * 100)
          : 0,
      grams: `${dailyProteinGoal ?? 0}g`,
      color: "bg-macro-protein",
    },
    {
      name: "Tłuszcze",
      percent:
        caloriesFromFat > 0
          ? Math.round((caloriesFromFat / totalCalories) * 100)
          : 0,
      grams: `${dailyFatGoal ?? 0}g`,
      color: "bg-macro-fat",
    },
  ];

  return (
    <Card>
      <SectionHeader title="Cele kaloryczne i makro" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Dzienny cel kalorii</span>
        <span className="text-sm font-semibold text-text-primary">
          {dailyCaloriesGoal} kcal
        </span>
      </div>

      <h3 className="text-sm font-medium text-text-primary">
        Rozkład makroskładników
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {macros.map((macro) => (
          <div
            key={macro.name}
            className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3"
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary">
                {macro.name}
              </span>
              <span className="text-text-muted">{macro.percent}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full">
              <div
                className={`h-full rounded-full ${macro.color}`}
                style={{ width: `${macro.percent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {macro.grams}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
