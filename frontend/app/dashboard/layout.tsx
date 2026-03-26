"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../_components/shared/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "📋 Dziennik", href: "/dashboard" },
    { name: "🥗 Produkty", href: "/dashboard/products" },
    { name: "👤 Profil", href: "/dashboard/profile" },
    { name: "🥩 Wszystkie Produkty", href: "/dashboard/all" },
    { name: "📝 Przepisy", href: "/dashboard/recipes" },
    { name: "🧠 Stówrz przepis", href: "/dashboard/recipe-builder" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar variant="dashboard" />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden sm:flex w-64 h-full bg-amber-400 flex-col p-4 gap-2">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-lg ${
                  pathname === item.href ? "bg-gray-700" : "hover:bg-gray-700"
                } text-white`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto bg-gray-600 pl-4 pr-4">
          {children}
        </main>
      </div>
    </div>
  );
}
