import { z } from "zod";

export const goalsSchema = z.object({
  dailyCaloriesGoal: z.number().int().min(0),
  dailyProteinGoal: z.number().int().min(0),
  dailyCarbsGoal: z.number().int().min(0),
  dailyFatGoal: z.number().int().min(0),
});

export type GoalsInputs = z.infer<typeof goalsSchema>;

export const calorieCalculatorSchema = z.object({
  weight: z.number().min(0),
  height: z.number().min(0),
  age: z.number().min(0),
  gender: z.enum(["male", "female"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  activity: z.number().min(0).max(3),
});

export type CalorieCalculatorInputs = z.infer<typeof calorieCalculatorSchema>;



