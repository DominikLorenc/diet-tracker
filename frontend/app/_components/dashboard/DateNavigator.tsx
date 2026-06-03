"use client";

import { useRef } from "react";

type Props = {
  date: Date;
  onDateChange: (date: Date) => void;
};

export const DateNavigator = ({ date, onDateChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePrev = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const formattedDate = date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="flex items-center justify-between px-4 h-[46px] rounded-xl"
      style={{
        background: "var(--color-dash-surface)",
        border: "1px solid var(--color-dash-border)",
      }}
    >
      <button
        onClick={handlePrev}
        className="text-lg font-bold leading-none transition-opacity hover:opacity-70 px-1"
        style={{ color: "var(--color-dash-nav-arrow)" }}
      >
        ‹
      </button>

      <button
        onClick={() => inputRef.current?.showPicker()}
        className="text-sm font-semibold capitalize transition-opacity hover:opacity-70"
        style={{ color: "var(--color-dash-nav-text)" }}
      >
        {formattedDate}
      </button>

      <input
        ref={inputRef}
        type="date"
        value={date.toISOString().split("T")[0]}
        onChange={(e) => onDateChange(new Date(e.target.value))}
        className="sr-only"
      />

      <button
        onClick={handleNext}
        className="text-lg font-bold leading-none transition-opacity hover:opacity-70 px-1"
        style={{ color: "var(--color-dash-nav-arrow)" }}
      >
        ›
      </button>
    </div>
  );
};
