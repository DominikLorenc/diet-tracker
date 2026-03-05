import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 h-full bg-gray-900 flex flex-col p-4 gap-2">
        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-gray-700 text-white"
          >
            📋 Dziennik{" "}
          </Link>
          <Link
            href="/dashboard/products"
            className="block px-4 py-2 rounded-lg hover:bg-gray-700 text-white"
          >
            🥗 Produkty
          </Link>
          <Link
            href="/dashboard/profile"
            className="block px-4 py-2 rounded-lg hover:bg-gray-700 text-white"
          >
            👤 Profil
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto  bg-gray-950">{children}</main>
    </div>
  );
}
