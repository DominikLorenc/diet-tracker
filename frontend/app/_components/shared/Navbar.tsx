import Link from "next/link";

const NAV_LINKS = [
  { href: "#funkcje", label: "Funkcje" },
  { href: "#jak-to-dziala", label: "Jak to działa" },
];

/** Marketing navbar for the public landing page. The dashboard has its own nav in its layout. */
export default function Navbar() {
  return (
    <nav
      aria-label="Nawigacja strony"
      className="sticky top-0 z-50 flex items-center justify-between gap-4 h-16 px-4 md:px-10 lg:px-20 bg-paper border-b-2 border-ink"
    >
      <Link
        href="/"
        className="font-display text-2xl uppercase leading-none [font-stretch:62%]"
      >
        Diet Tracker
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-sm font-bold uppercase hover:underline underline-offset-4"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center">
        <Link
          href="/login"
          className="flex items-center min-h-10 px-3 md:px-4 border-2 border-ink text-sm font-extrabold uppercase hover:bg-card transition-colors"
        >
          Zaloguj
        </Link>
        <Link
          href="/register"
          className="flex items-center min-h-10 px-3 md:px-4 border-2 border-l-0 border-ink bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent hover:border-accent transition-colors"
        >
          Załóż konto
        </Link>
      </div>
    </nav>
  );
}
