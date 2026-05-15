"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { apiClient } from "@/app/lib/apiClient";

type NavbarProps = {
  variant: "public" | "dashboard";
};

export default function Navbar({ variant }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await apiClient.DELETE("/users/logout");
    router.push("/login");
  };

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between h-[64px] px-4 md:px-20"
      style={{ background: "#111C14", borderBottom: "1px solid #1E3322" }}
    >
      <Link
        href={variant === "dashboard" ? "/dashboard" : "/"}
        className="flex items-center gap-2"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(180deg, #22C55E 0%, #16A34A 100%)",
          }}
        >
          <Apple className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold" style={{ color: "#F3F7FF" }}>
          DietTracker
        </span>
      </Link>

      {variant === "public" && (
        <div className="hidden md:flex items-center gap-9">
          {[
            { href: "#funkcje", label: "Funkcje" },
            { href: "#jak-to-dziala", label: "Jak to działa" },
            { href: "#cennik", label: "Cennik" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[15px] transition-colors hover:opacity-100"
              style={{ color: "#8FA0B8" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F3F7FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8FA0B8")}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {variant === "public" ? (
          <>
            <Link
              href="/login"
              className="px-3 py-2 md:px-5 md:py-2.5 text-sm font-semibold rounded-lg transition-all hover:opacity-80"
              style={{
                color: "#94A3B8",
                background: "#0F1A10",
                border: "1px solid #1E3322",
              }}
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="px-3 py-2 md:px-5 md:py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(180deg, #16A34A 0%, #15803D 100%)",
                boxShadow: "0 2px 10px rgba(34,197,94,0.25)",
              }}
            >
              <span className="hidden sm:inline">Zacznij za darmo</span>
              <span className="sm:hidden">Rejestracja</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard/shopping-list"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all hover:opacity-80"
              style={{
                color: "#94A3B8",
                background: "#0F1A10",
                border: "1px solid #1E3322",
              }}
              title="Lista zakupów"
            >
              🛒
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80 cursor-pointer"
              style={{
                color: "#94A3B8",
                background: "#0F1A10",
                border: "1px solid #1E3322",
              }}
            >
              Wyloguj się
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
