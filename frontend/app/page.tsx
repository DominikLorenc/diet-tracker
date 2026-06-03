import Link from "next/link";
import AnimateOnScroll from "./_components/shared/AnimateOnScroll";
import Navbar from "./_components/shared/Navbar";

export default function Home() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <Navbar variant="public" />

      {/* Hero */}
      <section className="flex flex-col lg:flex-row items-center justify-between min-h-[640px] px-4 md:px-20 py-16 gap-12">
        <div className="flex flex-col gap-8 max-w-[580px]">
          <div
            className="flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full animate-fade-in-up"
            style={{
              background: "var(--color-dash-surface)",
              border: "1px solid var(--color-dash-border)",
              animationDelay: "100ms",
            }}
          >
            <div
              className="w-2 h-2 shrink-0 rounded-full"
              style={{ background: "var(--color-dash-green-mid)" }}
            />
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--color-dash-green)" }}
            >
              Darmowy tracker kalorii i makroskładników
            </span>
          </div>

          <div
            className="flex flex-col gap-1 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <h1
              className="text-[60px] font-bold leading-[1.1]"
              style={{
                color: "var(--color-dash-fg)",
                fontFamily: "var(--font-newsreader)",
              }}
            >
              Jedz mądrze,
            </h1>
            <h1
              className="text-[60px] font-bold leading-[1.1]"
              style={{
                background: "var(--gradient-green-logo)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "var(--font-newsreader)",
              }}
            >
              osiągaj cele.
            </h1>
          </div>

          <p
            className="text-lg leading-relaxed max-w-[520px] animate-fade-in-up"
            style={{
              color: "var(--color-dash-fg-muted)",
              animationDelay: "300ms",
            }}
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
              className="px-8 py-4 text-base font-bold text-white rounded-xl hover:scale-105 transition-all"
              style={{
                background: "var(--gradient-green-button)",
                boxShadow: "var(--shadow-green-cta)",
              }}
            >
              Zacznij za darmo →
            </Link>
            <button
              className="px-8 py-4 text-base font-semibold rounded-xl hover:scale-105 transition-all"
              style={{
                color: "var(--color-dash-fg-secondary)",
                background: "var(--color-dash-surface-darker)",
                border: "1px solid var(--color-dash-border)",
              }}
            >
              Zobacz demo
            </button>
          </div>

          <div
            className="flex items-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <span className="text-base">⭐⭐⭐⭐⭐</span>
            <span
              className="text-sm"
              style={{ color: "var(--color-dash-fg-muted)" }}
            >
              Dołącz do 12 000+ użytkowników
            </span>
          </div>
        </div>

        {/* App mockup */}
        <div
          className="hidden lg:block w-[520px] animate-fade-in-right"
          style={{ animationDelay: "300ms" }}
        >
          <div className="animate-float">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--color-dash-surface-darker)",
                border: "1px solid var(--color-dash-border)",
                boxShadow: "var(--shadow-mockup)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 h-14"
                style={{ borderBottom: "1px solid var(--color-dash-border)" }}
              >
                <span
                  className="text-[15px] font-bold"
                  style={{ color: "var(--color-dash-fg)" }}
                >
                  Dziennik — Wtorek, 25 marca
                </span>
                <span
                  className="text-[13px]"
                  style={{
                    color: "var(--color-dash-fg-muted)",
                    fontFamily: "var(--font-ibm-plex-mono)",
                  }}
                >
                  2025 / 2200 kcal
                </span>
              </div>

              {/* Calorie summary */}
              <div
                className="flex flex-col gap-2.5 px-5 py-4"
                style={{ borderBottom: "1px solid var(--color-dash-border)" }}
              >
                <span
                  className="text-[11px] font-bold tracking-[0.15em]"
                  style={{
                    color: "var(--color-dash-green)",
                    fontFamily: "var(--font-ibm-plex-mono)",
                  }}
                >
                  KALORIE
                </span>
                <div className="flex justify-between items-end">
                  <span
                    className="text-[30px] font-bold leading-none"
                    style={{
                      color: "var(--color-dash-fg)",
                      fontFamily: "var(--font-ibm-plex-mono)",
                    }}
                  >
                    2025 / 2200
                  </span>
                  <span
                    className="text-[12px] font-semibold text-right"
                    style={{ color: "var(--color-dash-fg-secondary)" }}
                  >
                    pozostało
                    <br />
                    175 kcal
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: "var(--color-macro-track)" }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: "92%",
                      background: "var(--gradient-calories)",
                    }}
                  />
                </div>

                {/* Macros */}
                <div className="flex gap-3 mt-0.5">
                  {[
                    {
                      label: "Białko",
                      value: "95g",
                      pct: "79%",
                      color: "var(--color-macro-protein)",
                    },
                    {
                      label: "Węgle",
                      value: "180g",
                      pct: "78%",
                      color: "var(--color-macro-carbs)",
                    },
                    {
                      label: "Tłuszcze",
                      value: "55g",
                      pct: "78%",
                      color: "var(--color-macro-fat)",
                    },
                  ].map((m) => (
                    <div key={m.label} className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: m.color }}
                        >
                          {m.label}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--color-dash-fg-muted)" }}
                        >
                          {m.value}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: "var(--color-macro-track)" }}
                      >
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: m.pct, background: m.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal entries */}
              <div className="flex flex-col px-5 py-4 gap-1">
                <div className="flex items-center justify-between h-9">
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: "var(--color-dash-fg)" }}
                  >
                    Śniadanie
                  </span>
                  <span
                    className="text-[13px]"
                    style={{
                      color: "var(--color-dash-fg-muted)",
                      fontFamily: "var(--font-ibm-plex-mono)",
                    }}
                  >
                    487 kcal
                  </span>
                </div>
                {[
                  {
                    icon: "🥣",
                    name: "Owsianka z owocami",
                    detail: "250g · 12g B · 58g W · 8g T",
                    kcal: "350 kcal",
                    highlighted: true,
                  },
                  {
                    icon: "☕",
                    name: "Kawa z mlekiem",
                    detail: "200ml · 3g B · 5g W · 3g T",
                    kcal: "137 kcal",
                    highlighted: false,
                  },
                ].map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between h-[52px] px-3 rounded-xl"
                    style={
                      entry.highlighted
                        ? {
                            background: "var(--color-dash-surface)",
                            border: "1px solid var(--color-dash-border)",
                          }
                        : { background: "transparent" }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{
                          background: "var(--color-dash-surface-alt)",
                          border: "1px solid var(--color-dash-border)",
                        }}
                      >
                        {entry.icon}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--color-dash-fg)" }}
                        >
                          {entry.name}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--color-dash-fg-muted)" }}
                        >
                          {entry.detail}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[13px] font-semibold"
                      style={{
                        color: "var(--color-dash-green)",
                        fontFamily: "var(--font-ibm-plex-mono)",
                      }}
                    >
                      {entry.kcal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="funkcje"
        className="flex flex-col items-center gap-16 px-4 md:px-20 py-20"
        style={{ background: "var(--color-landing-dark)" }}
      >
        <AnimateOnScroll className="flex flex-col items-center gap-4 text-center">
          <div
            className="px-4 py-1.5 rounded-full"
            style={{
              background: "var(--color-dash-surface)",
              border: "1px solid var(--color-dash-border)",
            }}
          >
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--color-dash-green)" }}
            >
              Funkcje
            </span>
          </div>
          <h2
            className="text-[40px] font-extrabold"
            style={{ color: "var(--color-dash-fg)" }}
          >
            Wszystko czego potrzebujesz
          </h2>
          <p
            className="text-lg leading-relaxed max-w-[520px] text-center"
            style={{ color: "var(--color-dash-fg-muted)" }}
          >
            Jeden tracker do zarządzania dietą, przepisami i postępami.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[
            {
              emoji: "📓",
              title: "Dziennik żywieniowy",
              desc: "Loguj posiłki w sekundy. Baza tysięcy produktów z gotowymi makrami.",
            },
            {
              emoji: "📊",
              title: "Śledzenie makroskładników",
              desc: "Wizualne wykresy białka, węglowodanów i tłuszczów w czasie rzeczywistym.",
            },
            {
              emoji: "🍽️",
              title: "Kreator przepisów",
              desc: "Twórz własne przepisy i automatycznie obliczaj ich wartości odżywcze.",
            },
          ].map((card, i) => (
            <AnimateOnScroll key={card.title} delay={i * 120}>
              <div
                className="flex flex-col gap-5 p-8 rounded-2xl hover:-translate-y-1 transition-all duration-300 h-full"
                style={{
                  background: "var(--color-dash-surface-darker)",
                  border: "1px solid var(--color-dash-border)",
                  boxShadow: "var(--shadow-dash-card)",
                }}
              >
                <div
                  className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px]"
                  style={{
                    background: "var(--color-dash-surface)",
                    border: "1px solid var(--color-dash-border)",
                  }}
                >
                  {card.emoji}
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: "var(--color-dash-fg)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: "var(--color-dash-fg-muted)" }}
                >
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
        className="flex flex-col items-center gap-16 px-4 md:px-20 py-20"
        style={{ background: "var(--background)" }}
      >
        <AnimateOnScroll className="flex flex-col items-center gap-4 text-center">
          <div
            className="px-4 py-1.5 rounded-full"
            style={{
              background: "var(--color-dash-surface)",
              border: "1px solid var(--color-dash-border)",
            }}
          >
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--color-dash-green)" }}
            >
              Jak to działa
            </span>
          </div>
          <h2
            className="text-[40px] font-extrabold"
            style={{ color: "var(--color-dash-fg)" }}
          >
            Zacznij w 3 krokach
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            {
              num: "1",
              title: "Załóż konto",
              desc: "Rejestracja zajmuje 30 sekund. Podaj cel — schudnięcie, przybranie lub utrzymanie wagi.",
            },
            {
              num: "2",
              title: "Loguj posiłki",
              desc: "Wyszukaj produkt lub zeskanuj kod kreskowy. Dodaj porcję i gotowe — makra przeliczają się automatycznie.",
            },
            {
              num: "3",
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
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-extrabold text-white"
                  style={{
                    background: "var(--gradient-green-button)",
                    boxShadow: "var(--shadow-green-step)",
                    fontFamily: "var(--font-ibm-plex-mono)",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: "var(--color-dash-fg)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: "var(--color-dash-fg-muted)" }}
                >
                  {step.desc}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="flex flex-col items-center gap-8 px-4 md:px-20 py-20"
        style={{
          background: "var(--gradient-cta)",
          borderTop: "1px solid var(--color-dash-border)",
        }}
      >
        <AnimateOnScroll className="flex flex-col items-center gap-8 w-full">
          <h2
            className="text-[48px] font-extrabold text-center"
            style={{
              color: "var(--color-dash-fg)",
              fontFamily: "var(--font-newsreader)",
            }}
          >
            Gotowy na zmianę diety?
          </h2>
          <p
            className="text-lg text-center leading-relaxed max-w-[560px]"
            style={{ color: "var(--color-dash-fg-muted)" }}
          >
            Zacznij śledzić makra już dziś — za darmo, bez karty kredytowej.
          </p>
          <Link
            href="/register"
            className="px-10 py-[18px] text-lg font-bold text-white rounded-2xl hover:scale-105 transition-all"
            style={{
              background: "var(--gradient-green-button)",
              boxShadow: "var(--shadow-green-cta-lg)",
            }}
          >
            Stwórz darmowe konto →
          </Link>
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-dash-fg-muted)" }}
          >
            Dołącz do 12 000+ użytkowników • Brak limitu wpisów
          </p>
        </AnimateOnScroll>
      </section>

      {/* Footer */}
      <footer
        className="flex items-center justify-between h-16 px-4 md:px-20"
        style={{
          background: "var(--color-dash-surface-darker)",
          borderTop: "1px solid var(--color-dash-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "var(--gradient-green-logo)",
            }}
          >
            🥗
          </div>
          <span
            className="text-base font-bold"
            style={{ color: "var(--color-dash-fg)" }}
          >
            DietTracker
          </span>
        </div>
        <div className="flex items-center gap-6">
          {["Prywatność", "Regulamin", "Kontakt"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[13px] transition-colors"
              style={{ color: "var(--color-dash-fg-muted)" }}
            >
              {link}
            </a>
          ))}
        </div>
        <span
          className="text-[13px]"
          style={{ color: "var(--color-dash-fg-muted)" }}
        >
          © 2025 DietTracker
        </span>
      </footer>
    </main>
  );
}
