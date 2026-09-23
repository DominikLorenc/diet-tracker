"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  ChefHat,
  Menu,
  Plus,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { Toast } from "../_components/shared/Toast";
import { apiClient } from "@/app/lib/apiClient";
import { useUserStore } from "@/store/useUserStore";

type NavItem = {
  name: string;
  href: string;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Dziennik", href: "/dashboard" },
  { name: "Postępy", href: "/dashboard/progress" },
  { name: "Produkty", href: "/dashboard/products" },
  { name: "Przepisy", href: "/dashboard/recipes" },
  { name: "Kreator przepisów", href: "/dashboard/recipe-builder" },
  { name: "Lista zakupów", href: "/dashboard/shopping-list" },
  { name: "Profil", href: "/dashboard/profile" },
  { name: "Baza produktów", href: "/dashboard/all", adminOnly: true },
];

type TabItem = { name: string; href: string; Icon: LucideIcon };

// Mobile bottom bar has room for 4 tabs + the central "Dodaj" action;
// every other page lives in the "Więcej" sheet.
const MOBILE_TABS: TabItem[] = [
  { name: "Dziennik", href: "/dashboard", Icon: BookOpenText },
  { name: "Przepisy", href: "/dashboard/recipes", Icon: ChefHat },
];
const MOBILE_TABS_AFTER_ADD: TabItem[] = [
  { name: "Postępy", href: "/dashboard/progress", Icon: TrendingUp },
];

const ADD_HREF = "/dashboard/add";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const fetchUser = useUserStore((s) => s.fetchUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );
  const mobileTabHrefs = new Set(
    [...MOBILE_TABS, ...MOBILE_TABS_AFTER_ADD].map((tab) => tab.href),
  );
  const moreItems = visibleNavItems.filter(
    (item) => !mobileTabHrefs.has(item.href),
  );
  const isMoreActive = moreItems.some((item) => item.href === pathname);

  const handleLogout = async () => {
    await apiClient.DELETE("/users/logout");
    clearUser();
    router.push("/login");
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Close the "Więcej" sheet after navigating
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to route change (external: router)
    setIsMoreOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink font-sans">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden sm:flex w-[260px] h-full flex-col shrink-0 border-r-2 border-ink px-5 py-6 gap-7">
        <Link href="/dashboard" className="flex flex-col">
          <span className="font-display text-[30px] uppercase leading-[0.9] [font-stretch:62%]">
            Diet
            <br />
            Tracker
          </span>
          <span className="rule-thick mt-2" />
        </Link>

        <nav aria-label="Nawigacja główna" className="flex flex-col flex-1">
          {visibleNavItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between gap-2 min-h-11 px-2.5 text-sm uppercase whitespace-nowrap border-b border-ink transition-colors ${
                  isActive
                    ? "bg-ink text-paper font-extrabold"
                    : "font-bold hover:bg-card"
                }`}
              >
                <span>{item.name}</span>
                <span className="font-mono text-[11px] font-medium">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-3">
          <Link
            href={ADD_HREF}
            className="flex items-center justify-between min-h-[52px] px-3.5 bg-accent text-white font-extrabold uppercase hover:bg-accent-hover transition-colors"
          >
            <span>Dodaj produkt</span>
            <Plus size={18} strokeWidth={3} strokeLinecap="square" />
          </Link>
          <div className="flex items-center justify-between border-t border-ink pt-3">
            <span className="font-mono text-xs truncate">
              {user?.username ?? "…"}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-extrabold uppercase underline underline-offset-4 hover:text-accent cursor-pointer min-h-11"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-[80px] sm:pb-0">{children}</main>

      {/* ── Mobile "Więcej" sheet ───────────────────────────────── */}
      {isMoreOpen && (
        <div className="sm:hidden fixed inset-0 z-40">
          <button
            aria-label="Zamknij menu"
            className="absolute inset-0 bg-ink/35 cursor-default"
            onClick={() => setIsMoreOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Więcej"
            className="absolute left-0 right-0 bottom-[72px] bg-paper border-t-2 border-ink px-4 pt-3 pb-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-3xl uppercase">Więcej</span>
              <button
                aria-label="Zamknij"
                onClick={() => setIsMoreOpen(false)}
                className="w-11 h-11 flex items-center justify-center border-2 border-ink cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} strokeLinecap="square" />
              </button>
            </div>
            <div className="rule-thick mt-2" />
            <nav className="flex flex-col">
              {moreItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between min-h-12 px-1 border-b border-ink text-base uppercase ${
                      isActive ? "font-extrabold" : "font-bold"
                    }`}
                  >
                    <span>{item.name}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center justify-between min-h-12 px-1 text-base font-bold uppercase text-accent cursor-pointer"
              >
                Wyloguj
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav
        aria-label="Nawigacja główna"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 h-[72px] grid grid-cols-5 bg-paper border-t-2 border-ink"
      >
        {MOBILE_TABS.map((tab) => (
          <MobileTab
            key={tab.href}
            tab={tab}
            isActive={pathname === tab.href}
          />
        ))}
        <Link
          href={ADD_HREF}
          aria-current={pathname === ADD_HREF ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-[3px] bg-ink text-paper text-[11px] font-extrabold uppercase"
        >
          <Plus size={22} strokeWidth={3} strokeLinecap="square" />
          Dodaj
        </Link>
        {MOBILE_TABS_AFTER_ADD.map((tab) => (
          <MobileTab
            key={tab.href}
            tab={tab}
            isActive={pathname === tab.href}
          />
        ))}
        <button
          onClick={() => setIsMoreOpen((open) => !open)}
          aria-expanded={isMoreOpen}
          className={`flex flex-col items-center justify-center gap-[3px] text-[11px] uppercase cursor-pointer ${
            isMoreActive || isMoreOpen
              ? "font-extrabold text-ink shadow-[inset_0_4px_0_var(--color-ink)]"
              : "font-semibold text-ink-muted"
          }`}
        >
          <Menu size={22} strokeWidth={2} strokeLinecap="square" />
          Więcej
        </button>
      </nav>

      <Toast />
    </div>
  );
}

type MobileTabProps = { tab: TabItem; isActive: boolean };

function MobileTab({ tab, isActive }: MobileTabProps) {
  const { Icon } = tab;
  return (
    <Link
      href={tab.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex flex-col items-center justify-center gap-[3px] text-[11px] uppercase ${
        isActive
          ? "font-extrabold text-ink shadow-[inset_0_4px_0_var(--color-ink)]"
          : "font-semibold text-ink-muted"
      }`}
    >
      <Icon size={22} strokeWidth={2} strokeLinecap="square" />
      {tab.name}
    </Link>
  );
}
