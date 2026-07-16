import { ResetPasswordForm } from "@/app/_components/auth/ResetPasswordForm";
import Link from "next/link";
import {
  Apple,
  KeyRound,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";

const features = [
  { icon: KeyRound, text: "Ustaw nowe, silne hasło" },
  { icon: Clock, text: "Link działa tylko przez ograniczony czas" },
  { icon: ShieldCheck, text: "Po zmianie hasła link wygasa na zawsze" },
];

// Server Component. W Next 15 `searchParams` jest Promise — dlatego await.
// Odczytujemy token TU (na serwerze) i przekazujemy go w dół do formularza,
// zamiast używać useSearchParams() w kliencie (mniej boilerplate, bez Suspense).
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      {/* Left panel – branding */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-center items-center gap-10 px-12 py-16"
        style={{
          background: "var(--color-dash-surface-darker)",
          borderRight: "1px solid var(--color-dash-border)",
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--gradient-green-logo)",
              boxShadow: "var(--shadow-green-logo)",
            }}
          >
            <Apple className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-dash-fg)" }}
            >
              DietTracker
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--color-dash-fg-muted)" }}
            >
              Ustaw nowe hasło do swojego konta
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "var(--color-dash-surface)",
                  border: "1px solid var(--color-dash-border)",
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: "var(--color-dash-green)" }}
                />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-dash-fg-secondary)" }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form or invalid-link state */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          {token ? (
            <>
              <div className="mb-8">
                <h2
                  className="text-3xl font-bold"
                  style={{ color: "var(--color-dash-fg)" }}
                >
                  Ustaw nowe hasło
                </h2>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--color-dash-fg-muted)" }}
                >
                  Wpisz nowe hasło do swojego konta
                </p>
              </div>

              <ResetPasswordForm token={token} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--color-dash-surface)",
                  border: "1px solid var(--color-dash-border)",
                }}
              >
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-dash-fg)" }}
              >
                Nieprawidłowy link
              </h2>
              <p className="text-sm text-dash-fg-muted">
                Ten link do resetu hasła jest niekompletny lub nieprawidłowy.
                Poproś o nowy link resetujący.
              </p>
              <Link
                href="/forgot-password"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-dash-green)" }}
              >
                Wyślij nowy link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
