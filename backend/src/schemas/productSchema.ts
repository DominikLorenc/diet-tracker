import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    calories: z.number().nonnegative("Calories must be a positive number"),
    carbs: z.number().nonnegative("Carbs must be a positive number"),
    protein: z.number().nonnegative("Protein must be a positive number"),
    fat: z.number().nonnegative("Fat must be a positive number"),
});


export const updateProductSchema = productSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

export const productIdSchema = z.uuid({ message: "Product ID must be a valid UUID" });
