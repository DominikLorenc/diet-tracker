import { Mode } from "./types";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export const ModeToggle = ({ mode, onChange }: Props) => (
  <div role="group" aria-label="Tryb" className="flex border-2 border-ink">
    {(["auto", "manual"] as Mode[]).map((m, idx) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        aria-pressed={mode === m}
        className={`min-h-9 px-3 text-xs font-extrabold uppercase cursor-pointer transition-colors ${
          idx > 0 ? "border-l border-ink" : ""
        } ${mode === m ? "bg-ink text-paper" : "hover:bg-paper"}`}
      >
        {m === "auto" ? "Auto" : "Ręcznie"}
      </button>
    ))}
  </div>
);
