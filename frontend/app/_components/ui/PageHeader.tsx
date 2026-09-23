import { ReactNode } from "react";

type Props = {
  title: string;
  /** Small mono line above the title (date, context) */
  eyebrow?: string;
  /** Button or link aligned to the bottom-right of the header */
  action?: ReactNode;
};

// Page title in the nutrition-label style: mono eyebrow + narrow, heavy heading
export const PageHeader = ({ title, eyebrow, action }: Props) => (
  <header className="flex items-end justify-between gap-3">
    <div className="flex flex-col gap-0.5 min-w-0">
      {eyebrow && (
        <span className="font-mono text-xs font-medium uppercase tracking-wide">
          {eyebrow}
        </span>
      )}
      <h1 className="font-display text-[44px] sm:text-[52px] lg:text-[72px] uppercase leading-[0.9] [font-stretch:68%] break-words">
        {title}
      </h1>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
);

type PageWidth = "narrow" | "wide";

const PAGE_MAX_WIDTH: Record<PageWidth, string> = {
  narrow: "max-w-3xl",
  wide: "max-w-[1280px]",
};

/** Shared page padding/width for dashboard screens */
export const pageClass = (width: PageWidth = "wide") =>
  `flex flex-col gap-5 px-4 pt-5 pb-8 sm:px-8 sm:pt-6 w-full ${PAGE_MAX_WIDTH[width]}`;
