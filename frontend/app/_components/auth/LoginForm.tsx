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
        <label htmlFor="email" className="text-sm font-medium text-[#374151]">
          Adres email
        </label>
        <div className="flex items-center gap-2.5 h-12 px-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
          <Mail className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="email"
            id="email"
            placeholder="jan@przyklad.pl"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            autoComplete="username"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[#374151]"
          >
            Hasło
          </label>
          <button
            type="button"
            className="text-xs text-brand-primary hover:opacity-80 transition-opacity cursor-pointer"
          >
            Zapomniałeś hasła?
          </button>
        </div>
        <div className="flex items-center gap-2.5 h-12 px-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
          <Lock className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            autoComplete="current-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-brand-primary text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Zaloguj się
      </button>
    </form>
  );
};
