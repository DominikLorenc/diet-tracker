import { z } from "zod";

const passwordSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Hasło jest wymagane"
        : "Hasło musi być tekstem",
  })
  .min(8, "Hasło musi mieć min. 8 znaków")
  .max(64, "Hasło może mieć max. 64 znaki")
  .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
  .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
  .regex(
    /[^A-Za-z0-9]/,
    "Hasło musi zawierać co najmniej jeden znak specjalny",
  );

export const registerSchema = z
  .object({
    email: z.email({ message: "Niepoprawny email" }),
    username: z.string().min(1, "Nazwa użytkownika jest wymagana"),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą się zgadzać",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z.email({ message: "Niepoprawny email" }),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Hasło jest wymagane"
          : "Hasło musi być tekstem",
    })
    .min(8, "Hasło musi mieć min. 8 znaków"),
});

// --- Password reset ---

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Niepoprawny email" }),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą się zgadzać",
    path: ["passwordConfirm"],
  });
