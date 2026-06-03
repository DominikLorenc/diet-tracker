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
      style={{
        background: "var(--color-dash-surface-darker)",
        borderBottom: "1px solid var(--color-dash-border)",
      }}
    >
      <Link
        href={variant === "dashboard" ? "/dashboard" : "/"}
        className="flex items-center gap-2"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "var(--gradient-green-logo)",
          }}
        >
          <Apple className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-lg font-bold"
          style={{ color: "var(--color-dash-fg)" }}
        >
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
              style={{ color: "var(--color-dash-fg-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-dash-fg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-dash-fg-muted)")
              }
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
                color: "var(--color-dash-fg-secondary)",
                background: "var(--background)",
                border: "1px solid var(--color-dash-border)",
              }}
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="px-3 py-2 md:px-5 md:py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
              style={{
                background: "var(--gradient-green-button)",
                boxShadow: "var(--shadow-green-nav)",
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
                color: "var(--color-dash-fg-secondary)",
                background: "var(--background)",
                border: "1px solid var(--color-dash-border)",
              }}
              title="Lista zakupów"
            >
              🛒
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80 cursor-pointer"
              style={{
                color: "var(--color-dash-fg-secondary)",
                background: "var(--background)",
                border: "1px solid var(--color-dash-border)",
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
