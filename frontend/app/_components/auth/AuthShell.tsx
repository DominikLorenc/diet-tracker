import { ReactNode } from "react";
import Link from "next/link";

type Props = {
  /** Heading of the form "label" */
  title: string;
  subtitle?: string;
  /** Short selling points shown as label rows in the side panel (desktop) */
  features: string[];
  /** Content under the label, e.g. "Nie masz konta? Załóż konto" */
  footer?: ReactNode;
  children: ReactNode;
};

// Shared page frame for login / register / password reset screens
export const AuthShell = ({
  title,
  subtitle,
  features,
  footer,
  children,
}: Props) => (
  <div className="flex min-h-screen bg-paper text-ink font-sans">
    {/* Side panel — brand + headline (desktop only) */}
    <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-between border-r-2 border-ink px-10 py-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wide hover:underline self-start"
      >
        Diet Tracker
      </Link>
      <div className="flex flex-col gap-8">
        <p className="font-display text-[112px] uppercase leading-[0.85] [font-stretch:62%]">
          Wiesz,
          <br />
          co jesz.
        </p>
        <ul className="border-t-[10px] border-ink">
          {features.map((feature, idx) => (
            <li
              key={feature}
              className="flex items-baseline justify-between gap-4 py-2 border-b border-ink text-[15px] font-bold"
            >
              <span>{feature}</span>
              <span className="font-mono text-xs font-medium">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Form column */}
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
      <div className="w-full max-w-[460px] flex flex-col gap-6">
        <p className="lg:hidden font-display text-[76px] uppercase leading-[0.85] [font-stretch:62%]">
          Wiesz,
          <br />
          co jesz.
        </p>
        <section className="border-2 border-ink bg-card px-3 pt-1.5 pb-4 sm:px-4">
          <h1 className="font-display text-[32px] leading-none">{title}</h1>
          {subtitle && <p className="text-sm pt-1">{subtitle}</p>}
          <div className="rule-thick mt-2 mb-4" />
          {children}
        </section>
        {footer}
      </div>
    </div>
  </div>
);

type AuthFooterLinkProps = { question: string; href: string; label: string };

export const AuthFooterLink = ({
  question,
  href,
  label,
}: AuthFooterLinkProps) => (
  <p className="flex items-center justify-between border-t-2 border-ink pt-3 text-sm">
    <span>{question}</span>
    <Link
      href={href}
      className="min-h-11 flex items-center font-extrabold uppercase hover:text-accent"
    >
      {label} →
    </Link>
  </p>
);
