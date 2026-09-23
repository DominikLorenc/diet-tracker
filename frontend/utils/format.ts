/**
 * Formats a nutrition amount for display, e.g. 8.199999999 → "8,2".
 * Accepts strings because Prisma Decimal values arrive as strings.
 */
export function formatAmount(
  value: number | string,
  maxFractionDigits = 1,
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("pl-PL", {
    maximumFractionDigits: maxFractionDigits,
  });
}

type PluralForms = {
  /** 1 pozycja */
  one: string;
  /** 2–4 pozycje (also 22–24, 32–34 …) */
  few: string;
  /** 0, 5–21, 25–31 … pozycji */
  many: string;
};

/** Polish plural: pluralPl(3, forms) → "3 pozycje" */
export function pluralPl(count: number, forms: PluralForms): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (count === 1) return `1 ${forms.one}`;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} ${forms.few}`;
  }
  return `${count} ${forms.many}`;
}
