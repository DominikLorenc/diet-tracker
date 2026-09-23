"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { loginSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { apiClient } from "@/app/lib/apiClient";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

type Inputs = z.infer<typeof loginSchema>;

const inputWrapClass =
  "flex items-center gap-2.5 h-12 px-3 bg-card border-2 border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

const inputClass =
  "flex-1 min-w-0 bg-transparent font-mono text-[15px] text-ink placeholder:text-ink-muted outline-none";

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (body) => {
    setIsLoading(true);
    setError("");

    const { error } = await apiClient.POST("/users/login", { body });

    if (error) {
      setError(error.message ?? "Unexpected error");
      setIsLoading(false);
      return;
    }
    router.push("/dashboard");
  };

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
            autoComplete="username"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="font-mono text-xs text-accent">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[13px] font-extrabold uppercase"
          >
            Hasło
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-bold underline underline-offset-2 hover:text-accent cursor-pointer"
          >
            Zapomniałeś hasła?
          </Link>
        </div>
        <div className={inputWrapClass}>
          <Lock className="w-4 h-4 shrink-0 text-ink-muted" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            className={inputClass}
            autoComplete="current-password"
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
        Zaloguj się
      </button>
    </form>
  );
};
