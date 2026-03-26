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
    <div className="flex min-h-screen">
      {/* Left panel – branding */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-center items-center gap-10 px-12 py-16"
        style={{
          background: "linear-gradient(135deg, #ff6b6b 0%, #e8503a 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DietTracker</h1>
            <p className="mt-2 text-white/70 text-sm">
              Twój inteligentny dziennik kalorii
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary">
              Witaj ponownie
            </h2>
            <p className="mt-2 text-text-secondary text-sm">
              Zaloguj się do swojego konta
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-text-secondary">
            Nie masz konta?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-primary hover:opacity-80 transition-opacity"
            >
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
