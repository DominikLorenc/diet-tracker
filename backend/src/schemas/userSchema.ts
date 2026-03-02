import { z } from "zod";

const userSchema = z.object({
    username: z
        .string({
            error: (issue) =>
                issue.input === undefined ? "Username is required" : "Username must be a string",
        })
        .trim()
        .min(1, "Username cannot be empty"),

    email: z
        .string({
            error: (issue) =>
                issue.input === undefined ? "Email is required" : "Email must be a string",
        })
        .trim()
        .pipe(z.email("Please provide a valid email address")),

    password: z
        .string({
            error: (issue) =>
                issue.input === undefined ? "Password is required" : "Password must be a string",
        })
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password cannot exceed 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const registerSchema = userSchema
    .extend({
        passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords must match",
        path: ["passwordConfirm"],
    });

export const loginSchema = userSchema.pick({
    email: true,
    password: true,
});
