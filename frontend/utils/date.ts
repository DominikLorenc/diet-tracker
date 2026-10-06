/**
 * Calendar-date helpers working in the user's LOCAL timezone.
 *
 * `toISOString()` converts to UTC first, so in Poland (UTC+1/+2) it returns
 * yesterday's date between midnight and 1–2 AM. Always use these instead.
 */

/** Date → "YYYY-MM-DD" using local year/month/day. */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's local date as "YYYY-MM-DD". */
export function todayLocal(): string {
  return toLocalDateString(new Date());
}

/**
 * "YYYY-MM-DD" → Date at local noon.
 * `new Date("YYYY-MM-DD")` is parsed as UTC midnight, which shows as the
 * previous day in timezones behind UTC. Noon also keeps the day stable
 * when adding days across DST changes.
 */
export function parseLocalDate(value: string): Date {
  return new Date(`${value}T12:00`);
}
