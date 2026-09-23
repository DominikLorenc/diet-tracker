import { ResetPasswordForm } from "@/app/_components/auth/ResetPasswordForm";
import { AuthShell } from "@/app/_components/auth/AuthShell";
import Link from "next/link";

const features = [
  "Ustaw nowe, silne hasło",
  "Link działa tylko przez ograniczony czas",
  "Po zmianie hasła link wygasa na zawsze",
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

  if (!token) {
    return (
      <AuthShell title="Nieprawidłowy link" features={features}>
        <p role="alert" className="text-sm">
          Ten link do resetu hasła jest niekompletny lub nieprawidłowy. Poproś o
          nowy link resetujący.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 flex items-center justify-between min-h-12 px-4 bg-ink text-paper font-extrabold uppercase hover:bg-accent transition-colors"
        >
          Wyślij nowy link <span aria-hidden="true">→</span>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Ustaw nowe hasło"
      subtitle="Wpisz nowe hasło do swojego konta"
      features={features}
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
