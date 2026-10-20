import type { MealType } from "@/app/_components/dashboard/DiaryDayView";

export const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Śniadanie",
  LUNCH: "Obiad",
  DINNER: "Kolacja",
  SNACK: "Przekąska",
};

// Best guess for the meal when there is no context (e.g. adding from a
// standalone page), based on the current local hour.
export function guessMealTypeByHour(hour: number): MealType {
  if (hour < 11) return "BREAKFAST";
  if (hour < 16) return "LUNCH";
  if (hour < 21) return "DINNER";
  return "SNACK";
}
