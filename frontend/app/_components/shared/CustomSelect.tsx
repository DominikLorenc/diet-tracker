"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

type Option<T extends string | number> = {
  label: string;
  value: T;
};

type Props<T extends string | number> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
};

export function CustomSelect<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Wybierz...",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between h-11 px-3 text-[15px] border-2 border-ink bg-card cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className={selected ? "text-ink" : "text-ink-muted"}>
          {selected ? selected.label : placeholder}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" />
        )}
      </button>

      {/* Lista opcji */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 -mt-0.5 w-full bg-card border-2 border-ink shadow-[var(--shadow-hard)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 min-h-11 px-3 text-[15px] text-left cursor-pointer border-b border-ink last:border-b-0 ${
                    isSelected
                      ? "bg-ink text-paper font-bold"
                      : "hover:bg-paper"
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`}
                  />
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
