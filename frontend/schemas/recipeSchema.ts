import { z } from "zod";

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, "Nazwa przepisu jest wymagana"),
  products: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        imageUrl: z.string(),
        quantity: z.number().positive("Ilość musi być większa od 0"),
      }),
    )
    .min(1, "Dodaj przynajmniej jeden składnik"),
  steps: z.array(z.object({ value: z.string() })),
});
