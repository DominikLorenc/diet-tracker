"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-64 h-full bg-gray-900 flex flex-col p-4 gap-2">
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
      <main className="flex-1 overflow-auto  bg-gray-950">{children}</main>
    </div>
  );
}
