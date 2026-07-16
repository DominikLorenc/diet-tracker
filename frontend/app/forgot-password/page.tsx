import { ForgotPasswordForm } from "@/app/_components/auth/ForgotPasswordForm";
import { Apple, KeyRound, ShieldCheck, Clock } from "lucide-react";

const features = [
  { icon: KeyRound, text: "Bezpieczny, jednorazowy link resetujący" },
  { icon: Clock, text: "Link ważny przez ograniczony czas" },
  { icon: ShieldCheck, text: "Twoje dane pozostają chronione" },
];

export default function ForgotPassword() {
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
              Odzyskaj dostęp do swojego konta
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

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <h2
              className="text-3xl font-bold"
              style={{ color: "var(--color-dash-fg)" }}
            >
              Zapomniałeś hasła?
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--color-dash-fg-muted)" }}
            >
              Podaj swój email, a wyślemy Ci link do zresetowania hasła
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
