import { LoginForm } from "@/app/_components/auth/LoginForm";
import Link from "next/link";
import { Apple, Zap, TrendingUp, Target } from "lucide-react";

const features = [
  { icon: Zap, text: "Śledź kalorie i makroskładniki" },
  { icon: TrendingUp, text: "Analizuj swoje postępy" },
  { icon: Target, text: "Osiągaj swoje cele zdrowotne" },
];

export default function Login() {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0F1A10", fontFamily: "var(--font-jakarta)" }}
    >
      {/* Left panel – branding */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-center items-center gap-10 px-12 py-16"
        style={{ background: "#111C14", borderRight: "1px solid #1E3322" }}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #22C55E 0%, #16A34A 100%)",
              boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
            }}
          >
            <Apple className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#F3F7FF" }}>
              DietTracker
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#8FA0B8" }}>
              Twój inteligentny dziennik kalorii
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "#162218",
                  border: "1px solid #1E3322",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: "#4ADE80" }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "#94A3B8" }}
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
            <h2 className="text-3xl font-bold" style={{ color: "#F3F7FF" }}>
              Witaj ponownie
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#8FA0B8" }}>
              Zaloguj się do swojego konta
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm" style={{ color: "#8FA0B8" }}>
            Nie masz konta?{" "}
            <Link
              href="/register"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#4ADE80" }}
            >
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
