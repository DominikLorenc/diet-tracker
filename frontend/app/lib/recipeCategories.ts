import type { paths } from "@/src/lib/api/schema";

type CategoryCountsResponse =
  paths["/recipes/categories"]["get"]["responses"][200]["content"]["application/json"];

// Single source of truth is the backend enum, surfaced through the generated OpenAPI types.
export type RecipeCategory =
  CategoryCountsResponse["categories"][number]["category"];

export type RecipeCategoryCount = CategoryCountsResponse["categories"][number];

// Record<> forces a label for every backend category: adding one to the Prisma enum
// makes this file stop compiling until it is labelled. Key order is the filter list order.
export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  OATMEAL_PUDDING: "Owsianki, puddingi",
  YOGURT_COTTAGE: "Jogurty, serki",
  CAKES_COOKIES: "Ciasta, ciasteczka, muffinki",
  SANDWICHES_TOASTS: "Kanapki, tosty",
  PANCAKES: "Naleśniki, placki",
  EGGS: "Jajecznice, szakszuki, omlety",
  WRAPS: "Tortille, wrapy",
  TRADITIONAL: "Dania tradycyjne",
  SALADS: "Sałatki",
  PASTA: "Makarony",
  SMOOTHIES: "Koktajle",
  FAST_FOOD: "Zdrowe fast foody",
  READY_MEALS: "Gotowce",
  DESSERTS: "Zdrowe desery",
  SOUPS: "Zupy",
  MAIN_DISHES: "Dania obiadowe",
  SNACKS: "Przekąski",
};

const isRecipeCategory = (value: string): value is RecipeCategory =>
  Object.hasOwn(RECIPE_CATEGORY_LABELS, value);

// The URL can be edited by hand, so keep only known, unique categories
export const parseCategoriesParam = (
  value: string | null,
): RecipeCategory[] => [
  ...new Set((value ?? "").split(",").filter(isRecipeCategory)),
];
