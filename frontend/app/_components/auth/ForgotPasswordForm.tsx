"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { forgotPasswordSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/app/lib/apiClient";
import { Mail, Loader2, MailCheck, ArrowLeft } from "lucide-react";

type Inputs = z.infer<typeof forgotPasswordSchema>;

const inputWrapClass =
  "flex items-center gap-2.5 h-12 px-3 bg-card border-2 border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

const inputClass =
  "flex-1 min-w-0 bg-transparent font-mono text-[15px] text-ink placeholder:text-ink-muted outline-none";

export const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setIsLoading(true);
    setError("");

    const { error } = await apiClient.POST("/users/forgot-password", {
      body: { email },
    });

    if (error) {
      setError(error.message ?? "Coś poszło nie tak, spróbuj ponownie");
      setIsLoading(false);
      return;
    }

    // Anti-enumeration: pokazujemy identyczny sukces niezależnie od tego, czy
    // email istnieje w bazie. Backend też zawsze zwraca 200 — front nie może
    // zdradzić, które adresy są zarejestrowane.
    setSubmitted(true);
  };

  // Success state — swap the form for a neutral confirmation.
  if (submitted) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm font-extrabold uppercase">
          <MailCheck className="w-5 h-5" aria-hidden="true" />
          Sprawdź skrzynkę
        </p>
        <p className="text-sm">
          Jeśli konto o tym adresie istnieje, wysłaliśmy na nie link do
          zresetowania hasła. Sprawdź swoją skrzynkę (również folder spam).
        </p>
        <Link
          href="/login"
          className="flex items-center justify-between min-h-12 px-4 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Wróć do logowania
          </span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-extrabold uppercase">
          Adres email
        </label>
        <div className={inputWrapClass}>
          <Mail className="w-4 h-4 shrink-0 text-ink-muted" />
          <input
            type="email"
            id="email"
            placeholder="jan@przyklad.pl"
            className={inputClass}
            autoComplete="email"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="font-mono text-xs text-accent">
            {errors.email.message}
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="font-mono text-sm px-3 py-2 border-2"
          style={{
            color: "var(--color-accent)",
            background: "var(--color-accent-tint)",
            border: "1px solid var(--color-accent)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex items-center justify-center gap-2 min-h-14 w-full bg-ink text-paper text-base font-extrabold uppercase tracking-wide hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Wyślij link resetujący
      </button>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 text-sm text-ink-muted hover:opacity-80 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do logowania
      </Link>
    </form>
  );
};
