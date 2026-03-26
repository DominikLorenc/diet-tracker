import Link from "next/link";
import AnimateOnScroll from "./_components/shared/AnimateOnScroll";
import Navbar from "./_components/shared/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <Navbar variant="public" />

      {/* Hero */}
      <section className="flex flex-col lg:flex-row items-center justify-between min-h-[640px] px-4 md:px-20 py-16 gap-12 bg-linear-to-br from-[#fff8f8] to-[#f3f4ff]">
        <div className="flex flex-col gap-8 max-w-[580px]">
          <div
            className="flex items-center gap-2 w-fit max-w-full px-3.5 py-1.5 rounded-full bg-[#fff0f0] animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-2 h-2 shrink-0 rounded-full bg-brand-primary" />
            <span className="text-[13px] font-semibold text-brand-primary leading-snug">
              Darmowy tracker kalorii i makroskładników
            </span>
          </div>

          <div
            className="flex flex-col gap-2 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <h1 className="text-[60px] font-extrabold leading-[1.1] text-text-primary">
              Jedz mądrze,
            </h1>
            <h1 className="text-[60px] font-extrabold leading-[1.1] text-brand-primary">
              osiągaj cele.
            </h1>
          </div>

          <p
            className="text-lg text-text-secondary leading-relaxed max-w-[520px] animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            Śledź kalorie, białko, węglowodany i tłuszcze.
            <br />
            Buduj zdrowe nawyki z inteligentnym dziennikiem żywieniowym.
          </p>

          <div
            className="flex items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <Link
              href="/register"
              className="px-8 py-4 text-base font-bold text-white bg-brand-primary rounded-xl hover:bg-[#ff5252] hover:scale-105 transition-all shadow-lg shadow-[#ff6b6b33]"
            >
              Zacznij za darmo →
            </Link>
            <button className="px-8 py-4 text-base font-semibold text-text-primary bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:scale-105 transition-all">
              Zobacz demo
            </button>
          </div>

          <div
            className="flex items-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <span className="text-base">⭐⭐⭐⭐⭐</span>
            <span className="text-sm text-text-muted">
              Dołącz do 12 000+ użytkowników
            </span>
          </div>
        </div>

        {/* App mockup — wjazd z prawej, potem float */}
        <div
          className="hidden lg:block w-[560px] animate-fade-in-right"
          style={{ animationDelay: "300ms" }}
        >
          <div className="animate-float">
            <div className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.09)] overflow-hidden">
              <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100">
                <span className="text-[15px] font-bold text-text-primary">
                  Dziennik — Wtorek, 25 marca
                </span>
                <span className="text-[13px] text-text-secondary">
                  2025 / 2200 kcal
                </span>
              </div>

              {/* Macro bars */}
              <div className="flex gap-3 px-6 py-5">
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex justify-between">
                    <span className="text-[12px] font-semibold text-macro-carbs">
                      Węglowodany
                    </span>
                    <span className="text-[12px] text-text-muted">
                      180 / 230g
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-macro-carbs transition-all"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex justify-between">
                    <span className="text-[12px] font-semibold text-macro-protein">
                      Białko
                    </span>
                    <span className="text-[12px] text-text-muted">
                      95 / 120g
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-macro-protein"
                      style={{ width: "79%" }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex justify-between">
                    <span className="text-[12px] font-semibold text-macro-fat">
                      Tłuszcze
                    </span>
                    <span className="text-[12px] text-text-muted">
                      55 / 70g
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-macro-fat"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Meal entries */}
              <div className="flex flex-col px-6 pb-5 gap-1">
                <div className="flex items-center justify-between h-10">
                  <span className="text-[13px] font-bold text-text-primary">
                    Śniadanie
                  </span>
                  <span className="text-[13px] text-text-muted">487 kcal</span>
                </div>
                <div className="flex items-center justify-between h-[52px] px-3 bg-[#fafafa] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#fff5f5] flex items-center justify-center text-base">
                      🥣
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold text-text-primary">
                        Owsianka z owocami
                      </span>
                      <span className="text-[11px] text-text-muted">
                        250g · 12g B · 58g W · 8g T
                      </span>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-brand-primary">
                    350 kcal
                  </span>
                </div>
                <div className="flex items-center justify-between h-[52px] px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-base">
                      ☕
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold text-text-primary">
                        Kawa z mlekiem
                      </span>
                      <span className="text-[11px] text-text-muted">
                        200ml · 3g B · 5g W · 3g T
                      </span>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-brand-primary">
                    137 kcal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="funkcje"
        className="flex flex-col items-center gap-16 px-4 md:px-20 py-20 bg-white"
      >
        <AnimateOnScroll className="flex flex-col items-center gap-4 text-center">
          <div className="px-4 py-1.5 rounded-full bg-[#f0f0ff]">
            <span className="text-[13px] font-semibold text-brand-secondary">
              Funkcje
            </span>
          </div>
          <h2 className="text-[40px] font-extrabold text-text-primary">
            Wszystko czego potrzebujesz
          </h2>
          <p className="text-lg text-text-secondary text-center leading-relaxed max-w-[520px]">
            Jeden tracker do zarządzania dietą, przepisami i postępami.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[
            {
              emoji: "📓",
              iconBg: "#fff0f0",
              title: "Dziennik żywieniowy",
              desc: "Loguj posiłki w sekundy. Baza tysięcy produktów z gotowymi makrami.",
            },
            {
              emoji: "📊",
              iconBg: "#f0f0ff",
              title: "Śledzenie makroskładników",
              desc: "Wizualne wykresy białka, węglowodanów i tłuszczów w czasie rzeczywistym.",
            },
            {
              emoji: "🍽️",
              iconBg: "#f0fdf4",
              title: "Kreator przepisów",
              desc: "Twórz własne przepisy i automatycznie obliczaj ich wartości odżywcze.",
            },
          ].map((card, i) => (
            <AnimateOnScroll key={card.title} delay={i * 120}>
              <div className="flex flex-col gap-5 p-8 bg-[#fafafa] border border-gray-100 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                <div
                  className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px]"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {card.emoji}
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  {card.title}
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="jak-to-dziala"
        className="flex flex-col items-center gap-16 px-4 md:px-20 py-20 bg-[#f9fafb]"
      >
        <AnimateOnScroll className="flex flex-col items-center gap-4 text-center">
          <div className="px-4 py-1.5 rounded-full bg-[#fff0f0]">
            <span className="text-[13px] font-semibold text-brand-primary">
              Jak to działa
            </span>
          </div>
          <h2 className="text-[40px] font-extrabold text-text-primary">
            Zacznij w 3 krokach
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            {
              num: "1",
              color: "#ff6b6b",
              title: "Załóż konto",
              desc: "Rejestracja zajmuje 30 sekund. Podaj cel — schudnięcie, przybranie lub utrzymanie wagi.",
            },
            {
              num: "2",
              color: "#6366f1",
              title: "Loguj posiłki",
              desc: "Wyszukaj produkt lub zeskanuj kod kreskowy. Dodaj porcję i gotowe — makra przeliczają się automatycznie.",
            },
            {
              num: "3",
              color: "#22c55e",
              title: "Obserwuj postępy",
              desc: "Analizuj trendy, sprawdzaj bilans kalorii i dostosowuj dietę na podstawie danych.",
            },
          ].map((step, i) => (
            <AnimateOnScroll
              key={step.num}
              animation="scale-in"
              delay={i * 150}
            >
              <div className="flex flex-col items-center gap-5 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-extrabold text-white shadow-lg"
                  style={{
                    backgroundColor: step.color,
                    boxShadow: `0 8px 24px ${step.color}44`,
                  }}
                >
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-8 px-4 md:px-20 py-20 bg-linear-to-br from-brand-primary to-brand-secondary">
        <AnimateOnScroll className="flex flex-col items-center gap-8 w-full">
          <h2 className="text-[48px] font-extrabold text-white text-center">
            Gotowy na zmianę diety?
          </h2>
          <p className="text-lg text-white/90 text-center leading-relaxed max-w-[560px]">
            Zacznij śledzić makra już dziś — za darmo, bez karty kredytowej.
          </p>
          <Link
            href="/register"
            className="px-10 py-[18px] text-lg font-bold text-brand-primary bg-white rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all shadow-xl"
          >
            Stwórz darmowe konto →
          </Link>
          <p className="text-sm text-white/75 text-center">
            Dołącz do 12 000+ użytkowników • Brak limitu wpisów
          </p>
        </AnimateOnScroll>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between h-16 px-4 md:px-20 bg-surface-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center text-sm">
            🥗
          </div>
          <span className="text-base font-bold text-white">NutriTrack</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-[13px] text-text-muted hover:text-white transition-colors"
          >
            Prywatność
          </a>
          <a
            href="#"
            className="text-[13px] text-text-muted hover:text-white transition-colors"
          >
            Regulamin
          </a>
          <a
            href="#"
            className="text-[13px] text-text-muted hover:text-white transition-colors"
          >
            Kontakt
          </a>
        </div>
        <span className="text-[13px] text-text-muted">© 2025 NutriTrack</span>
      </footer>
    </main>
  );
}
