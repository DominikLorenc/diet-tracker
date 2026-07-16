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
  "flex items-center gap-2.5 h-12 px-4 rounded-xl bg-dash-surface border border-dash-border focus-within:border-dash-green-mid focus-within:ring-2 focus-within:ring-dash-green-mid/20 transition-all";

const inputClass =
  "flex-1 bg-transparent text-sm text-dash-fg placeholder:text-dash-input-placeholder outline-none";

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
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--color-dash-surface)",
            border: "1px solid var(--color-dash-border)",
          }}
        >
          <MailCheck
            className="w-7 h-7"
            style={{ color: "var(--color-dash-green)" }}
          />
        </div>
        <p className="text-sm text-dash-fg-secondary">
          Jeśli konto o tym adresie istnieje, wysłaliśmy na nie link do
          zresetowania hasła. Sprawdź swoją skrzynkę (również folder spam).
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-dash-green)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-dash-fg-secondary"
        >
          Adres email
        </label>
        <div className={inputWrapClass}>
          <Mail className="w-4 h-4 shrink-0 text-dash-fg-muted" />
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
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{
            color: "var(--color-form-error)",
            background: "var(--color-form-error-bg)",
            border: "1px solid var(--color-form-error-border)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex items-center justify-center gap-2 h-12 w-full rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: "var(--gradient-green-button)",
          boxShadow: "var(--shadow-green-logo)",
        }}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Wyślij link resetujący
      </button>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 text-sm text-dash-fg-muted hover:opacity-80 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do logowania
      </Link>
    </form>
  );
};
