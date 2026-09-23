"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { resetPasswordSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

type Inputs = z.infer<typeof resetPasswordSchema>;

const inputWrapClass =
  "flex items-center gap-2.5 h-12 px-3 bg-card border-2 border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

const inputClass =
  "flex-1 min-w-0 bg-transparent font-mono text-[15px] text-ink placeholder:text-ink-muted outline-none";

// `token` comes from the URL (?token=...) and is passed down by the page.
// It is NOT a form field the user types — it is context for the request.
type Props = {
  token: string;
};

export const ResetPasswordForm = ({ token }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError("");

    if (!token) {
      setError("Nieprawidłowy link");
      setIsLoading(false);
      return;
    }

    const { error } = await apiClient.POST("/users/reset-password", {
      body: { token, password: data.password },
    });
    if (error) {
      setError(error.message ?? "Coś poszło nie tak, spróbuj ponownie");
      setIsLoading(false);
      return;
    }

    // Success — send the user to login with a flag so we can confirm the change.
    router.push("/login?reset=success");

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Nowe hasło */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[13px] font-extrabold uppercase"
        >
          Nowe hasło
        </label>
        <div className={inputWrapClass}>
          <Lock className="w-4 h-4 shrink-0 text-ink-muted" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Min. 8 znaków"
            className={inputClass}
            autoComplete="new-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-ink-muted hover:opacity-80 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="font-mono text-xs text-accent">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Potwierdź nowe hasło */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="passwordConfirm"
          className="text-[13px] font-extrabold uppercase"
        >
          Potwierdź nowe hasło
        </label>
        <div className={inputWrapClass}>
          <Lock className="w-4 h-4 shrink-0 text-ink-muted" />
          <input
            type={showConfirm ? "text" : "password"}
            id="passwordConfirm"
            placeholder="Powtórz nowe hasło"
            className={inputClass}
            autoComplete="new-password"
            {...register("passwordConfirm")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-ink-muted hover:opacity-80 transition-colors cursor-pointer"
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.passwordConfirm && (
          <p className="font-mono text-xs text-accent">
            {errors.passwordConfirm.message}
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
        Ustaw nowe hasło
      </button>
    </form>
  );
};
