"use client";

import { useRef } from "react";

type Props = {
  date: Date;
  onDateChange: (date: Date) => void;
};

export const DateNavigator = ({ date, onDateChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePrev = () => {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    onDateChange(prevDate);
  };

  const handleNext = () => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(nextDate);
  };

  const formattedDate = date.toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5">
      <button
        onClick={handlePrev}
        className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* kliknięcie w datę otwiera kalendarz */}
      <button
        onClick={() => inputRef.current?.showPicker()}
        className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity"
      >
        <span className="text-sm font-semibold text-white capitalize">{formattedDate}</span>
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
        className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
