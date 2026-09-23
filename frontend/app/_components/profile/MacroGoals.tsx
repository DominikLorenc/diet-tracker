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
    <section
      aria-label="Cele dzienne"
      className="border-2 border-ink bg-card px-3 pt-1.5 pb-3"
    >
      <h2 className="font-display text-[34px] leading-none">Cele dzienne</h2>
      <div className="rule-thick mt-2" />
      <div className="flex justify-between items-end py-1.5">
        <span className="font-display text-[30px] leading-none [font-stretch:75%]">
          Kalorie
        </span>
        <span className="font-mono text-[44px] font-semibold leading-none tracking-[-0.04em]">
          {dailyCaloriesGoal ?? "—"}
          <span className="text-base"> kcal</span>
        </span>
      </div>
      <div className="rule-medium" />
      <div className="grid grid-cols-[minmax(0,1fr)_72px_72px] text-xs font-bold py-0.5 border-b border-ink">
        <span />
        <span className="text-right">gramy</span>
        <span className="text-right">% kcal</span>
      </div>
      {macros.map((macro, idx) => (
        <div
          key={macro.key}
          className={`grid grid-cols-[minmax(0,1fr)_72px_72px] items-baseline py-1.5 text-[15px] ${
            idx < macros.length - 1 ? "border-b border-ink" : ""
          }`}
        >
          <span className="font-extrabold">{macro.label}</span>
          <span className="font-mono text-right">{macro.grams} g</span>
          <span className="font-mono text-right font-semibold">
            {macro.percent}%
          </span>
        </div>
      ))}
      <div className="rule-thick" />
    </section>
  );
}
