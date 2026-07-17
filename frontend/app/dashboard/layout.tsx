"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toast } from "../_components/shared/Toast";
import { apiClient } from "@/app/lib/apiClient";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";

type NavItem = {
  emoji: string;
  name: string;
  /** Shorter label for the mobile bottom bar, where space is tight */
  shortName: string;
  href: string;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { emoji: "📓", name: "Dziennik", shortName: "Dziennik", href: "/dashboard" },
  {
    emoji: "📈",
    name: "Postępy",
    shortName: "Postępy",
    href: "/dashboard/progress",
  },
  {
    emoji: "🥦",
    name: "Produkty",
    shortName: "Produkty",
    href: "/dashboard/products",
  },
  {
    emoji: "🍳",
    name: "Przepisy",
    shortName: "Przepisy",
    href: "/dashboard/recipes",
  },
  {
    emoji: "🛒",
    name: "Lista zakupów",
    shortName: "Zakupy",
    href: "/dashboard/shopping-list",
  },
  {
    emoji: "👤",
    name: "Profil",
    shortName: "Profil",
    href: "/dashboard/profile",
  },
  {
    emoji: "📦",
    name: "Baza produktów",
    shortName: "Baza",
    href: "/dashboard/all",
    adminOnly: true,
  },
];

// Admin tooling stays on desktop: a seventh tab does not fit the mobile bar,
// and managing the catalog is not a phone task.
const MOBILE_NAV = NAV_ITEMS.filter((item) => !item.adminOnly);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const fetchUser = useUserStore((s) => s.fetchUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const isAdmin = useUserStore((s) => s.user?.role === "ADMIN");

  const sidebarItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await apiClient.DELETE("/users/logout");
    clearUser();
    router.push("/login");
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className="hidden sm:flex w-[230px] h-full flex-col shrink-0"
        style={{
          background: "var(--color-dash-surface-darker)",
          borderRight: "1px solid var(--color-dash-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 mx-3 mt-4 mb-2 px-2 py-2.5 rounded-xl"
          style={{
            background: "var(--color-dash-logo-bg)",
            border: "1px solid var(--color-dash-border)",
          }}
        >
          <div
            className="w-[22px] h-[22px] shrink-0 rounded-lg"
            style={{
              background: "var(--gradient-green-logo)",
            }}
          />
          <span
            className="text-[20px] font-bold leading-none"
            style={{ color: "var(--color-dash-fg)" }}
          >
            DietTracker
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5 px-3 mt-2 flex-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 h-[38px] rounded-xl text-[15px] font-semibold transition-all duration-150"
                style={
                  isActive
                    ? {
                        background: "var(--gradient-green-button)",
                        color: "var(--color-white)",
                        boxShadow: "var(--shadow-green-nav)",
                      }
                    : {
                        background: "var(--background)",
                        border: "1px solid var(--color-dash-border)",
                        color: "var(--color-dash-nav-inactive)",
                      }
                }
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer + logout */}
        <div className="px-3 py-4 flex items-center justify-between">
          <div
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--gradient-green-button)",
              color: "var(--color-white)",
              border: "1px solid var(--color-green-mid-border)",
            }}
          >
            D
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{
              color: "var(--color-dash-fg-dim)",
              background: "var(--color-dash-surface)",
              border: "1px solid var(--color-dash-border)",
            }}
          >
            Wyloguj
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-auto pb-[74px] sm:pb-0"
        style={{ background: "var(--background)" }}
      >
        {children}
      </main>

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 flex items-center"
        style={{
          background: "var(--color-dash-surface)",
          height: "58px",
          borderTop: "1px solid var(--color-dash-border)",
          zIndex: 50,
        }}
      >
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] py-2"
            >
              <span
                className="text-sm leading-none"
                style={{
                  color: isActive
                    ? "var(--color-white)"
                    : "var(--color-dash-fg-dim)",
                }}
              >
                {item.emoji}
              </span>
              <span
                className="text-[10px] font-bold leading-none"
                style={{
                  color: isActive
                    ? "var(--color-white)"
                    : "var(--color-dash-fg-dim)",
                }}
              >
                {item.shortName}
              </span>
            </Link>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
}
