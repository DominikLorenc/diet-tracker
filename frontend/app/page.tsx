import Link from "next/link";
import AnimateOnScroll from "./_components/shared/AnimateOnScroll";
import Navbar from "./_components/shared/Navbar";

const FEATURES = [
  {
    title: "Dziennik żywieniowy",
    desc: "Loguj posiłki w sekundy. Baza produktów z gotowymi makrami i skaner kodów kreskowych.",
  },
  {
    title: "Śledzenie makroskładników",
    desc: "Białko, węglowodany i tłuszcze liczone na bieżąco względem Twojego dziennego celu.",
  },
  {
    title: "Kreator przepisów",
    desc: "Twórz własne przepisy i automatycznie obliczaj ich wartości odżywcze.",
  },
];

const STEPS = [
  {
    title: "Załóż konto",
    desc: "Rejestracja zajmuje chwilę. Ustaw cel — schudnięcie, przybranie lub utrzymanie wagi.",
  },
  {
    title: "Loguj posiłki",
    desc: "Wyszukaj produkt lub zeskanuj kod kreskowy. Dodaj porcję i gotowe — makra przeliczają się same.",
  },
  {
    title: "Obserwuj postępy",
    desc: "Sprawdzaj bilans kalorii, zapisuj pomiary i dostosowuj dietę na podstawie danych.",
  },
];

// Illustrative values for the hero label — clearly marked as an example
const SAMPLE_MACROS = [
  { label: "Białko", value: "112 / 150 g", percent: "75%" },
  { label: "Węglowodany", value: "158 / 250 g", percent: "63%" },
  { label: "Tłuszcze", value: "41 / 70 g", percent: "59%" },
];

const SECTION_X = "px-4 md:px-10 lg:px-20";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-ink font-sans">
      <Navbar />

      {/* Hero */}
      <section
        className={`grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] items-center py-14 lg:py-20 ${SECTION_X}`}
      >
        <div className="flex flex-col gap-8">
          <p className="font-mono text-xs uppercase tracking-wide">
            Darmowy tracker kalorii i makroskładników
          </p>
          <h1 className="font-display text-[76px] sm:text-[112px] lg:text-[140px] uppercase leading-[0.82] [font-stretch:62%]">
            Jedz
            <br />
            mądrze,
            <br />
            <span className="text-accent">osiągaj cele.</span>
          </h1>
          <p className="max-w-[520px] text-lg">
            Śledź kalorie, białko, węglowodany i tłuszcze. Buduj zdrowe nawyki z
            dziennikiem, który czyta się jak etykieta z opakowania.
          </p>
          <div className="flex flex-wrap">
            <Link
              href="/register"
              className="flex items-center gap-3 min-h-14 px-6 bg-accent text-white text-base font-extrabold uppercase tracking-wide hover:bg-accent-hover transition-colors"
            >
              Zacznij za darmo <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center min-h-14 px-6 border-2 border-ink text-base font-extrabold uppercase tracking-wide hover:bg-card transition-colors"
            >
              Mam konto
            </Link>
          </div>
        </div>

        {/* Example label — the product in one picture */}
        <AnimateOnScroll animation="fade-in-right" delay={150}>
          <figure className="border-2 border-ink bg-card px-3 pt-1.5 pb-3 shadow-[var(--shadow-hard)]">
            <p className="font-display text-[38px] leading-none">
              Wartości dnia
            </p>
            <div className="flex justify-between text-sm pt-0.5 pb-1 border-b border-ink">
              <span>Cel dzienny</span>
              <span className="font-mono font-semibold">2200 kcal</span>
            </div>
            <div className="rule-thick" />
            <div className="flex items-end justify-between pt-1.5">
              <span className="font-display text-[32px] leading-none [font-stretch:75%]">
                Kalorie
              </span>
              <span className="font-mono text-[52px] font-semibold leading-none tracking-[-0.04em]">
                1418
              </span>
            </div>
            <div className="h-3.5 border-[1.5px] border-ink mt-2 mb-1">
              <div className="h-full w-[64%] bg-ink" />
            </div>
            <div className="flex justify-between font-mono text-xs pb-1">
              <span>64% celu</span>
              <span>
                zostało{" "}
                <strong className="font-semibold text-accent">782 kcal</strong>
              </span>
            </div>
            <div className="rule-medium" />
            {SAMPLE_MACROS.map((macro, idx) => (
              <div
                key={macro.label}
                className={`grid grid-cols-[minmax(0,1fr)_104px_44px] items-baseline py-1.5 text-[15px] ${
                  idx < SAMPLE_MACROS.length - 1 ? "border-b border-ink" : ""
                }`}
              >
                <span className="font-extrabold">{macro.label}</span>
                <span className="font-mono text-[13px]">{macro.value}</span>
                <span className="font-mono font-semibold text-right">
                  {macro.percent}
                </span>
              </div>
            ))}
            <div className="rule-thick" />
            <figcaption className="mt-1.5 text-[11px]">
              * Przykładowy dzień w aplikacji.
            </figcaption>
          </figure>
        </AnimateOnScroll>
      </section>

      {/* Features */}
      <section
        id="funkcje"
        aria-labelledby="features-heading"
        className={`py-14 lg:py-20 border-t-2 border-ink ${SECTION_X}`}
      >
        <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase">Funkcje</p>
            <h2
              id="features-heading"
              className="font-display text-[48px] sm:text-[56px] lg:text-[60px] uppercase leading-[0.9] [font-stretch:62%] break-words"
            >
              Wszystko, czego potrzebujesz
            </h2>
            <p>Jeden tracker do zarządzania dietą, przepisami i postępami.</p>
          </div>
          <AnimateOnScroll>
            <ol className="border-t-[10px] border-ink">
              {FEATURES.map((feature, idx) => (
                <li
                  key={feature.title}
                  className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 py-5 border-b border-ink"
                >
                  <span className="font-mono text-sm font-semibold pt-1.5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-[32px] leading-none">
                      {feature.title}
                    </h3>
                    <p className="max-w-[560px]">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </AnimateOnScroll>
        </div>
      </section>

      {/* How it works */}
      <section
        id="jak-to-dziala"
        aria-labelledby="steps-heading"
        className={`py-14 lg:py-20 border-t-2 border-ink bg-card ${SECTION_X}`}
      >
        <p className="font-mono text-xs uppercase">Jak to działa</p>
        <h2
          id="steps-heading"
          className="font-display text-[56px] lg:text-[72px] uppercase leading-[0.9] [font-stretch:65%] mt-3"
        >
          Zacznij w 3 krokach
        </h2>
        <ol className="grid gap-0 md:grid-cols-3 mt-8 border-2 border-ink">
          {STEPS.map((step, idx) => (
            <li
              key={step.title}
              className={`flex flex-col gap-3 p-5 ${
                idx > 0
                  ? "border-t-2 md:border-t-0 md:border-l-2 border-ink"
                  : ""
              }`}
            >
              <span className="font-display text-[88px] leading-[0.8] [font-stretch:62%]">
                {idx + 1}
              </span>
              <div className="rule-medium" />
              <h3 className="text-lg font-extrabold uppercase">{step.title}</h3>
              <p className="text-sm">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="cta-heading"
        className={`py-16 lg:py-24 bg-ink text-paper ${SECTION_X}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex flex-col gap-4">
            <h2
              id="cta-heading"
              className="font-display text-[64px] lg:text-[96px] uppercase leading-[0.85] [font-stretch:62%]"
            >
              Gotowy na
              <br />
              zmianę diety?
            </h2>
            <p className="text-lg max-w-[520px]">
              Zacznij śledzić makra już dziś — za darmo, bez karty kredytowej.
            </p>
          </div>
          <Link
            href="/register"
            className="self-start lg:self-auto flex items-center gap-3 min-h-14 px-6 bg-accent text-white text-base font-extrabold uppercase tracking-wide hover:bg-paper hover:text-ink transition-colors"
          >
            Stwórz darmowe konto <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-6 border-t-2 border-ink ${SECTION_X}`}
      >
        <span className="font-display text-xl uppercase [font-stretch:62%]">
          Diet Tracker
        </span>
        <span className="font-mono text-xs">
          © {new Date().getFullYear()} Diet Tracker
        </span>
      </footer>
    </main>
  );
}
