import type { paths } from "@/src/lib/api/schema";
import type { Measurement } from "@/app/_types/measurements";

// Prisma Decimal columns reach the client as strings ("12.5"). Parse them once,
// right where the response comes in, so components can do math on real numbers
// ("46" + "12" would silently concatenate to "4612").

type ApiProduct =
  paths["/products/{id}"]["get"]["responses"][200]["content"]["application/json"]["product"];

type ApiMeasurement =
  paths["/measurements/{id}"]["get"]["responses"][200]["content"]["application/json"]["measurement"];

export type ParsedProduct = Omit<
  ApiProduct,
  "calories" | "carbs" | "protein" | "fat" | "gramsPerUnit" | "barcode"
> & {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  gramsPerUnit?: number;
  barcode?: string;
};

export const parseProduct = ({
  calories,
  carbs,
  protein,
  fat,
  gramsPerUnit,
  barcode,
  ...rest
}: ApiProduct): ParsedProduct => ({
  ...rest,
  calories: Number(calories),
  carbs: Number(carbs),
  protein: Number(protein),
  fat: Number(fat),
  gramsPerUnit: gramsPerUnit === null ? undefined : Number(gramsPerUnit),
  barcode: barcode ?? undefined,
});

export const parseMeasurement = ({
  weight,
  waist,
  hips,
  arm,
  thigh,
  ...rest
}: ApiMeasurement): Measurement => ({
  ...rest,
  weight: Number(weight),
  waist: Number(waist),
  hips: Number(hips),
  arm: Number(arm),
  thigh: thigh === null ? null : Number(thigh),
});
