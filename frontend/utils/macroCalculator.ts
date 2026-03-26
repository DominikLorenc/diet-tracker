type MacroField =
  | "protein_g"
  | "protein_pct"
  | "fat_g"
  | "fat_pct"
  | "carbs_g"
  | "carbs_pct"
  | "kcal";

export type MacroValues = {
  protein_g: number;
  protein_pct: number;
  fat_g: number;
  fat_pct: number;
  carbs_g: number;
  carbs_pct: number;
};
const MACRO_CONFIG = {
  protein: { kcalPerGram: 4 },
  fat: { kcalPerGram: 9 },
  carbs: { kcalPerGram: 4 },
};

// const MACRO_FIELDS: MacroField[] = [
//     "protein_g",
//     "protein_pct",
//     "fat_g",
//     "fat_pct",
//     "carbs_g",
//     "carbs_pct",
//     "kcal",
// ]

type MacroFieldWithoutKcal = Exclude<MacroField, "kcal">;

const config: Record<
  MacroFieldWithoutKcal,
  {
    outputField: MacroFieldWithoutKcal;
    calc: (value: number, kcal: number) => number;
  }
> = {
  protein_g: {
    outputField: "protein_pct",
    calc: (value: number, kcal: number) =>
      Math.round(((value * MACRO_CONFIG.protein.kcalPerGram) / kcal) * 100),
  },
  protein_pct: {
    outputField: "protein_g",
    calc: (value: number, kcal: number) =>
      Math.round((kcal * value) / (MACRO_CONFIG.protein.kcalPerGram * 100)),
  },
  fat_g: {
    outputField: "fat_pct",
    calc: (value: number, kcal: number) =>
      Math.round(((value * MACRO_CONFIG.fat.kcalPerGram) / kcal) * 100),
  },
  fat_pct: {
    outputField: "fat_g",
    calc: (value: number, kcal: number) =>
      Math.round((kcal * value) / (MACRO_CONFIG.fat.kcalPerGram * 100)),
  },
  carbs_g: {
    outputField: "carbs_pct",
    calc: (value: number, kcal: number) =>
      Math.round(((value * MACRO_CONFIG.carbs.kcalPerGram) / kcal) * 100),
  },
  carbs_pct: {
    outputField: "carbs_g",
    calc: (value: number, kcal: number) =>
      Math.round((kcal * value) / (MACRO_CONFIG.carbs.kcalPerGram * 100)),
  },
};

export function recalculate(
  changedField: MacroField,
  newValue: number,
  current: MacroValues & { kcal: number },
): Partial<MacroValues> {
  if (changedField === "kcal") {
    return {
      protein_g: Math.round(
        (current.protein_pct * newValue) /
          (MACRO_CONFIG.protein.kcalPerGram * 100),
      ),
      fat_g: Math.round(
        (current.fat_pct * newValue) / (MACRO_CONFIG.fat.kcalPerGram * 100),
      ),
      carbs_g: Math.round(
        (current.carbs_pct * newValue) / (MACRO_CONFIG.carbs.kcalPerGram * 100),
      ),
    };
  }

  const { outputField, calc } = config[changedField];
  return { [outputField]: calc(newValue, current.kcal) };
}
