import { ForgotPasswordForm } from "@/app/_components/auth/ForgotPasswordForm";
import { AuthFooterLink, AuthShell } from "@/app/_components/auth/AuthShell";

const features = [
  "Bezpieczny, jednorazowy link resetujący",
  "Link ważny przez ograniczony czas",
  "Twoje dane pozostają chronione",
];

export default function ForgotPassword() {
  return (
    <AuthShell
      title="Zapomniałeś hasła?"
      subtitle="Podaj swój email, a wyślemy Ci link do zresetowania hasła"
      features={features}
      footer={
        <AuthFooterLink
          question="Pamiętasz hasło?"
          href="/login"
          label="Zaloguj się"
        />
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
