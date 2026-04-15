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
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-opacity hover:opacity-80 font-sans border ${
          open ? "border-dash-green-mid/40" : "border-dash-border"
        } bg-dash-surface-alt`}
      >
        <span className={selected ? "text-dash-fg" : "text-dash-fg-muted"}>
          {selected ? selected.label : placeholder}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-dash-green shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-dash-fg-muted shrink-0" />
        )}
      </button>

      {/* Lista opcji */}
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-dash-surface-alt border border-dash-border rounded-xl overflow-hidden shadow-lg">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm cursor-pointer transition-opacity font-sans ${
                  isSelected
                    ? "bg-macro-track text-macro-calories font-medium"
                    : "text-dash-fg hover:opacity-70"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 shrink-0 text-macro-calories ${isSelected ? "opacity-100" : "opacity-0"}`}
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
