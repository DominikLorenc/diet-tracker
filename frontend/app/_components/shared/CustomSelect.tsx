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

  // Zamknij dropdown po kliknięciu poza komponentem
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
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white border rounded-xl transition-colors ${
          open
            ? "border-indigo-400 ring-1 ring-indigo-400"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-text-primary" : "text-text-muted"}>
          {selected ? selected.label : placeholder}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
        )}
      </button>

      {/* Lista opcji */}
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-500 font-medium"
                    : "text-text-primary hover:bg-gray-50"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "opacity-100 text-indigo-500" : "opacity-0"}`}
                />
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
