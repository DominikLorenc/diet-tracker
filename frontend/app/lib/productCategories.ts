import type { components } from "@/src/lib/api/schema";

// Single source of truth is the backend enum, surfaced here through the
// generated OpenAPI types. Never hand-write this union.
export type ProductCategory = components["schemas"]["Product"]["category"];

// Key order is the in-store walking order (Lidl) and drives the shopping list
// section order. Record<> is what forces every backend category to be listed:
// add one to the Prisma enum and this file stops compiling until it is labelled.
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  BREAD: "Pieczywo",
  FRUITS: "Owoce",
  VEGETABLES: "Warzywa",
  DRY_GOODS: "Produkty sypkie",
  SPICES: "Przyprawy",
  MEAT: "Mięso i wędliny",
  DAIRY: "Nabiał",
  BEVERAGES: "Napoje",
  OTHER: "Inne",
};

// Object.keys() always widens to string[]; the cast is safe because the
// annotation above pins the keys to exactly ProductCategory.
export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ProductCategory[];
