"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  title: string;
  date: Date;
  onDateChange: (date: Date) => void;
};

const WEEKDAY_LABELS = ["PN", "WT", "ŚR", "CZ", "PT", "SO", "ND"];

// Noon avoids the day flipping when the date is later serialized with
// toISOString() (UTC) in a timezone ahead of UTC.
function atNoon(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = atNoon(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekDays(date: Date) {
  // getDay(): 0 = Sunday — shift so the week starts on Monday
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = addDays(date, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export const DateNavigator = ({ title, date, onDateChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const today = new Date();
  const weekDays = getWeekDays(date);

  const formattedDate = date.toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => inputRef.current?.showPicker()}
            className="self-start font-mono text-xs font-medium uppercase tracking-wide hover:underline cursor-pointer"
            aria-label="Wybierz datę z kalendarza"
          >
            {formattedDate}
          </button>
          <h1 className="font-display text-[52px] lg:text-[72px] uppercase leading-[0.9] [font-stretch:68%]">
            {title}
          </h1>
        </div>
        <div className="flex">
          <button
            onClick={() => onDateChange(addDays(date, -1))}
            aria-label="Poprzedni dzień"
            className="w-11 h-11 border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} strokeWidth={2.5} strokeLinecap="square" />
          </button>
          <button
            onClick={() => onDateChange(addDays(date, 1))}
            aria-label="Następny dzień"
            className="w-11 h-11 border-2 border-l-0 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          >
            <ChevronRight size={18} strokeWidth={2.5} strokeLinecap="square" />
          </button>
        </div>
      </header>

      <input
        ref={inputRef}
        type="date"
        value={date.toISOString().split("T")[0]}
        onChange={(e) =>
          e.target.value && onDateChange(new Date(`${e.target.value}T12:00`))
        }
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <nav
        aria-label="Tydzień"
        className="grid grid-cols-7 border-2 border-ink lg:max-w-[520px]"
      >
        {weekDays.map((day, idx) => {
          const isSelected = isSameDay(day, date);
          const isFuture = day > today && !isSameDay(day, today);
          return (
            <button
              key={day.toDateString()}
              onClick={() => onDateChange(day)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={day.toLocaleDateString("pl-PL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              className={`flex flex-col items-center py-1.5 font-mono cursor-pointer transition-colors ${
                idx > 0 ? "border-l border-ink" : ""
              } ${
                isSelected
                  ? "bg-ink text-paper"
                  : isFuture
                    ? "text-ink-muted hover:bg-card"
                    : "hover:bg-card"
              }`}
            >
              <span className="text-[11px]">{WEEKDAY_LABELS[idx]}</span>
              <span
                className={`text-base font-semibold ${
                  isSameDay(day, today) && !isSelected
                    ? "underline underline-offset-4 decoration-2"
                    : ""
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
