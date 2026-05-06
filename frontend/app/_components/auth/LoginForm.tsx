"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { loginSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState } from "react";
import { apiClient } from "@/app/lib/apiClient";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

type Inputs = z.infer<typeof loginSchema>;

const inputWrapClass =
  "flex items-center gap-2.5 h-12 px-4 rounded-xl bg-dash-surface border border-dash-border focus-within:border-dash-green-mid focus-within:ring-2 focus-within:ring-dash-green-mid/20 transition-all";

const inputClass =
  "flex-1 bg-transparent text-sm text-dash-fg placeholder:text-[#3D5240] outline-none";

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
            autoComplete="username"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-dash-fg-secondary"
          >
            Hasło
          </label>
          <button
            type="button"
            className="text-xs text-dash-green hover:opacity-80 transition-opacity cursor-pointer"
          >
            Zapomniałeś hasła?
          </button>
        </div>
        <div className={inputWrapClass}>
          <Lock className="w-4 h-4 shrink-0 text-dash-fg-muted" />
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

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{
            color: "#FCA5A5",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
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
          background: "linear-gradient(180deg, #16A34A 0%, #15803D 100%)",
          boxShadow: "0 2px 10px rgba(34,197,94,0.3)",
        }}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Zaloguj się
      </button>
    </form>
  );
};
