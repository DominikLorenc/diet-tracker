"use client";

import Link from "next/link";
import { Apple } from "lucide-react";

const NAV_LINKS = [
  { href: "#funkcje", label: "Funkcje" },
  { href: "#jak-to-dziala", label: "Jak to działa" },
  { href: "#cennik", label: "Cennik" },
];

/** Marketing navbar for the public landing page. The dashboard has its own nav in its layout. */
export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between h-[64px] px-4 md:px-20"
      style={{
        background: "var(--color-dash-surface-darker)",
        borderBottom: "1px solid var(--color-dash-border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2">
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

      <div className="hidden md:flex items-center gap-9">
        {NAV_LINKS.map((item) => (
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

      <div className="flex items-center gap-2">
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
      </div>
    </nav>
  );
}
