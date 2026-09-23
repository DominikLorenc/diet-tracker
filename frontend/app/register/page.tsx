import { RegisterForm } from "@/app/_components/auth/RegisterForm";
import { AuthFooterLink, AuthShell } from "@/app/_components/auth/AuthShell";

const features = [
  "Spersonalizowane cele kaloryczne",
  "Dziennik posiłków dzień po dniu",
  "Pomiary i wykres postępów",
];

export default function Register() {
  return (
    <AuthShell
      title="Utwórz konto"
      subtitle="Zajmie to mniej niż minutę"
      features={features}
      footer={
        <AuthFooterLink
          question="Masz już konto?"
          href="/login"
          label="Zaloguj się"
        />
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
