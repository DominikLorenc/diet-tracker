import { CalorieCalculatorInputs } from "@/schemas/goalsSchema";

export type Goal = "lose" | "maintain" | "gain";
export type Gender = "male" | "female";



export type CalculatorResult = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

const ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9];

const CALORIE_ADJUSTMENTS: Record<Goal, number> = {
    lose: -500,
    maintain: 0,
    gain: 300,
};


// procenty kalorii — bardziej stabilne niż g/kg dla różnych wag ciała
const MACRO_RATIOS: Record<Goal, { protein: number; fat: number; carbs: number }> = {
    lose: { protein: 0.30, fat: 0.25, carbs: 0.45 },
    maintain: { protein: 0.25, fat: 0.30, carbs: 0.45 },
    gain: { protein: 0.25, fat: 0.25, carbs: 0.50 },
};

function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === "male" ? base + 5 : base - 161;
}

export function calculateCalories({
    weight,
    height,
    age,
    gender,
    activity,
    goal,
}: CalorieCalculatorInputs): CalculatorResult {
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
    const calories = Math.round(tdee + CALORIE_ADJUSTMENTS[goal]);

    const { protein: proteinRatio, fat: fatRatio, carbs: carbsRatio } = MACRO_RATIOS[goal];

    const protein = Math.round((calories * proteinRatio) / 4);
    const fat = Math.round((calories * fatRatio) / 9);
    const carbs = Math.round((calories * carbsRatio) / 4);

    return { calories, protein, carbs, fat };
}
