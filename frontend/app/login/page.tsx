import { LoginForm } from "@/app/_components/auth/LoginForm";
import { AuthFooterLink, AuthShell } from "@/app/_components/auth/AuthShell";

const features = [
  "Śledź kalorie i makroskładniki",
  "Analizuj swoje postępy",
  "Osiągaj swoje cele zdrowotne",
];

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  return (
    <AuthShell
      title="Logowanie"
      subtitle="Zaloguj się do swojego konta"
      features={features}
      footer={
        <AuthFooterLink
          question="Nie masz konta?"
          href="/register"
          label="Załóż konto"
        />
      }
    >
      {reset === "success" && (
        <p
          role="status"
          className="mb-4 border-2 border-ink px-3 py-2 text-sm font-bold"
        >
          Hasło zostało zmienione. Możesz się teraz zalogować.
        </p>
      )}
      <LoginForm />
    </AuthShell>
  );
}
