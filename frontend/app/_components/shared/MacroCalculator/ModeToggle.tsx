import { Mode } from "./types";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export const ModeToggle = ({ mode, onChange }: Props) => (
  <div className="flex gap-1 p-0.5 bg-indigo-50 border border-indigo-100 rounded-full">
    {(["auto", "manual"] as Mode[]).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          mode === m
            ? "bg-indigo-500 text-white shadow-sm"
            : "text-indigo-500 hover:text-indigo-700"
        }`}
      >
        {m === "auto" ? "Auto" : "Ręcznie"}
      </button>
    ))}
  </div>
);
