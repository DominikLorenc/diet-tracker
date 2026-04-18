import type { Measurement } from "@/app/_types/measurements";

type Props = {
  measurements: Measurement[];
  onEdit: (m: Measurement) => void;
  onDelete: (id: string) => void;
};

const fmt = (date: string) => new Date(date).toLocaleDateString("pl-PL");

const headerCell =
  "font-['IBM_Plex_Mono'] text-[11px] font-bold tracking-[2px] text-[#4ADE80] shrink-0";
const monoCell =
  "font-['IBM_Plex_Mono'] text-sm font-semibold text-[#F3F7FF] shrink-0";
const dateCell = "font-['Funnel_Sans'] text-sm text-[#D6DFEC] shrink-0";

export const MeasurementHistoryTable = ({
  measurements,
  onEdit,
  onDelete,
}: Props) => {
  if (measurements.length === 0) {
    return (
      <p className="px-4 py-8 text-center font-['Funnel_Sans'] text-sm text-[#9FB0C7]">
        Brak pomiarów
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div
        className="flex items-center bg-[#1A2B1F] px-3.5 py-2.5"
        style={{ borderTop: "1px solid #1E3322" }}
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
          className={`flex items-center px-3.5 py-3.5 ${i % 2 === 0 ? "bg-[#162218]" : "bg-[#1A2B1F]"}`}
          style={{ borderTop: "1px solid #1E3322" }}
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
              className="text-[#8D9DB4] transition-colors hover:text-[#F3F7FF]"
              aria-label="Edytuj"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(m.id)}
              className="text-[#8D9DB4] transition-colors hover:text-red-400"
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
