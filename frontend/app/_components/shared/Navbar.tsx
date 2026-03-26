"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { apiClient, ApiError } from "@/app/lib/apiClient";

type NavbarProps = {
  variant: "public" | "dashboard";
};

export default function Navbar({ variant }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.delete("/users/logout");
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-[64px] px-4 md:px-20 bg-white border-b border-gray-100">
      <Link
        href={variant === "dashboard" ? "/dashboard" : "/"}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 bg-gradient-to-br from-[#ff6b6b] to-[#e8503a] flex items-center justify-center shrink-0">
          <Apple className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-text-primary">DietTracker</span>
      </Link>

      {variant === "public" && (
        <div className="hidden md:flex items-center gap-9">
          <a
            href="#funkcje"
            className="text-[15px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Funkcje
          </a>
          <a
            href="#jak-to-dziala"
            className="text-[15px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Jak to działa
          </a>
          <a
            href="#cennik"
            className="text-[15px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Cennik
          </a>
        </div>
      )}

      <div className="flex items-center gap-2">
        {variant === "public" ? (
          <>
            <Link
              href="/login"
              className="px-3 py-2 md:px-5 md:py-2.5 text-sm font-semibold text-text-primary bg-surface-muted rounded-lg hover:bg-gray-200 transition-colors"
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="px-3 py-2 md:px-5 md:py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-[#ff5252] transition-colors"
            >
              <span className="hidden sm:inline">Zacznij za darmo</span>
              <span className="sm:hidden">Rejestracja</span>
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-text-primary bg-surface-muted rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Wyloguj się
          </button>
        )}
      </div>
    </nav>
  );
}
