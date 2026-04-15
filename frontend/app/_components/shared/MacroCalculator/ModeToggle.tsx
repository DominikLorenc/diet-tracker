import { Mode } from "./types";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export const ModeToggle = ({ mode, onChange }: Props) => (
  <div className="flex gap-1 p-0.5 bg-[#0F1A10] border border-dash-border rounded-full">
    {(["auto", "manual"] as Mode[]).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        className={`px-3 py-1 rounded-full text-xs font-semibold font-sans transition-opacity ${
          mode === m
            ? "bg-gradient-green text-white shadow-green-glow"
            : "text-dash-fg-muted hover:opacity-80"
        }`}
      >
        {m === "auto" ? "Auto" : "Ręcznie"}
      </button>
    ))}
  </div>
);
