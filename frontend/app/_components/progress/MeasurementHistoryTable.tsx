import { Pencil, Trash2 } from "lucide-react";
import type { Measurement } from "@/app/_types/measurements";

type Props = {
  measurements: Measurement[];
  onEdit: (m: Measurement) => void;
  onDelete: (id: string) => void;
};

const fmt = (date: string) =>
  new Date(date).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const fmtValue = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("pl-PL");

const headCell = "py-2 text-xs font-extrabold uppercase text-right";

export const MeasurementHistoryTable = ({
  measurements,
  onEdit,
  onDelete,
}: Props) => {
  if (measurements.length === 0) {
    return (
      <p className="mt-3 py-6 px-4 border-2 border-dashed border-ink text-sm font-extrabold uppercase">
        Brak pomiarów w tym okresie
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse font-mono text-sm">
        <thead>
          <tr className="border-b border-ink font-sans">
            <th scope="col" className={`${headCell} text-left`}>
              Data
            </th>
            <th scope="col" className={headCell}>
              Waga
            </th>
            <th scope="col" className={headCell}>
              Talia
            </th>
            <th scope="col" className={`${headCell} hidden sm:table-cell`}>
              Biodra
            </th>
            <th scope="col" className={`${headCell} hidden sm:table-cell`}>
              Ramię
            </th>
            <th scope="col" className="w-[88px]">
              <span className="sr-only">Akcje</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m, idx) => (
            <tr key={m.id} className="border-b border-ink">
              <td className={`py-1 ${idx === 0 ? "font-semibold" : ""}`}>
                {fmt(m.date)}
              </td>
              <td className={`text-right ${idx === 0 ? "font-semibold" : ""}`}>
                {fmtValue(m.weight)}
              </td>
              <td className="text-right">{fmtValue(m.waist)}</td>
              <td className="text-right hidden sm:table-cell">
                {fmtValue(m.hips)}
              </td>
              <td className="text-right hidden sm:table-cell">
                {fmtValue(m.arm)}
              </td>
              <td className="text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(m)}
                  className="w-11 h-11 inline-flex items-center justify-center hover:text-accent transition-colors cursor-pointer"
                  aria-label={`Edytuj pomiar z ${fmt(m.date)}`}
                >
                  <Pencil size={15} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onDelete(m.id)}
                  className="w-11 h-11 inline-flex items-center justify-center text-ink-muted hover:text-accent transition-colors cursor-pointer"
                  aria-label={`Usuń pomiar z ${fmt(m.date)}`}
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
