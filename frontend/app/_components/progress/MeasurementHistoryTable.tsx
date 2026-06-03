import type { Measurement } from "@/app/_types/measurements";

type Props = {
  measurements: Measurement[];
  onEdit: (m: Measurement) => void;
  onDelete: (id: string) => void;
};

const fmt = (date: string) => new Date(date).toLocaleDateString("pl-PL");

const headerCell =
  "font-['IBM_Plex_Mono'] text-[11px] font-bold tracking-[2px] text-dash-green shrink-0";
const monoCell =
  "font-['IBM_Plex_Mono'] text-sm font-semibold text-dash-fg shrink-0";
const dateCell = "font-['Funnel_Sans'] text-sm text-dash-fg-bright shrink-0";

export const MeasurementHistoryTable = ({
  measurements,
  onEdit,
  onDelete,
}: Props) => {
  if (measurements.length === 0) {
    return (
      <p className="px-4 py-8 text-center font-['Funnel_Sans'] text-sm text-dash-fg-dim">
        Brak pomiarów
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div
        className="flex items-center bg-dash-surface-alt px-3.5 py-2.5"
        style={{ borderTop: "1px solid var(--color-dash-border)" }}
      >
        <span className={headerCell} style={{ width: 160 }}>
          DATA
        </span>
        <span className={headerCell} style={{ width: 120 }}>
          WAGA
        </span>
        <span
          className={`${headerCell} hidden md:block`}
          style={{ width: 120 }}
        >
          TALIA
        </span>
        <span
          className={`${headerCell} hidden md:block`}
          style={{ width: 120 }}
        >
          BIODRA
        </span>
        <span
          className={`${headerCell} hidden md:block`}
          style={{ width: 120 }}
        >
          RAMIĘ
        </span>
        <span className={headerCell} style={{ width: 90 }}>
          AKCJE
        </span>
      </div>

      {/* Rows */}
      {measurements.map((m, i) => (
        <div
          key={m.id}
          className={`flex items-center px-3.5 py-3.5 ${i % 2 === 0 ? "bg-dash-surface" : "bg-dash-surface-alt"}`}
          style={{ borderTop: "1px solid var(--color-dash-border)" }}
        >
          <span className={dateCell} style={{ width: 160 }}>
            {fmt(m.date)}
          </span>
          <span className={monoCell} style={{ width: 120 }}>
            {m.weight} kg
          </span>
          <span
            className={`${monoCell} hidden md:block`}
            style={{ width: 120 }}
          >
            {m.waist} cm
          </span>
          <span
            className={`${monoCell} hidden md:block`}
            style={{ width: 120 }}
          >
            {m.hips} cm
          </span>
          <span
            className={`${monoCell} hidden md:block`}
            style={{ width: 120 }}
          >
            {m.arm} cm
          </span>
          <div className="flex shrink-0 gap-2" style={{ width: 90 }}>
            <button
              onClick={() => onEdit(m)}
              className="text-dash-fg-subtle transition-colors hover:text-dash-fg"
              aria-label="Edytuj"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(m.id)}
              className="text-dash-fg-subtle transition-colors hover:text-red-400"
              aria-label="Usuń"
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
