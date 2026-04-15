"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toast } from "../_components/shared/Toast";
import { apiClient } from "@/app/lib/apiClient";

const NAV_ITEMS = [
  { emoji: "📓", name: "Dziennik", href: "/dashboard" },
  { emoji: "📈", name: "Postępy", href: "/dashboard/progress" },
  { emoji: "🥦", name: "Produkty", href: "/dashboard/products" },
  { emoji: "👤", name: "Profil", href: "/dashboard/profile" },
  { emoji: "📦", name: "Wszystkie produkty", href: "/dashboard/all" },
  { emoji: "🍳", name: "Przepisy", href: "/dashboard/recipes" },
];

const MOBILE_NAV = NAV_ITEMS.slice(0, 4);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await apiClient.DELETE("/users/logout");
    router.push("/login");
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0F1A10", fontFamily: "var(--font-jakarta)" }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className="hidden sm:flex w-[230px] h-full flex-col shrink-0"
        style={{ background: "#111C14", borderRight: "1px solid #1E3322" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 mx-3 mt-4 mb-2 px-2 py-2.5 rounded-xl"
          style={{
            background: "#111827",
            border: "1px solid #1E3322",
          }}
        >
          <div
            className="w-[22px] h-[22px] shrink-0 rounded-lg"
            style={{
              background: "linear-gradient(180deg, #22C55E 0%, #16A34A 100%)",
            }}
          />
          <span
            className="text-[20px] font-bold leading-none"
            style={{ color: "#F3F7FF" }}
          >
            DietTracker
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5 px-3 mt-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 h-[38px] rounded-xl text-[15px] font-semibold transition-all duration-150"
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(180deg, #16A34A 0%, #15803D 100%)",
                        color: "#FFFFFF",
                        boxShadow: "0 2px 10px rgba(34,197,94,0.25)",
                      }
                    : {
                        background: "#0F1A10",
                        border: "1px solid #1E3322",
                        color: "#AFC0D8",
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
              background: "linear-gradient(180deg, #16A34A 0%, #15803D 100%)",
              color: "#fff",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            D
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{
              color: "#9FB0C7",
              background: "#162218",
              border: "1px solid #1E3322",
            }}
          >
            Wyloguj
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-auto pb-[74px] sm:pb-0"
        style={{ background: "#0F1A10" }}
      >
        {children}
      </main>

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 flex items-center"
        style={{
          background: "#162218",
          height: "58px",
          borderTop: "1px solid #1E3322",
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
                style={{ color: isActive ? "#FFFFFF" : "#9FB0C7" }}
              >
                {item.emoji}
              </span>
              <span
                className="text-[10px] font-bold leading-none"
                style={{ color: isActive ? "#FFFFFF" : "#9FB0C7" }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
}
