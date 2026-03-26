import { z } from "zod";

export const goalsSchema = z.object({
  dailyCaloriesGoal: z.number().int().min(0),
  dailyProteinGoal: z.number().int().min(0),
  dailyCarbsGoal: z.number().int().min(0),
  dailyFatGoal: z.number().int().min(0),
});

export type GoalsInputs = z.infer<typeof goalsSchema>;

export const calorieCalculatorSchema = z.object({
  weight: z
    .number({ error: "Podaj wagę" })
    .min(1, "Waga musi być większa od 0"),
  height: z
    .number({ error: "Podaj wzrost" })
    .min(1, "Wzrost musi być większy od 0"),
  age: z.number({ error: "Podaj wiek" }).min(1, "Wiek musi być większy od 0"),
  gender: z.enum(["male", "female"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  activity: z.number().min(0).max(3),
});

export type CalorieCalculatorInputs = z.infer<typeof calorieCalculatorSchema>;
