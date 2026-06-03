"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { registerSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";

type Inputs = z.infer<typeof registerSchema>;

const inputWrapClass =
  "flex items-center gap-2.5 h-12 px-4 rounded-xl bg-dash-surface border border-dash-border focus-within:border-dash-green-mid focus-within:ring-2 focus-within:ring-dash-green-mid/20 transition-all";

const inputClass =
  "flex-1 bg-transparent text-sm text-dash-fg placeholder:text-dash-input-placeholder outline-none";

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError("");

    const { username, email, password } = data;
    const { error } = await apiClient.POST("/users/register", {
      body: { username, email, password },
    });

    if (error) {
      setError(error.message ?? "Coś poszło nie tak, spróbuj ponownie");
      setIsLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Nazwa użytkownika */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-sm font-medium text-dash-fg-secondary"
        >
          Nazwa użytkownika
        </label>
        <div className={inputWrapClass}>
          <User className="w-4 h-4 shrink-0 text-dash-fg-muted" />
          <input
            type="text"
            id="username"
            placeholder="jankowalski"
            className={inputClass}
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      {/* Email */}
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
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Hasło */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-dash-fg-secondary"
        >
          Hasło
        </label>
        <div className={inputWrapClass}>
          <Lock className="w-4 h-4 shrink-0 text-dash-fg-muted" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Min. 8 znaków"
            className={inputClass}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-dash-fg-muted hover:opacity-80 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Potwierdź hasło */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="passwordConfirm"
          className="text-sm font-medium text-dash-fg-secondary"
        >
          Potwierdź hasło
        </label>
        <div className={inputWrapClass}>
          <Lock className="w-4 h-4 shrink-0 text-dash-fg-muted" />
          <input
            type={showConfirm ? "text" : "password"}
            id="passwordConfirm"
            placeholder="Powtórz hasło"
            className={inputClass}
            {...register("passwordConfirm")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-dash-fg-muted hover:opacity-80 transition-colors cursor-pointer"
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.passwordConfirm && (
          <p className="text-xs text-red-400">
            {errors.passwordConfirm.message}
          </p>
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
        Utwórz konto
      </button>
    </form>
  );
};
